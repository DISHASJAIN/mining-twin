import { useMemo, useState } from 'react'

export default function AIPanel() {
  const [openPanel, setOpenPanel] = useState(null)

  const orePrediction = useMemo(
    () => ({
      topZone: 'Zone B2',
      depth: '182–196 m',
      estimatedGrade: '64.8% Fe',
      confidence: '91%',
      drillAdvice: 'Recommended primary drilling target',
      modelInputs: ['Drill core samples', 'Magnetic anomaly', 'Density trend', 'Geo survey lines'],
    }),
    []
  )

  const structuralRisk = useMemo(
    () => ({
      topSection: 'Section 3',
      riskScore: 78,
      status: 'High',
      triggerAsset: 'CV-101',
      vibration: '8.2 mm/s',
      action: 'Inspect support bolts and reduce conveyor load',
    }),
    []
  )

  const togglePanel = (panel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel))
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 118,
        right: 14,
        zIndex: 12,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          background: 'rgba(10, 6, 3, 0.92)',
          border: '1px solid rgba(194, 124, 61, 0.35)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.32)',
        }}
      >
        <button
          onClick={() => togglePanel('ore')}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#d89a63',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: 15,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#d89a63',
                boxShadow: '0 0 10px rgba(216,154,99,0.8)',
              }}
            />
            Ore Body Prediction
          </span>
          <span>{openPanel === 'ore' ? '▾' : '▸'}</span>
        </button>

        {openPanel === 'ore' && (
          <div
            style={{
              padding: '0 18px 18px',
              color: '#f3d2ae',
              borderTop: '1px solid rgba(194,124,61,0.18)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div style={{ marginTop: 14, display: 'grid', gap: 8, fontSize: 13, lineHeight: 1.55 }}>
              <div><strong>Highest Grade Zone:</strong> {orePrediction.topZone}</div>
              <div><strong>Target Depth:</strong> {orePrediction.depth}</div>
              <div><strong>Estimated Fe Grade:</strong> {orePrediction.estimatedGrade}</div>
              <div><strong>Confidence:</strong> {orePrediction.confidence}</div>
              <div><strong>Recommendation:</strong> {orePrediction.drillAdvice}</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, opacity: 0.7, letterSpacing: 1.2, marginBottom: 8 }}>
                MODEL INPUTS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {orePrediction.modelInputs.map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)',
                      fontSize: 12,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'rgba(10, 6, 3, 0.92)',
          border: '1px solid rgba(255, 115, 31, 0.35)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.32)',
        }}
      >
        <button
          onClick={() => togglePanel('risk')}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#ff7a1f',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: 15,
            letterSpacing: 1.8,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#ff6b00',
                boxShadow: '0 0 10px rgba(255,107,0,0.85)',
              }}
            />
            Structural Risk
          </span>
          <span>{openPanel === 'risk' ? '▾' : '▸'}</span>
        </button>

        {openPanel === 'risk' && (
          <div
            style={{
              padding: '0 18px 18px',
              color: '#ffd4b0',
              borderTop: '1px solid rgba(255,115,31,0.18)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div style={{ marginTop: 14, display: 'grid', gap: 8, fontSize: 13, lineHeight: 1.55 }}>
              <div><strong>Highest Risk Section:</strong> {structuralRisk.topSection}</div>
              <div><strong>Risk Score:</strong> {structuralRisk.riskScore}/100</div>
              <div><strong>Status:</strong> {structuralRisk.status}</div>
              <div><strong>Trigger Equipment:</strong> {structuralRisk.triggerAsset}</div>
              <div><strong>Vibration:</strong> {structuralRisk.vibration}</div>
              <div><strong>Recommended Action:</strong> {structuralRisk.action}</div>
            </div>

            <div
              style={{
                marginTop: 14,
                height: 10,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${structuralRisk.riskScore}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff9b2f, #ff4d4d)',
                  boxShadow: '0 0 12px rgba(255,100,60,0.45)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}