import numpy as np
from collections import deque
import time

class AnomalyDetector:
    def __init__(self, window_size=20):
        self.window_size = window_size
        self.history = {}
        self.baselines = {}
        self.trained = {}

    def update(self, eq_id, sensor_values):
        if eq_id not in self.history:
            self.history[eq_id] = {}
            self.baselines[eq_id] = {}
            self.trained[eq_id] = False

        for key, val in sensor_values.items():
            if key not in self.history[eq_id]:
                self.history[eq_id][key] = deque(maxlen=self.window_size)
            self.history[eq_id][key].append(val)

        # train baseline after enough data
        if all(len(v) >= self.window_size for v in self.history[eq_id].values()):
            self.trained[eq_id] = True
            for key, vals in self.history[eq_id].items():
                arr = np.array(vals)
                self.baselines[eq_id][key] = {
                    'mean': float(np.mean(arr)),
                    'std': max(float(np.std(arr)), 0.001)
                }

    def predict(self, eq_id, sensor_values):
        if not self.trained.get(eq_id, False):
            return {
                'anomaly_score': 0.0,
                'predicted_risk': 0.0,
                'anomalous_sensors': [],
                'prediction': 'Collecting baseline data...',
                'confidence': 0.0
            }

        scores = []
        anomalous = []

        for key, val in sensor_values.items():
            if key in self.baselines[eq_id]:
                mean = self.baselines[eq_id][key]['mean']
                std = self.baselines[eq_id][key]['std']
                z_score = abs((val - mean) / std)
                scores.append(z_score)
                if z_score > 2.0:
                    anomalous.append({
                        'sensor': key,
                        'z_score': round(z_score, 2),
                        'deviation': f"{round((val - mean) / mean * 100, 1)}%"
                    })

        if not scores:
            return {
                'anomaly_score': 0.0,
                'predicted_risk': 0.0,
                'anomalous_sensors': [],
                'prediction': 'All sensors nominal',
                'confidence': 0.0
            }

        avg_score = float(np.mean(scores))
        max_score = float(np.max(scores))

        # normalize to 0-100
        anomaly_score = min(100, avg_score * 25)
        predicted_risk = min(100, max_score * 20)

        confidence = min(99, len(self.history[eq_id][list(sensor_values.keys())[0]]) * 4)

        if predicted_risk > 70:
            prediction = 'FAULT IMMINENT — Immediate action required'
        elif predicted_risk > 45:
            prediction = 'ANOMALY DETECTED — Monitor closely'
        elif predicted_risk > 20:
            prediction = 'SLIGHT DEVIATION — Within tolerance'
        else:
            prediction = 'All parameters nominal'

        return {
            'anomaly_score': round(anomaly_score, 1),
            'predicted_risk': round(predicted_risk, 1),
            'anomalous_sensors': anomalous,
            'prediction': prediction,
            'confidence': round(confidence, 0)
        }


class OreBodyPredictor:
    def __init__(self):
        self.zones = {
            'Zone A': {'depth': 45, 'grade': 62.3, 'confidence': 88},
            'Zone B': {'depth': 78, 'grade': 58.7, 'confidence': 72},
            'Zone C': {'depth': 112, 'grade': 71.2, 'confidence': 65},
            'Zone D': {'depth': 156, 'grade': 45.8, 'confidence': 51},
        }
        self.total_estimate = 2.4  # million tonnes

    def get_prediction(self):
        # simulate slight variations
        result = {}
        for zone, data in self.zones.items():
            noise = np.random.uniform(-0.5, 0.5)
            result[zone] = {
                'depth_m': data['depth'],
                'fe_grade': round(data['grade'] + noise, 1),
                'confidence_pct': data['confidence'],
                'status': 'High Grade' if data['grade'] > 60 else 'Medium Grade'
            }
        return {
            'zones': result,
            'total_estimate_mt': self.total_estimate,
            'best_zone': 'Zone C',
            'recommendation': 'Prioritize drilling in Zone C — highest Fe grade at 71.2%'
        }


class StructuralRiskAnalyzer:
    def __init__(self):
        self.tunnel_sections = {
            'Section 1 (0-20m)': 0.12,
            'Section 2 (20-40m)': 0.08,
            'Section 3 (40-60m)': 0.31,
            'Section 4 (60-80m)': 0.18,
        }
        self.t = 0

    def analyze(self, sensor_data):
        self.t += 1
        results = {}
        for section, base_risk in self.tunnel_sections.items():
            # factor in vibration data from sensors
            vibration_factor = 1.0
            for eq_id, data in sensor_data.items():
                for s in data.get('sensors', []):
                    if 'Vibration' in s['name'] and s['alert']:
                        vibration_factor = 1.45

            noise = np.random.uniform(-0.03, 0.03)
            risk = min(1.0, base_risk * vibration_factor + noise)
            risk_pct = round(risk * 100, 1)

            results[section] = {
                'risk_score': risk_pct,
                'level': 'HIGH' if risk_pct > 40 else 'MEDIUM' if risk_pct > 20 else 'LOW',
                'color': '#ff4444' if risk_pct > 40 else '#ff8800' if risk_pct > 20 else '#00cc66'
            }

        return results