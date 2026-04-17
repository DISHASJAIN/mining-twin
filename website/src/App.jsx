import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import DigitalTwin from './pages/DigitalTwin'
import YoloDetection from './pages/YoloDetection'
import PathNavigation from './pages/PathNavigation'

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/digital-twin" element={<DigitalTwin />} />
        <Route path="/yolo" element={<YoloDetection />} />
        <Route path="/navigation" element={<PathNavigation />} />
      </Routes>
    </div>
  )
}