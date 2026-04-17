import { useState, useRef, useEffect, useCallback } from 'react'

const CLASS_COLORS = {
  'Hardhat': '#0f9d58',
  'Mask': '#0f9d58',
  'NO-Hardhat': '#ea4335',
  'NO-Mask': '#ea4335',
  'NO-Safety Vest': '#ea4335',
  'Person': '#1a73e8',
  'Safety Cone': '#f4b400',
  'Safety Vest': '#0f9d58',
  'machinery': '#9c27b0',
  'vehicle': '#ff6d00',
}

const DANGER = ['NO-Hardhat', 'NO-Mask', 'NO-Safety Vest']

export default function YoloDetection() {
  const [mode, setMode] = useState('upload')
  const [uploadResult, setUploadResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadPreview, setUploadPreview] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraResult, setCameraResult] = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [stats, setStats] = useState({
    total: 0, danger: 0, safe: 0, lastClass: '--'
  })

  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadPreview(URL.createObjectURL(file))
    setUploading(true)
    setUploadResult(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('http://localhost:8001/yolo/detect', {
        method: 'POST', body: form
      })
      const data = await res.json()
      setUploadResult(data)
      updateStats(data.detections)
    } catch (err) {
      alert('YOLO server not running! Start yolo_server.py first.')
    } finally {
      setUploading(false)
    }
  }

  function updateStats(detections) {
    const danger = detections.filter(d => DANGER.includes(d.class_name)).length
    const safe = detections.filter(d => !DANGER.includes(d.class_name)).length
    const last = detections.length > 0 ? detections[0].class_name : '--'
    setStats(prev => ({
      total: prev.total + detections.length,
      danger: prev.danger + danger,
      safe: prev.safe + safe,
      lastClass: last
    }))
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)

      // detect every 2 seconds
      intervalRef.current = setInterval(() => {
        captureAndDetect()
      }, 2000)
    } catch (err) {
      alert('Camera access denied! Please allow camera permission.')
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    clearInterval(intervalRef.current)
    setCameraActive(false)
    setCameraResult(null)
  }

  async function captureAndDetect() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      setDetecting(true)
      const form = new FormData()
      form.append('file', blob, 'frame.jpg')
      try {
        const res = await fetch('http://localhost:8001/yolo/detect', {
          method: 'POST', body: form
        })
        const data = await res.json()
        setCameraResult(data)
        updateStats(data.detections)
      } catch (err) {
        console.error('Detection failed', err)
      } finally {
        setDetecting(false)
      }
    }, 'image/jpeg', 0.85)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#f8f9ff' }}>
      {/* header */}
      <div style={{ padding: '48px 80px 32px' }}>
        <span className="section-tag" style={{ background: '#e6f4ea', color: '#0f9d58' }}>
          AI Vision
        </span>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: '#1a1a1a', marginTop: 8 }}>
          YOLOv8 Safety Detection
        </h1>
        <p style={{ color: '#666', fontSize: 16, marginTop: 12 }}>
          Real-time safety violation detection — Hardhat, Mask, Safety Vest compliance monitoring
        </p>
      </div>

      <div style={{ padding: '0 80px 48px' }}>
        {/* live stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: 20, marginBottom: 32
        }}>
          {[
            { label: 'Total Detections', value: stats.total, color: '#1a73e8' },
            { label: 'Violations Found', value: stats.danger, color: '#ea4335' },
            { label: 'Safe Detections', value: stats.safe, color: '#0f9d58' },
            { label: 'Last Detected', value: stats.lastClass, color: '#f4b400' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{
                fontSize: i === 3 ? 16 : 28,
                fontWeight: 700, color: s.color, marginBottom: 6
              }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* mode toggle */}
        <div style={{
          display: 'flex', gap: 0,
          background: '#f0f0f0',
          borderRadius: 12, padding: 4,
          width: 'fit-content', marginBottom: 28
        }}>
          {[
            { id: 'upload', label: 'Upload Image' },
            { id: 'camera', label: 'Live Camera' },
          ].map(m => (
            <button key={m.id} onClick={() => {
              setMode(m.id)
              if (m.id !== 'camera') stopCamera()
            }} style={{
              padding: '10px 28px', borderRadius: 10,
              border: 'none', cursor: 'pointer',
              background: mode === m.id ? 'white' : 'transparent',
              color: mode === m.id ? '#1a73e8' : '#666',
              fontWeight: mode === m.id ? 600 : 400,
              fontSize: 14,
              boxShadow: mode === m.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* UPLOAD MODE */}
        {mode === 'upload' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* upload area */}
              {!uploadPreview && (
                <div
                  onClick={() => fileRef.current.click()}
                  style={{
                    height: 420, display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', gap: 16,
                    border: '2px dashed #c5d8fc',
                    borderRadius: 16, margin: 20,
                    background: '#f8f9ff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: '#e8f0fe',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 28
                  }}>📷</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
                      Upload an image
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                      JPG, PNG supported · Click to browse
                    </div>
                  </div>
                  <button className="btn-primary" style={{ fontSize: 13, padding: '8px 24px' }}>
                    Choose File
                  </button>
                </div>
              )}

              <input
                ref={fileRef} type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUpload}
              />

              {uploading && (
                <div style={{
                  height: 420, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 16
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    border: '4px solid #e8f0fe',
                    borderTop: '4px solid #1a73e8',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div style={{ color: '#666', fontSize: 15 }}>Detecting objects...</div>
                </div>
              )}

              {!uploading && uploadResult && (
                <div>
                  <img
                    src={uploadResult.annotated_image}
                    alt="Detection result"
                    style={{ width: '100%', display: 'block' }}
                  />
                  <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #e8eaed',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 13, color: '#666' }}>
                      {uploadResult.count} objects detected
                    </span>
                    <button
                      onClick={() => {
                        setUploadResult(null)
                        setUploadPreview(null)
                      }}
                      className="btn-outline"
                      style={{ fontSize: 12, padding: '6px 16px' }}
                    >
                      Upload Another
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* detections list */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>
                Detection Results
              </h3>
              {!uploadResult && (
                <div style={{
                  textAlign: 'center', padding: '40px 0',
                  color: '#888', fontSize: 14
                }}>
                  Upload an image to see detections
                </div>
              )}
              {uploadResult && uploadResult.detections.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '40px 0',
                  color: '#888', fontSize: 14
                }}>
                  No objects detected
                </div>
              )}
              {uploadResult && uploadResult.detections.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: 8,
                  background: DANGER.includes(d.class_name) ?
                    'rgba(234,67,53,0.06)' : 'rgba(15,157,88,0.06)',
                  border: `1px solid ${DANGER.includes(d.class_name) ?
                    'rgba(234,67,53,0.2)' : 'rgba(15,157,88,0.2)'}`,
                  borderRadius: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: CLASS_COLORS[d.class_name] || '#888',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: DANGER.includes(d.class_name) ? '#ea4335' : '#1a1a1a'
                      }}>
                        {d.class_name}
                        {DANGER.includes(d.class_name) && (
                          <span style={{
                            marginLeft: 6, fontSize: 10,
                            background: '#ea4335', color: 'white',
                            padding: '1px 6px', borderRadius: 10
                          }}>VIOLATION</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                        Confidence: {Math.round(d.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11, color: '#aaa',
                    fontFamily: 'monospace', textAlign: 'right'
                  }}>
                    [{d.bbox.x1},{d.bbox.y1}]
                    <br />
                    [{d.bbox.x2},{d.bbox.y2}]
                  </div>
                </div>
              ))}

              {uploadResult && uploadResult.detections.some(d => DANGER.includes(d.class_name)) && (
                <div style={{
                  marginTop: 16, padding: '12px 14px',
                  background: '#fce8e6', borderRadius: 10,
                  border: '1px solid #f5c6c2'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#c62828' }}>
                    ⚠ Safety Violation Detected!
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    Worker not wearing required PPE. Alert sent to safety team.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAMERA MODE */}
        {mode === 'camera' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', background: '#0a0f1e', minHeight: 420 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%', display: 'block',
                    opacity: cameraActive ? 1 : 0
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {!cameraActive && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 16
                  }}>
                    <div style={{ fontSize: 48, opacity: 0.4 }}>📷</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
                      Camera not started
                    </div>
                    <button
                      className="btn-primary"
                      onClick={startCamera}
                      style={{ fontSize: 14, padding: '10px 28px' }}
                    >
                      Start Camera
                    </button>
                  </div>
                )}

                {cameraActive && (
                  <>
                    <div style={{
                      position: 'absolute', top: 14, left: 14,
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'rgba(0,0,0,0.6)',
                      padding: '6px 12px', borderRadius: 20
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#ea4335',
                        boxShadow: '0 0 6px #ea4335'
                      }} />
                      <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>
                        LIVE
                      </span>
                    </div>

                    {detecting && (
                      <div style={{
                        position: 'absolute', top: 14, right: 14,
                        background: 'rgba(26,115,232,0.8)',
                        padding: '6px 12px', borderRadius: 20,
                        color: 'white', fontSize: 12
                      }}>
                        Detecting...
                      </div>
                    )}
                  </>
                )}

                {cameraActive && cameraResult && (
                  <img
                    src={cameraResult.annotated_image}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', opacity: 0.85
                    }}
                    alt="detection"
                  />
                )}
              </div>

              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid #e8eaed',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 13, color: '#666' }}>
                  {cameraActive ? 'Detecting every 2 seconds' : 'Camera stopped'}
                </span>
                {cameraActive ? (
                  <button
                    onClick={stopCamera}
                    style={{
                      padding: '7px 20px', borderRadius: 20,
                      border: 'none', background: '#ea4335',
                      color: 'white', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600
                    }}
                  >
                    Stop Camera
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="btn-primary"
                    style={{ fontSize: 13, padding: '7px 20px' }}
                  >
                    Start Camera
                  </button>
                )}
              </div>
            </div>

            {/* live detections */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#1a1a1a' }}>
                Live Detections
              </h3>

              {!cameraResult && (
                <div style={{
                  textAlign: 'center', padding: '40px 0',
                  color: '#888', fontSize: 14
                }}>
                  {cameraActive ? 'Waiting for detection...' : 'Start camera to detect'}
                </div>
              )}

              {cameraResult && cameraResult.detections.length === 0 && (
                <div style={{
                  textAlign: 'center', padding: '20px 0',
                  color: '#0f9d58', fontSize: 14, fontWeight: 500
                }}>
                  ✓ No violations detected
                </div>
              )}

              {cameraResult && cameraResult.detections.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: 8,
                  background: DANGER.includes(d.class_name) ?
                    'rgba(234,67,53,0.06)' : 'rgba(15,157,88,0.06)',
                  border: `1px solid ${DANGER.includes(d.class_name) ?
                    'rgba(234,67,53,0.2)' : 'rgba(15,157,88,0.2)'}`,
                  borderRadius: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: CLASS_COLORS[d.class_name] || '#888',
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: DANGER.includes(d.class_name) ? '#ea4335' : '#1a1a1a'
                      }}>
                        {d.class_name}
                        {DANGER.includes(d.class_name) && (
                          <span style={{
                            marginLeft: 6, fontSize: 10,
                            background: '#ea4335', color: 'white',
                            padding: '1px 6px', borderRadius: 10
                          }}>⚠ VIOLATION</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                        {Math.round(d.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {cameraResult && cameraResult.detections.some(d => DANGER.includes(d.class_name)) && (
                <div style={{
                  marginTop: 12, padding: '12px 14px',
                  background: '#fce8e6', borderRadius: 10,
                  border: '1px solid #f5c6c2'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#c62828' }}>
                    ⚠ Safety Violation!
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    PPE violation detected. Alert triggered.
                  </div>
                </div>
              )}

              <div style={{
                marginTop: 16, padding: '12px 14px',
                background: '#f8f9ff', borderRadius: 10,
                border: '1px solid #e8eaed'
              }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8, letterSpacing: 1 }}>
                  DETECTABLE CLASSES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(CLASS_COLORS).map(([name, color]) => (
                    <span key={name} style={{
                      fontSize: 10, padding: '3px 8px',
                      borderRadius: 20,
                      background: `${color}15`,
                      border: `1px solid ${color}40`,
                      color: color
                    }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}