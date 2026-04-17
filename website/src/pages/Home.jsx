import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

const productionData = [
  { year: '2013-14', production: 140, overburden: 1319, stripping: 8.01 },
  { year: '2014-15', production: 150, overburden: 1419, stripping: 8.04 },
  { year: '2015-16', production: 160, overburden: 1505, stripping: 7.99 },
  { year: '2016-17', production: 170, overburden: 1578, stripping: 7.89 },
  { year: '2017-18', production: 180, overburden: 1736, stripping: 8.20 },
]

const quarryData = [
  { quarry: 'D Quarry', reserve: 1.091, highGrade: 14.9, medGrade: 29.1 },
  { quarry: 'H Quarry', reserve: 0.505, highGrade: 36.6, medGrade: 7.1 },
  { quarry: 'Gangaigora', reserve: 0.245, highGrade: 11.8, medGrade: 18.8 },
  { quarry: 'Sankhaiburu', reserve: 0.017, highGrade: 0.0, medGrade: 23.5 },
  { quarry: "I'Quarry", reserve: 0.291, highGrade: 38.9, medGrade: 3.7 },
]

const features = [
  {
    icon: '◈',
    title: 'Digital Twin',
    desc: 'Real-time 3D underground mine simulation with live IoT sensor integration and AI-powered monitoring.',
    color: '#1a73e8',
    bg: '#e8f0fe',
    link: '/digital-twin'
  },
  {
    icon: '◎',
    title: 'YOLO Detection',
    desc: 'YOLOv8-powered real-time object detection for hazard identification, equipment tracking and safety monitoring.',
    color: '#0f9d58',
    bg: '#e6f4ea',
    link: '/yolo'
  },
  {
    icon: '◬',
    title: 'Path Navigation',
    desc: 'RGB-D SLAM using RTAB-Map for autonomous underground navigation with 3D mapping and obstacle avoidance.',
    color: '#f4b400',
    bg: '#fef9e7',
    link: '/navigation'
  },
]

const stats = [
  { value: '75.0 MT', label: 'Iron Ore Reserve', sub: 'Joda West Mine' },
  { value: '2.149 MT', label: 'Mn Reserve', sub: 'As of 2012' },
  { value: '8.03', label: 'Avg Strip Ratio', sub: '5-year average' },
  { value: '800K MT', label: 'Total Production', sub: '2013–2018' },
  { value: '5', label: 'Quarry Zones', sub: 'Active monitoring' },
  { value: '16', label: 'Datasets', sub: 'Preprocessed' },
]

export default function Home() {
  const videoRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#0a0f1e'
      }}>
        {/* video background */}
        <video
  autoPlay
  muted
  loop
  playsInline
  style={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '100%', minHeight: '100%',
    width: 'auto', height: 'auto',
    opacity: 0.45,
    objectFit: 'cover'
  }}
>
  <source src="/mine.mp4" type="video/mp4" />
</video>
        

        {/* dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,15,30,0.85) 0%, rgba(26,115,232,0.15) 100%)'
        }} />

        {/* hero content */}
        <div style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center', padding: '0 20px',
          maxWidth: 800
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(26,115,232,0.2)',
            border: '1px solid rgba(26,115,232,0.4)',
            color: '#7ab3f5',
            fontSize: 12, fontWeight: 600,
            padding: '6px 18px', borderRadius: 20,
            letterSpacing: 2, marginBottom: 24
          }}>
            TATA STEEL — JODA WEST MANGANESE MINE, ODISHA
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.1,
            marginBottom: 24
          }}>
            AI-Powered Mining
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #4a9eff, #1a73e8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Digital Twin
            </span>
          </h1>

          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px'
          }}>
            Real-time underground mine monitoring using Digital Twin technology,
            YOLOv8 object detection, and RGB-D SLAM path navigation —
            built on real Tata Steel mining data.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/digital-twin" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Launch Digital Twin
            </Link>
            <a href="#features" className="btn-outline" style={{
              fontSize: 16, padding: '14px 32px',
              color: 'white', borderColor: 'rgba(255,255,255,0.4)'
            }}>
              Explore Features
            </a>
          </div>
        </div>

        {/* scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12, letterSpacing: 2,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 8
        }}>
          <span>SCROLL</span>
          <div style={{
            width: 1, height: 40,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)'
          }} />
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{
        padding: '80px 80px 60px',
        background: '#f8f9ff'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-tag">Real Data</span>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1a1a1a' }}>
            Joda West Mine — Key Metrics
          </h2>
          <p style={{ color: '#666', marginTop: 12, fontSize: 16 }}>
            Live data from Tata Steel Ferro Alloys & Minerals Division, Keonjhar, Odisha
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 20
        }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{
                fontSize: 32, fontWeight: 700,
                background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 6
              }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '80px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-tag">Modules</span>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1a1a1a' }}>
            Three Integrated Systems
          </h2>
          <p style={{ color: '#666', marginTop: 12, fontSize: 16, maxWidth: 500, margin: '12px auto 0' }}>
            Each module works independently and integrates into a unified mining intelligence platform
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24
        }}>
          {features.map((f, i) => (
            <Link key={i} to={f.link} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%' }}>
                <div style={{
                  width: 52, height: 52,
                  background: f.bg,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: f.color,
                  marginBottom: 20
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>
                  {f.title}
                </h3>
                <p style={{ color: '#666', lineHeight: 1.7, fontSize: 14 }}>{f.desc}</p>
                <div style={{
                  marginTop: 20, color: f.color,
                  fontSize: 14, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  Open Module →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CHARTS SECTION — REAL TATA DATA */}
      <section style={{ padding: '80px 80px', background: '#f8f9ff' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-tag">Analytics</span>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#1a1a1a' }}>
            Production Intelligence
          </h2>
          <p style={{ color: '#666', marginTop: 12, fontSize: 16 }}>
            Real production data from Joda West Mine (2013–2018)
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* production trend */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1a1a1a' }}>
              Annual ROM Production (000 MT)
            </h3>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              Consistent growth trend — 140K to 180K MT over 5 years
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="production"
                  stroke="#1a73e8"
                  strokeWidth={2.5}
                  fill="url(#prodGrad)"
                  name="Production (000 MT)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* quarry reserves */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1a1a1a' }}>
              Reserve by Quarry Zone (MT)
            </h3>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              D Quarry holds largest reserve at 1.091 MT
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={quarryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarry" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="highGrade" name="High Grade %" fill="#1a73e8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medGrade" name="Med Grade %" fill="#4a9eff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* stripping ratio */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1a1a1a' }}>
              Stripping Ratio Trend
            </h3>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              Average 8.03 CuM OB per CuM ROM — stable efficiency
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="srGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f9d58" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f9d58" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis domain={[7.5, 8.5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="stripping"
                  stroke="#0f9d58"
                  strokeWidth={2.5}
                  fill="url(#srGrad)"
                  name="Stripping Ratio"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* overburden */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1a1a1a' }}>
              Overburden Excavation (000 CuM)
            </h3>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>
              Rising OB removal indicates deeper mining operations
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={productionData}>
                <defs>
                  <linearGradient id="obGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f4b400" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f4b400" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="overburden"
                  stroke="#f4b400"
                  strokeWidth={2.5}
                  fill="url(#obGrad)"
                  name="Overburden (000 CuM)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: '100px 80px',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2744 100%)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 42, fontWeight: 700, color: 'white', marginBottom: 16 }}>
          Ready to explore the mine?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, marginBottom: 40 }}>
          Launch the live digital twin and explore Joda West Mine in real time
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/digital-twin" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
            Launch Digital Twin
          </Link>
          <Link to="/yolo" className="btn-outline" style={{
            fontSize: 16, padding: '14px 36px',
            color: 'white', borderColor: 'rgba(255,255,255,0.3)'
          }}>
            View YOLO Demo
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '40px 80px',
        background: '#0a0f1e',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>MineSafe AI</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>
            Joda West Manganese Mine — Tata Steel, Keonjhar, Odisha
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          Digital Twin · YOLO Detection · Path Navigation
        </div>
      </footer>
    </div>
  )
}