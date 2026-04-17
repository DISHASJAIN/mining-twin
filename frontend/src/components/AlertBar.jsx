import { useState, useEffect } from 'react'

const staticAlerts = [
  { id: 1, msg: 'CONVEYOR CV-101: Temperature critical — 87°C', color: '#ff4444' },
  { id: 2, msg: 'GAS SENSOR GS-203: Methane level elevated — Zone 3', color: '#ff8800' },
  { id: 3, msg: 'PUMP PM-305: Vibration anomaly detected', color: '#ff8800' },
  { id: 4, msg: 'ALL SYSTEMS NORMAL — Zone 1 & Zone 2', color: '#00cc66' },
]

export default function AlertBar({ liveData, connected }) {
  const [current, setCurrent] = useState(0)

  // build dynamic alerts from live data
  const liveAlerts = Object.values(liveData).filter(eq => eq.status === 'critical' || eq.status === 'warning')

  const alerts = liveAlerts.length > 0
    ? liveAlerts.map(eq => ({
        id: eq.id,
        msg: `${eq.id}: ${eq.status.toUpperCase()} — Risk Score ${eq.riskScore}%${eq.inFault ? ' ⚠ FAULT DETECTED' : ''}`,
        color: eq.status === 'critical' ? '#ff4444' : '#ff8800'
      }))
    : staticAlerts

  useEffect(() => {
    if (alerts.length === 0) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % alerts.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [alerts.length])

  const alert = alerts[Math.min(current, alerts.length - 1)]

  return (
    <div style={{
      width: '100%', background: '#0a0500',
      borderBottom: '1px solid #2a1500',
      padding: '8px 20px',
      display: 'flex', alignItems: 'center', gap: '12px',
      zIndex: 100, flexShrink: 0
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: alert.color,
        boxShadow: `0 0 8px ${alert.color}`,
        flexShrink: 0, animation: 'pulse 1s infinite'
      }} />
      <span style={{ color: alert.color, fontSize: 13, fontWeight: 500, letterSpacing: 0.3 }}>
        {alert.msg}
      </span>
      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: connected ? '#00cc66' : '#ff4444',
          boxShadow: connected ? '0 0 6px #00cc66' : '0 0 6px #ff4444'
        }} />
        <span style={{ color: connected ? '#00cc66' : '#ff4444', fontSize: 11, letterSpacing: 1 }}>
          {connected ? 'BACKEND LIVE' : 'CONNECTING...'}
        </span>
        <span style={{ color: '#333', fontSize: 11, marginLeft: 8 }}>
          MINE SITE INDIA
        </span>
      </span>
    </div>
  )
}