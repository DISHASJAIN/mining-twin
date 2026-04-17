import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHome = location.pathname === '/'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 1000,
      background: scrolled || !isHome ? 'rgba(255,255,255,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled || !isHome ? '1px solid #e8eaed' : 'none',
      transition: 'all 0.3s',
      padding: '0 40px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 16
        }}>M</div>
        <div>
          <div style={{
            fontWeight: 700, fontSize: 16,
            color: scrolled || !isHome ? '#1a1a1a' : 'white',
            lineHeight: 1.1
          }}>MineVision AI</div>
          <div style={{
            fontSize: 10,
            color: scrolled || !isHome ? '#888' : 'rgba(255,255,255,0.7)',
            letterSpacing: 0.5
          }}>Joda West — Tata Steel</div>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {[
          { path: '/', label: 'Home' },
          { path: '/digital-twin', label: 'Digital Twin' },
          { path: '/yolo', label: 'YOLO Detection' },
          { path: '/navigation', label: 'Path Navigation' },
        ].map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className="nav-link"
            style={{
              color: location.pathname === path
                ? '#1a73e8'
                : scrolled || !isHome ? '#444' : 'rgba(255,255,255,0.9)',
              background: location.pathname === path
                ? '#e8f0fe' : 'transparent',
            }}
          >
            {label}
          </Link>
        ))}
        <Link to="/digital-twin" className="btn-primary" style={{ marginLeft: 12, fontSize: 13, padding: '8px 20px' }}>
          Launch Twin
        </Link>
      </div>
    </nav>
  )
}