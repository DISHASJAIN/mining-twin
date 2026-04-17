import { useEffect, useState } from 'react'

export default function Sidebar({ equipment, liveData, onClose }) {
  const [current, setCurrent] = useState(equipment)

  useEffect(() => {
    if (!equipment) return
    const live = liveData?.[equipment.id]
    if (live) {
      setCurrent({ ...equipment, ...live })
    } else {
      setCurrent(equipment)
    }
  }, [liveData, equipment])

  if (!current) return null

  return (
    <div style={{
      width: 300,
      height: '100%',
      background: '#0a0600',
      borderLeft: '1px solid #2a1500',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
      zIndex: 50
    }}>
      {/* header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #1a0d00',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0d0700'
      }}>
        <div>
          <div style={{ color: '#ffd79a', fontWeight: 500, fontSize: 16 }}>
            {current.id}
          </div>
          <div style={{ color: '#7a5030', fontSize: 12, marginTop: 2 }}>
            {current.type}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none',
          color: '#ff4444', fontSize: 22,
          cursor: 'pointer', padding: '0 4px'
        }}>×</button>
      </div>

      {/* status badge */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a0d00' }}>
        <span style={{
          fontSize: 12, padding: '4px 12px',
          borderRadius: 20, fontWeight: 500,
          background: current.status === 'critical' ? 'rgba(255,68,68,0.15)' :
            current.status === 'warning' ? 'rgba(255,136,0,0.15)' :
            'rgba(0,204,102,0.15)',
          color: current.status === 'critical' ? '#ff4444' :
            current.status === 'warning' ? '#ff8800' : '#00cc66',
          border: `1px solid ${current.status === 'critical' ? '#ff4444' :
            current.status === 'warning' ? '#ff8800' : '#00cc66'}`,
        }}>
          {current.status?.toUpperCase()}
        </span>
        <span style={{
          marginLeft: 10, fontSize: 12,
          color: '#7a5030'
        }}>
          {current.zone}
        </span>
      </div>

      {/* sensors */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a0d00' }}>
        <div style={{
          fontSize: 10, color: '#7a5030',
          marginBottom: 10, letterSpacing: 1.5
        }}>
          LIVE SENSOR DATA ● UPDATING
        </div>
        {current.sensors?.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid #150a00'
          }}>
            <span style={{ fontSize: 13, color: '#aa7755' }}>{s.name}</span>
            <span style={{
              fontSize: 13, fontWeight: 500,
              fontFamily: 'monospace',
              color: s.alert ? '#ff4444' : '#00cc66'
            }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* risk score */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a0d00' }}>
        <div style={{
          fontSize: 10, color: '#7a5030',
          marginBottom: 8, letterSpacing: 1.5
        }}>
          AI RISK SCORE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, height: 6,
            background: '#1a0d00', borderRadius: 3, overflow: 'hidden'
          }}>
            <div style={{
              width: `${current.riskScore || 0}%`,
              height: '100%',
              background: (current.riskScore || 0) > 65 ? '#ff4444' :
                (current.riskScore || 0) > 35 ? '#ff8800' : '#00cc66',
              borderRadius: 3,
              transition: 'width 0.5s'
            }} />
          </div>
          <span style={{
            fontSize: 16, fontWeight: 500,
            fontFamily: 'monospace',
            color: (current.riskScore || 0) > 65 ? '#ff4444' :
              (current.riskScore || 0) > 35 ? '#ff8800' : '#00cc66'
          }}>
            {current.riskScore || 0}%
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#7a5030', marginTop: 6 }}>
          {(current.riskScore || 0) > 65 ? '⚠ Immediate attention required' :
            (current.riskScore || 0) > 35 ? '◉ Monitor closely' :
            '✓ Operating normally'}
        </div>
      </div>

      {/* ai prediction */}
      {current.ai && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a0d00' }}>
          <div style={{
            fontSize: 10, color: '#7a5030',
            marginBottom: 8, letterSpacing: 1.5
          }}>
            AI PREDICTION
          </div>
          <div style={{
            fontSize: 12,
            color: current.ai.predicted_risk > 70 ? '#ff4444' :
              current.ai.predicted_risk > 45 ? '#ff8800' : '#00cc66',
            marginBottom: 8
          }}>
            {current.ai.prediction}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              ['Anomaly', current.ai.anomaly_score + '%'],
              ['Risk', current.ai.predicted_risk + '%'],
              ['Confidence', current.ai.confidence + '%'],
            ].map(([label, val]) => (
              <div key={label} style={{
                flex: 1, padding: '6px 8px',
                background: '#150a00', borderRadius: 6,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 10, color: '#5a3a20' }}>{label}</div>
                <div style={{
                  fontSize: 14, fontFamily: 'monospace',
                  color: '#ffcc88', fontWeight: 500
                }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* equipment info */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a0d00' }}>
        <div style={{
          fontSize: 10, color: '#7a5030',
          marginBottom: 8, letterSpacing: 1.5
        }}>
          EQUIPMENT INFO
        </div>
        {[
          ['Last Maintenance', current.lastMaintenance],
          ['Next Service', current.nextService],
          ['Zone', current.zone],
        ].map(([label, val]) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '5px 0', borderBottom: '1px solid #150a00'
          }}>
            <span style={{ fontSize: 12, color: '#7a5030' }}>{label}</span>
            <span style={{ fontSize: 12, color: '#aa7755' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* data sources */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          fontSize: 10, color: '#7a5030',
          marginBottom: 8, letterSpacing: 1.5
        }}>
          DATA SOURCES
        </div>
        {['SCADA', 'IoT Sensors', 'Historian', 'GIS', 'Maintenance Log'].map((src) => (
          <div key={src} style={{
            padding: '5px 10px', marginBottom: 4,
            background: '#150a00', borderRadius: 6,
            fontSize: 12, color: '#7a5030',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <div style={{
              width: 6, height: 6,
              borderRadius: '50%', background: '#00cc66'
            }} />
            {src}
          </div>
        ))}
      </div>
    </div>
  )
}