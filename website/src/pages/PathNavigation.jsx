import { useState, useEffect, useRef } from 'react'

export default function PathNavigation() {
  const [data, setData] = useState(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetch('/final_output.json')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data) return
    drawFrame(currentFrame)
  }, [data, currentFrame])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= data.frames.length - 1) {
            setPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 200)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, data])

  function drawFrame(frameIdx) {
    const canvas = canvasRef.current
    if (!canvas || !data) return
    const ctx = canvas.getContext('2d')
    const frame = data.frames[frameIdx]
    const map = frame.risk_map
    const rows = map.length
    const cols = map[0].length
    const cellW = canvas.width / cols
    const cellH = canvas.height / rows

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw risk map
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const risk = map[r][c]
        const norm = (risk - 5) / 90
        let color
        if (norm < 0.3) {
          // safe — green
          const g = Math.floor(150 + norm * 100)
          color = `rgb(20, ${g}, 60)`
        } else if (norm < 0.6) {
          // medium — yellow
          const r2 = Math.floor(norm * 400)
          color = `rgb(${Math.min(255, r2)}, ${Math.floor(180 - norm * 100)}, 20)`
        } else {
          // danger — red
          const intensity = Math.floor(150 + norm * 100)
          color = `rgb(${Math.min(255, intensity)}, 30, 30)`
        }
        ctx.fillStyle = color
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH)
      }
    }

    // draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 0.5
    for (let r = 0; r < rows; r += 5) {
      ctx.beginPath()
      ctx.moveTo(0, r * cellH)
      ctx.lineTo(canvas.width, r * cellH)
      ctx.stroke()
    }
    for (let c = 0; c < cols; c += 5) {
      ctx.beginPath()
      ctx.moveTo(c * cellW, 0)
      ctx.lineTo(c * cellW, canvas.height)
      ctx.stroke()
    }

    // draw path
    const path = frame.path
    if (path && path.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#00aaff'
      ctx.lineWidth = 2.5
      ctx.setLineDash([6, 3])
      ctx.moveTo(path[0][1] * cellW + cellW / 2, path[0][0] * cellH + cellH / 2)
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][1] * cellW + cellW / 2, path[i][0] * cellH + cellH / 2)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // draw start point
      const start = path[0]
      ctx.beginPath()
      ctx.fillStyle = '#00cc66'
      ctx.arc(start[1] * cellW + cellW / 2, start[0] * cellH + cellH / 2, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      // draw end point
      const end = path[path.length - 1]
      ctx.beginPath()
      ctx.fillStyle = '#ff4444'
      ctx.arc(end[1] * cellW + cellW / 2, end[0] * cellH + cellH / 2, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      // draw robot current position (middle of path)
      const midIdx = Math.floor(path.length / 2)
      const mid = path[midIdx]
      ctx.beginPath()
      ctx.fillStyle = '#1a73e8'
      ctx.arc(mid[1] * cellW + cellW / 2, mid[0] * cellH + cellH / 2, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // robot direction indicator
      ctx.beginPath()
      ctx.fillStyle = 'white'
      ctx.arc(mid[1] * cellW + cellW / 2, mid[0] * cellH + cellH / 2, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function getRiskStats(frameIdx) {
    if (!data) return {}
    const map = data.frames[frameIdx].risk_map
    const flat = map.flat()
    const avg = flat.reduce((a, b) => a + b, 0) / flat.length
    const max = Math.max(...flat)
    const dangerous = flat.filter(v => v > 70).length
    const safe = flat.filter(v => v < 40).length
    return {
      avg: avg.toFixed(1),
      max,
      dangerous,
      safe,
      total: flat.length
    }
  }

  const stats = data ? getRiskStats(currentFrame) : {}
  const frame = data?.frames[currentFrame]

  const mapStats = [
    { label: 'Total Frames', value: data ? data.frames.length : '--', color: '#1a73e8' },
    { label: 'Map Size', value: '80 × 80', color: '#0f9d58' },
    { label: 'Avg Risk Score', value: stats.avg || '--', color: '#f4b400' },
    { label: 'Danger Zones', value: stats.dangerous || '--', color: '#ea4335' },
  ]

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#f8f9ff' }}>
      <div style={{ padding: '48px 80px 32px' }}>
        <span className="section-tag" style={{ background: '#fef9e7', color: '#f57f17' }}>
          Real SLAM Data
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: '#1a1a1a', marginTop: 8 }}>
          RGB-D SLAM Path Navigation
        </h1>
        <p style={{ color: '#666', fontSize: 16, marginTop: 12 }}>
          Real RTAB-Map output — 40 frames of live navigation data with 80×80 risk maps and path planning
        </p>
      </div>

      <div style={{ padding: '0 80px 48px' }}>
        {/* stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20, marginBottom: 32
        }}>
          {mapStats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{
                fontSize: 28, fontWeight: 700,
                color: s.color, marginBottom: 6
              }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* main map canvas */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e8eaed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>
                  Risk Map — Frame {currentFrame + 1} / {data?.frames.length || 0}
                </span>
                <span style={{
                  marginLeft: 12, fontSize: 12, color: '#888'
                }}>
                  {frame?.image}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: '1px solid #e8eaed',
                    background: 'white', cursor: 'pointer',
                    fontSize: 16, color: '#444'
                  }}
                >←</button>
                <button
                  onClick={() => setPlaying(!playing)}
                  style={{
                    padding: '6px 20px', borderRadius: 8,
                    border: 'none',
                    background: playing ? '#ea4335' : '#1a73e8',
                    color: 'white', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600
                  }}
                >
                  {playing ? '⏹ Stop' : '▶ Play'}
                </button>
                <button
                  onClick={() => setCurrentFrame(Math.min((data?.frames.length || 1) - 1, currentFrame + 1))}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: '1px solid #e8eaed',
                    background: 'white', cursor: 'pointer',
                    fontSize: 16, color: '#444'
                  }}
                >→</button>
              </div>
            </div>

            {loading && (
              <div style={{
                height: 480, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#888', fontSize: 16
              }}>
                Loading navigation data...
              </div>
            )}

            {!loading && !data && (
              <div style={{
                height: 480, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 12
              }}>
                <div style={{ fontSize: 32 }}>⚠</div>
                <div style={{ color: '#ea4335', fontWeight: 600 }}>
                  final_output.json not found
                </div>
                <div style={{ color: '#888', fontSize: 13 }}>
                  Copy final_output.json to website/public/ folder
                </div>
              </div>
            )}

            {!loading && data && (
              <canvas
                ref={canvasRef}
                width={600}
                height={480}
                style={{ width: '100%', height: 480, display: 'block' }}
              />
            )}

            {/* timeline slider */}
            {data && (
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #e8eaed',
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ fontSize: 12, color: '#888', minWidth: 60 }}>
                  Frame {currentFrame + 1}
                </span>
                <input
                  type="range"
                  min={0}
                  max={data.frames.length - 1}
                  value={currentFrame}
                  onChange={e => setCurrentFrame(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, color: '#888', minWidth: 60, textAlign: 'right' }}>
                  {data.frames.length} frames
                </span>
              </div>
            )}
          </div>

          {/* right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* risk breakdown */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>
                Risk Zone Breakdown
              </h3>
              {data && [
                {
                  label: 'Safe Zones',
                  value: stats.safe,
                  pct: Math.round(stats.safe / stats.total * 100),
                  color: '#0f9d58'
                },
                {
                  label: 'Medium Risk',
                  value: stats.total - stats.safe - stats.dangerous,
                  pct: Math.round((stats.total - stats.safe - stats.dangerous) / stats.total * 100),
                  color: '#f4b400'
                },
                {
                  label: 'Danger Zones',
                  value: stats.dangerous,
                  pct: Math.round(stats.dangerous / stats.total * 100),
                  color: '#ea4335'
                },
              ].map((z, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 5
                  }}>
                    <span style={{ fontSize: 13, color: '#444' }}>{z.label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: z.color
                    }}>{z.pct}%</span>
                  </div>
                  <div style={{
                    height: 6, background: '#f0f0f0',
                    borderRadius: 3, overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${z.pct}%`, height: '100%',
                      background: z.color, borderRadius: 3,
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* legend */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: '#1a1a1a' }}>
                Map Legend
              </h3>
              {[
                { color: '#14963c', label: 'Safe path (risk 5–40)' },
                { color: '#f4b400', label: 'Caution zone (risk 40–70)' },
                { color: '#ea4335', label: 'Danger zone (risk 70–95)' },
                { color: '#00aaff', label: 'Planned path route' },
                { color: '#00cc66', label: 'Path start point' },
                { color: '#ff4444', label: 'Path end point' },
                { color: '#1a73e8', label: 'Robot position' },
              ].map((l, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  gap: 10, marginBottom: 10
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: l.color, flexShrink: 0
                  }} />
                  <span style={{ fontSize: 13, color: '#666' }}>{l.label}</span>
                </div>
              ))}
            </div>

            {/* system info */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: '#1a1a1a' }}>
                System Info
              </h3>
              {[
                ['Algorithm', 'RTAB-Map SLAM'],
                ['Sensor', 'RGB-D Camera'],
                ['Map Type', '2D Risk Grid'],
                ['Grid Size', '80 × 80 cells'],
                ['Total Frames', data?.frames.length || '--'],
                ['Path Points', frame?.path?.length || '--'],
                ['Status', 'Data Loaded'],
              ].map(([k, v], i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid #f5f5f5'
                }}>
                  <span style={{ fontSize: 12, color: '#888' }}>{k}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: k === 'Status' ? '#0f9d58' : '#1a1a1a'
                  }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}