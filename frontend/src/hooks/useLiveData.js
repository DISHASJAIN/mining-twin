import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8000', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
})

export default function useLiveData() {
  const [liveData, setLiveData] = useState({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to mine backend')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from backend')
      setConnected(false)
    })

    socket.on('sensor_update', (data) => {
      setLiveData(data)
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('sensor_update')
    }
  }, [])

  return { liveData, connected }
}