import asyncio
import random
import math
import time
import socketio
from ai_model import AnomalyDetector, OreBodyPredictor, StructuralRiskAnalyzer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
socket_app = socketio.ASGIApp(sio, app)

# Base sensor values for each equipment
base_values = {
    'CV-101': {
        'temperature': 72.0,
        'belt_speed': 2.1,
        'load': 400.0,
        'vibration': 5.0,
    },
    'GS-203': {
        'methane': 0.8,
        'co_level': 8.0,
        'o2_level': 20.9,
        'humidity': 68.0,
    },
    'PM-305': {
        'flow_rate': 320.0,
        'pressure': 4.0,
        'vibration': 4.5,
        'motor_temp': 55.0,
    },
    'SK-801': {
        'feed_rate': 820.0,
        'screen_efficiency': 94.0,
        'motor_load': 65.0,
        'temperature': 40.0,
    },
    'DR-601': {
        'drill_speed': 115.0,
        'torque': 360.0,
        'depth': 40.0,
        'temperature': 44.0,
    },
}

# Thresholds — above these = alert
thresholds = {
    'CV-101': {
        'temperature': 80.0,
        'belt_speed': 3.0,
        'load': 450.0,
        'vibration': 7.0,
    },
    'GS-203': {
        'methane': 1.5,
        'co_level': 10.0,
        'o2_level': 19.5,
        'humidity': 80.0,
    },
    'PM-305': {
        'flow_rate': 400.0,
        'pressure': 5.0,
        'vibration': 6.0,
        'motor_temp': 65.0,
    },
    'SK-801': {
        'feed_rate': 900.0,
        'screen_efficiency': 85.0,
        'motor_load': 85.0,
        'temperature': 55.0,
    },
    'DR-601': {
        'drill_speed': 140.0,
        'torque': 420.0,
        'depth': 60.0,
        'temperature': 58.0,
    },
}

# Current state
current_values = {k: dict(v) for k, v in base_values.items()}
fault_mode = {k: False for k in base_values}
fault_timer = {k: 0 for k in base_values}
detector = AnomalyDetector(window_size=20)
ore_predictor = OreBodyPredictor()
structural_analyzer = StructuralRiskAnalyzer()

def calculate_risk(eq_id, values):
    thresh = thresholds[eq_id]
    alerts = 0
    total = len(values)
    for key, val in values.items():
        t = thresh.get(key, 9999)
        # o2 alert when TOO LOW
        if key == 'o2_level':
            if val < t:
                alerts += 1
        elif key == 'screen_efficiency':
            if val < t:
                alerts += 1
        else:
            if val > t:
                alerts += 1
    base_risk = (alerts / total) * 100
    # add some noise
    noise = random.uniform(-5, 5)
    return max(0, min(100, round(base_risk + noise, 1)))

def get_status(risk):
    if risk >= 65:
        return 'critical'
    elif risk >= 35:
        return 'warning'
    return 'normal'

def simulate_step(eq_id):
    vals = current_values[eq_id]
    base = base_values[eq_id]
    t = time.time()

    if not fault_mode[eq_id] and random.random() < 0.015:
        fault_mode[eq_id] = True
        fault_timer[eq_id] = 0

    if fault_mode[eq_id]:
        fault_timer[eq_id] += 1
        factor = min(1.0, fault_timer[eq_id] / 20)
        for key in base:
            thresh = thresholds[eq_id].get(key, base[key] * 1.3)
            if key in ('o2_level', 'screen_efficiency'):
                target = thresh * 0.88
            else:
                target = thresh * 1.18
            vals[key] += (target - vals[key]) * 0.08 * factor
        if fault_timer[eq_id] > 25:
            fault_mode[eq_id] = False
    else:
        for key in base:
            b = base[key]
            wave = math.sin(t * 0.3 + hash(eq_id + key) % 100) * b * 0.04
            noise = random.uniform(-b * 0.02, b * 0.02)
            vals[key] = round(b + wave + noise, 2)

    current_values[eq_id] = vals
    return vals

def build_payload(eq_id):
    vals = simulate_step(eq_id)
    risk = calculate_risk(eq_id, vals)
    status = get_status(risk)

    # build sensor list matching frontend format
    sensor_map = {
        'CV-101': [
            {'name': 'Temperature', 'value': f"{vals['temperature']:.1f}°C", 'alert': vals['temperature'] > thresholds['CV-101']['temperature']},
            {'name': 'Belt Speed', 'value': f"{vals['belt_speed']:.2f} m/s", 'alert': vals['belt_speed'] > thresholds['CV-101']['belt_speed']},
            {'name': 'Load', 'value': f"{vals['load']:.0f} kg/m", 'alert': vals['load'] > thresholds['CV-101']['load']},
            {'name': 'Vibration', 'value': f"{vals['vibration']:.2f} mm/s", 'alert': vals['vibration'] > thresholds['CV-101']['vibration']},
        ],
        'GS-203': [
            {'name': 'Methane CH4', 'value': f"{vals['methane']:.2f}% LEL", 'alert': vals['methane'] > thresholds['GS-203']['methane']},
            {'name': 'CO Level', 'value': f"{vals['co_level']:.1f} ppm", 'alert': vals['co_level'] > thresholds['GS-203']['co_level']},
            {'name': 'O2 Level', 'value': f"{vals['o2_level']:.1f}%", 'alert': vals['o2_level'] < thresholds['GS-203']['o2_level']},
            {'name': 'Humidity', 'value': f"{vals['humidity']:.1f}%", 'alert': vals['humidity'] > thresholds['GS-203']['humidity']},
        ],
        'PM-305': [
            {'name': 'Flow Rate', 'value': f"{vals['flow_rate']:.0f} L/min", 'alert': vals['flow_rate'] > thresholds['PM-305']['flow_rate']},
            {'name': 'Pressure', 'value': f"{vals['pressure']:.2f} bar", 'alert': vals['pressure'] > thresholds['PM-305']['pressure']},
            {'name': 'Vibration', 'value': f"{vals['vibration']:.2f} mm/s", 'alert': vals['vibration'] > thresholds['PM-305']['vibration']},
            {'name': 'Motor Temp', 'value': f"{vals['motor_temp']:.1f}°C", 'alert': vals['motor_temp'] > thresholds['PM-305']['motor_temp']},
        ],
        'SK-801': [
            {'name': 'Feed Rate', 'value': f"{vals['feed_rate']:.0f} t/h", 'alert': vals['feed_rate'] > thresholds['SK-801']['feed_rate']},
            {'name': 'Screen Efficiency', 'value': f"{vals['screen_efficiency']:.1f}%", 'alert': vals['screen_efficiency'] < thresholds['SK-801']['screen_efficiency']},
            {'name': 'Motor Load', 'value': f"{vals['motor_load']:.1f}%", 'alert': vals['motor_load'] > thresholds['SK-801']['motor_load']},
            {'name': 'Temperature', 'value': f"{vals['temperature']:.1f}°C", 'alert': vals['temperature'] > thresholds['SK-801']['temperature']},
        ],
        'DR-601': [
            {'name': 'Drill Speed', 'value': f"{vals['drill_speed']:.0f} RPM", 'alert': vals['drill_speed'] > thresholds['DR-601']['drill_speed']},
            {'name': 'Torque', 'value': f"{vals['torque']:.0f} Nm", 'alert': vals['torque'] > thresholds['DR-601']['torque']},
            {'name': 'Depth', 'value': f"{vals['depth']:.1f} m", 'alert': vals['depth'] > thresholds['DR-601']['depth']},
            {'name': 'Temperature', 'value': f"{vals['temperature']:.1f}°C", 'alert': vals['temperature'] > thresholds['DR-601']['temperature']},
        ],
    }

    return {
        'id': eq_id,
        'status': status,
        'riskScore': risk,
        'sensors': sensor_map[eq_id],
        'inFault': fault_mode[eq_id],
    }

@sio.event
async def connect(sid, environ):
    print(f'Client connected: {sid}')

@sio.event
async def disconnect(sid):
    print(f'Client disconnected: {sid}')

async def broadcast_loop():
    await asyncio.sleep(2)
    while True:
        all_data = {}
        raw_values = {}

        for eq_id in base_values:
            payload = build_payload(eq_id)
            raw_values[eq_id] = current_values[eq_id]
            detector.update(eq_id, current_values[eq_id])
            ai_result = detector.predict(eq_id, current_values[eq_id])
            payload['ai'] = ai_result
            all_data[eq_id] = payload

        ore_data = ore_predictor.get_prediction()
        structural_data = structural_analyzer.analyze(all_data)

        await sio.emit('sensor_update', all_data)
        await sio.emit('ore_prediction', ore_data)
        await sio.emit('structural_risk', structural_data)

        await asyncio.sleep(2)

@app.on_event('startup')
async def startup():
    asyncio.create_task(broadcast_loop())

@app.get('/health')
def health():
    return {'status': 'running', 'equipment': list(base_values.keys())}

if __name__ == '__main__':
    uvicorn.run(socket_app, host='0.0.0.0', port=8000)