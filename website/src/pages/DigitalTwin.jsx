export default function DigitalTwin() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#f8f9ff' }}>
      <div style={{ padding: '48px 80px 32px' }}>
        <span className="section-tag">Live System</span>
        <h1 style={{ fontSize: 40, fontWeight: 700, color: '#1a1a1a', marginTop: 8 }}>
          Digital Twin — Underground Mine
        </h1>
        <p style={{ color: '#666', fontSize: 16, marginTop: 12 }}>
          Real-time 3D simulation of Joda West Mine with live IoT sensor monitoring and AI anomaly detection
        </p>
      </div>

      <div style={{ padding: '0 80px 48px' }}>
        <div style={{
          borderRadius: 20, overflow: 'hidden',
          border: '1px solid #e8eaed',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          height: '80vh'
        }}>
          <iframe
            src="http://localhost:5173"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Digital Twin"
          />
        </div>
        <p style={{ color: '#888', fontSize: 13, marginTop: 12, textAlign: 'center' }}>
          Make sure the Digital Twin server is running at localhost:5173
        </p>
      </div>
    </div>
  )
}