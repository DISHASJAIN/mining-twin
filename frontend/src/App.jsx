import { useState } from 'react'
import Viewer from './components/Viewer'
import Sidebar from './components/Sidebar'
import AlertBar from './components/AlertBar'
import useLiveData from './hooks/useLiveData'
import './App.css'

export default function App() {
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const { liveData, connected } = useLiveData()

  function handleSelectEquipment(eq) {
    if (!eq) {
      setSelectedEquipment(null)
      return
    }
    const live = liveData?.[eq.id]
    const merged = live ? { ...eq, ...live } : eq
    setSelectedEquipment(merged)
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#090401',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AlertBar liveData={liveData} connected={connected} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Viewer onSelectEquipment={handleSelectEquipment} liveData={liveData} />
        {selectedEquipment && (
          <Sidebar
            equipment={selectedEquipment}
            liveData={liveData}
            onClose={() => setSelectedEquipment(null)}
          />
        )}
      </div>
    </div>
  )
}