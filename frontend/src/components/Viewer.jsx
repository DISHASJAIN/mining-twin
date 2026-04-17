import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import AIPanel from './AIPanel'

const equipment = [
  {
    id: 'CV-101',
    type: 'Conveyor Belt',
    position: [0, 1.5, -8],
    status: 'critical',
    zone: 'Tunnel A',
    riskScore: 85,
    lastMaintenance: '2024-12-10',
    nextService: '2025-04-20',
    sensors: [
      { name: 'Temperature', value: '87°C', alert: true },
      { name: 'Belt Speed', value: '2.1 m/s', alert: false },
      { name: 'Load', value: '420 kg/m', alert: false },
      { name: 'Vibration', value: '8.2 mm/s', alert: true },
    ],
  },
  {
    id: 'GS-203',
    type: 'Gas Sensor',
    position: [-1.5, 2.2, -18],
    status: 'warning',
    zone: 'Tunnel B',
    riskScore: 62,
    lastMaintenance: '2025-01-05',
    nextService: '2025-05-01',
    sensors: [
      { name: 'Methane CH4', value: '1.8% LEL', alert: true },
      { name: 'CO Level', value: '12 ppm', alert: false },
      { name: 'O2 Level', value: '20.8%', alert: false },
      { name: 'Humidity', value: '74%', alert: false },
    ],
  },
  {
    id: 'PM-305',
    type: 'Water Pump',
    position: [1.8, 1.2, -28],
    status: 'warning',
    zone: 'Tunnel A',
    riskScore: 55,
    lastMaintenance: '2025-02-14',
    nextService: '2025-06-14',
    sensors: [
      { name: 'Flow Rate', value: '320 L/min', alert: false },
      { name: 'Pressure', value: '4.2 bar', alert: false },
      { name: 'Vibration', value: '6.8 mm/s', alert: true },
      { name: 'Motor Temp', value: '61°C', alert: false },
    ],
  },
  {
    id: 'SK-801',
    type: 'Screening Plant',
    position: [0, 1.5, -40],
    status: 'normal',
    zone: 'Tunnel C',
    riskScore: 18,
    lastMaintenance: '2025-03-01',
    nextService: '2025-07-01',
    sensors: [
      { name: 'Feed Rate', value: '850 t/h', alert: false },
      { name: 'Screen Efficiency', value: '94%', alert: false },
      { name: 'Motor Load', value: '68%', alert: false },
      { name: 'Temperature', value: '42°C', alert: false },
    ],
  },
  {
    id: 'DR-601',
    type: 'Drill Rig',
    position: [-0.5, 1.5, -52],
    status: 'normal',
    zone: 'Tunnel C',
    riskScore: 22,
    lastMaintenance: '2025-02-20',
    nextService: '2025-06-20',
    sensors: [
      { name: 'Drill Speed', value: '120 RPM', alert: false },
      { name: 'Torque', value: '380 Nm', alert: false },
      { name: 'Depth', value: '45 m', alert: false },
      { name: 'Temperature', value: '48°C', alert: false },
    ],
  },
]

function statusColor(status) {
  if (status === 'critical') return '#ff4d4d'
  if (status === 'warning') return '#ff9b2f'
  return '#3ad37a'
}

function Rock({ position, scale = 1, rotation = [0, 0, 0], color = '#3a2810' }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <icosahedronGeometry args={[scale, 0]} />
      <meshStandardMaterial color={color} roughness={1} metalness={0.03} />
    </mesh>
  )
}

function RockyWall({ side }) {
  const rocks = useMemo(() => {
    const data = []
    const baseX = side === 'left' ? -3.55 : 3.55
    const sideDir = side === 'left' ? 1 : -1
    const colors = ['#2a190a', '#3a2410', '#4a2d14', '#251508', '#5a3920', '#332010']

    for (let i = 0; i < 180; i++) {
      const z = -i * 0.38 - 0.5
      const y = Math.random() * 4.8 - 0.2

      const inset =
        Math.sin(i * 0.22) * 0.18 +
        Math.sin(i * 0.07) * 0.28 +
        (Math.random() - 0.5) * 0.18

      const x = baseX + inset * sideDir
      const scale = 0.22 + Math.random() * 0.55

      data.push({
        position: [x, y, z],
        scale,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    for (let i = 0; i < 70; i++) {
      const z = -i * 0.95 - 1
      const y = Math.random() * 4.6
      const x = baseX + (0.18 + Math.random() * 0.2) * sideDir
      const scale = 0.65 + Math.random() * 1.15

      data.push({
        position: [x, y, z],
        scale,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    return data
  }, [side])

  return (
    <group>
      {/* base wall mass */}
      <mesh position={[side === 'left' ? -3.95 : 3.95, 2.1, -32]} receiveShadow castShadow>
        <boxGeometry args={[1.6, 5.4, 66]} />
        <meshStandardMaterial color="#231307" roughness={1} metalness={0.02} />
      </mesh>

      {/* attached rock clusters */}
      {rocks.map((r, i) => (
        <Rock
          key={i}
          position={r.position}
          scale={r.scale}
          rotation={r.rotation}
          color={r.color}
        />
      ))}
    </group>
  )
}

function RockyCeiling() {
  const rocks = useMemo(() => {
    const data = []
    const colors = ['#1a1006', '#241608', '#32200d', '#422811', '#2b190a']

    for (let i = 0; i < 220; i++) {
      const z = -i * 0.28 - 0.5
      const spread = 2.9 - Math.abs(Math.sin(i * 0.08)) * 0.8
      const x = (Math.random() - 0.5) * spread * 2
      const y =
        4.45 +
        Math.sin(i * 0.18) * 0.18 +
        Math.sin(i * 0.05) * 0.22 +
        Math.random() * 0.22

      const scale = 0.18 + Math.random() * 0.48

      data.push({
        position: [x, y, z],
        scale,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    for (let i = 0; i < 45; i++) {
      const z = -i * 1.35 - 1
      const x = (Math.random() - 0.5) * 4.8
      const y = 4.65 + Math.random() * 0.15
      const scale = 0.55 + Math.random() * 0.85

      data.push({
        position: [x, y, z],
        scale,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    return data
  }, [])

  return (
    <group>
      {/* base ceiling mass */}
      <mesh position={[0, 5.1, -32]} receiveShadow castShadow>
        <boxGeometry args={[7.6, 1.6, 66]} />
        <meshStandardMaterial color="#1b1006" roughness={1} metalness={0.02} />
      </mesh>

      {/* uneven attached ceiling rocks */}
      {rocks.map((r, i) => (
        <Rock
          key={i}
          position={r.position}
          scale={r.scale}
          rotation={r.rotation}
          color={r.color}
        />
      ))}
    </group>
  )
}

function Floor() {
  const dirtPatches = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        x: (Math.random() - 0.5) * 5.3,
        z: -i * 2.2 - 1,
        w: 0.8 + Math.random() * 1.7,
        h: 0.35 + Math.random() * 0.8,
        r: Math.random() * Math.PI,
        c: ['#241607', '#2c1a09', '#1a1005', '#34200b'][Math.floor(Math.random() * 4)],
      })),
    []
  )

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -32]} receiveShadow>
        <planeGeometry args={[7.6, 66]} />
        <meshStandardMaterial color="#241406" roughness={0.96} metalness={0.04} />
      </mesh>

      {dirtPatches.map((p, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, p.r]}
          position={[p.x, -0.495, p.z]}
          receiveShadow
        >
          <planeGeometry args={[p.w, p.h]} />
          <meshStandardMaterial color={p.c} roughness={1} metalness={0} />
        </mesh>
      ))}
    </>
  )
}

function RailTrack() {
  return (
    <group>
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, -0.38, -32]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.1, 66]} />
          <meshStandardMaterial color="#8a8a8a" roughness={0.45} metalness={0.8} />
        </mesh>
      ))}

      {Array.from({ length: 33 }).map((_, i) => (
        <mesh key={i} position={[0, -0.44, -i * 2 - 1]} castShadow receiveShadow>
          <boxGeometry args={[1.95, 0.08, 0.15]} />
          <meshStandardMaterial color="#4b2f15" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

function SteelArches() {
  return (
    <group>
      {Array.from({ length: 13 }).map((_, i) => (
        <group key={i} position={[0, 0, -i * 5 - 2]}>
          <mesh position={[-3.0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 4.2, 0.14]} />
            <meshStandardMaterial color="#494949" roughness={0.56} metalness={0.85} />
          </mesh>

          <mesh position={[3.0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.15, 4.2, 0.14]} />
            <meshStandardMaterial color="#494949" roughness={0.56} metalness={0.85} />
          </mesh>

          {[-2, -1, 0, 1, 2].map((j, k) => {
            const angle = (j / 4) * Math.PI * 0.72
            const ax = Math.sin(angle) * 3.08
            const ay = 3.8 + Math.cos(angle) * 0.62

            return (
              <mesh key={k} position={[ax, ay, 0]} rotation={[0, 0, angle]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 1.55, 0.14]} />
                <meshStandardMaterial color="#3e3e3e" roughness={0.58} metalness={0.82} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

function WallPipes() {
  return (
    <group>
      <mesh position={[-2.8, 3.5, -32]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.11, 0.11, 66, 10]} />
        <meshStandardMaterial color="#8b4d23" roughness={0.74} metalness={0.24} />
      </mesh>

      <mesh position={[-2.48, 3.1, -32]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.075, 66, 10]} />
        <meshStandardMaterial color="#666666" roughness={0.56} metalness={0.72} />
      </mesh>

      <mesh position={[2.82, 3.38, -32]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.05, 0.05, 66, 8]} />
        <meshStandardMaterial color="#333333" roughness={0.62} metalness={0.68} />
      </mesh>

      <mesh position={[2.6, 3.08, -32]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 66, 8]} />
        <meshStandardMaterial color="#474747" roughness={0.62} metalness={0.62} />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} position={[-2.64, 3.27, -i * 5 - 3]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.38, 0.07, 0.11]} />
            <meshStandardMaterial color="#252525" roughness={0.76} metalness={0.64} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function CableBundles() {
  return (
    <group>
      {[-2.15, 2.25, 2.45].map((x, idx) => (
        <mesh
          key={idx}
          position={[x, 3.95 - idx * 0.12, -32]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.03 + idx * 0.005, 0.03 + idx * 0.005, 66, 8]} />
          <meshStandardMaterial
            color={idx === 0 ? '#26211c' : idx === 1 ? '#3a3128' : '#1d1d1d'}
            roughness={0.86}
            metalness={0.18}
          />
        </mesh>
      ))}
    </group>
  )
}

function HangingLights() {
  const refs = useRef([])

  useFrame(({ clock }) => {
    refs.current.forEach((l, i) => {
      if (!l) return
      if (i === 3) {
        l.intensity = Math.sin(clock.elapsedTime * 18) > 0.15 ? 18 : 2.5
      } else {
        l.intensity = 20 + Math.sin(clock.elapsedTime * 2.4 + i) * 2.2
      }
    })
  })

  const positions = [-3, -9, -15, -21, -27, -33, -39, -45, -51, -57]

  return (
    <group>
      {positions.map((z, i) => (
        <group key={i} position={[0, 4.12, z]}>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.55, 5]} />
            <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.14} />
          </mesh>

          <mesh position={[0, -0.04, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#7d7d7d" roughness={0.75} metalness={0.8} wireframe />
          </mesh>

          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial
              color="#ffe6ae"
              emissive="#ffcc55"
              emissiveIntensity={i === 3 ? 2 : 3.6}
              roughness={0.2}
              metalness={0}
            />
          </mesh>

          <pointLight
            ref={(el) => (refs.current[i] = el)}
            position={[0, -0.12, 0]}
            intensity={20}
            distance={16}
            color="#ffcf7a"
            decay={1.85}
            castShadow
          />
        </group>
      ))}

      <pointLight position={[0, 2.8, -5]} intensity={9} distance={20} color="#ffbf66" decay={1.4} />
      <pointLight position={[0, 2.8, -20]} intensity={8} distance={22} color="#ffbf66" decay={1.4} />
      <pointLight position={[0, 2.8, -36]} intensity={8} distance={22} color="#ffb15a" decay={1.4} />
      <pointLight position={[0, 2.8, -54]} intensity={7} distance={18} color="#ffad52" decay={1.45} />
    </group>
  )
}

function WarningLamps() {
  const refs = useRef([])

  useFrame(({ clock }) => {
    refs.current.forEach((r, i) => {
      if (!r) return
      r.intensity = 1.2 + Math.sin(clock.elapsedTime * 2.2 + i * 0.7) * 0.45
    })
  })

  return (
    <group>
      {[-12, -24, -38, -50].map((z, i) => (
        <group key={i} position={[i % 2 === 0 ? -2.65 : 2.65, 2.55, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.18, 10]} />
            <meshStandardMaterial color="#3b2b1d" roughness={0.8} metalness={0.15} />
          </mesh>

          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color="#ff6b2d" emissive="#ff5a1f" emissiveIntensity={2.4} />
          </mesh>

          <pointLight
            ref={(el) => (refs.current[i] = el)}
            position={[0, 0, 0.24]}
            intensity={1.5}
            color="#ff6d33"
            distance={6}
            decay={2}
          />
        </group>
      ))}
    </group>
  )
}

function WaterPuddles() {
  const puddles = [
    [0.2, -0.487, -7, 1.7, 0.55, 0.78],
    [-0.35, -0.487, -16, 2.3, 0.9, 0.72],
    [0.42, -0.487, -25, 1.35, 0.55, 0.7],
    [-0.12, -0.487, -36, 3.15, 1.05, 0.84],
    [0.28, -0.487, -47, 1.9, 0.68, 0.75],
    [-0.38, -0.487, -55, 1.4, 0.5, 0.68],
  ]

  return (
    <group>
      {puddles.map(([x, y, z, w, d, o], i) => (
        <group key={i}>
          <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[w, d]} />
            <meshStandardMaterial
              color="#4b2b10"
              metalness={0.92}
              roughness={0.08}
              transparent
              opacity={o}
            />
          </mesh>

          <mesh position={[x, y + 0.001, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[w * 0.72, d * 0.52]} />
            <meshStandardMaterial
              color="#b88b47"
              emissive="#7a4d18"
              emissiveIntensity={0.2}
              metalness={1}
              roughness={0}
              transparent
              opacity={0.18}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function MineCart({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.65, 2.0]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.75} metalness={0.45} />
      </mesh>

      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.13, 2.2]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.72} metalness={0.55} />
      </mesh>

      {[[-0.5, -0.7], [0.5, -0.7]].map(([wx], wi) =>
        [-0.65, 0.65].map((wz, wzi) => (
          <mesh
            key={`w${wi}${wzi}`}
            position={[wx, -0.1, wz]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[0.19, 0.19, 0.11, 12]} />
            <meshStandardMaterial color="#343434" roughness={0.65} metalness={0.75} />
          </mesh>
        ))
      )}

      {[[-0.15, 0.75, -0.2], [0.18, 0.72, 0.15], [0, 0.8, 0.38], [0.12, 0.68, -0.5]].map((p, i) => (
        <mesh
          key={i}
          position={p}
          rotation={[0.6 + i * 0.2, 0.3 + i * 0.25, 0.2 + i * 0.15]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#5a3a18" roughness={0.98} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

function DustParticles() {
  const count = 220
  const meshRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6.7
      arr[i * 3 + 1] = Math.random() * 4.7 - 0.2
      arr[i * 3 + 2] = -Math.random() * 63
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.0035 + Math.sin(clock.elapsedTime + i) * 0.0006
      pos[i * 3] += (Math.random() - 0.5) * 0.006
      if (pos[i * 3 + 1] < -0.55) pos[i * 3 + 1] = 4.7
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#d0ae72"
        transparent
        opacity={0.32}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function FloatingMist() {
  const count = 55
  const meshRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 5.2
      arr[i * 3 + 1] = 0.2 + Math.random() * 1.8
      arr[i * 3 + 2] = -Math.random() * 62
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3] += Math.sin(clock.elapsedTime * 0.35 + i) * 0.0009
      pos[i * 3 + 2] += Math.sin(clock.elapsedTime * 0.25 + i * 0.4) * 0.001
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        color="#d2a96c"
        transparent
        opacity={0.06}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function EquipmentMarker({ eq, onClick }) {
  const meshRef = useRef()
  const ringRef = useRef()
  const lightRef = useRef()
  const [hovered, setHovered] = useState(false)
  const color = statusColor(eq.status)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 1.6
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 0.7
    }
    if (lightRef.current) {
      lightRef.current.intensity = 4.8 + Math.sin(clock.elapsedTime * 5) * 1.3
    }
  })

  return (
    <group
      position={eq.position}
      onClick={(e) => {
        e.stopPropagation()
        onClick(eq)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* big invisible click zone */}
      <mesh>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* spinning diamond */}
      <mesh ref={meshRef} scale={hovered ? 1.8 : 1.2}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 5 : 3}
          roughness={0.22}
          metalness={0.25}
        />
      </mesh>

      {/* pulsing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.04, 10, 40]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        intensity={5}
        distance={6}
        color={color}
        decay={2}
      />

      <Text
        position={[0, 1.1, 0]}
        fontSize={0.32}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {eq.id}
      </Text>

      <Text
        position={[0, 0.72, 0]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#000000"
      >
        {eq.type}
      </Text>
    </group>
  )
}

function TunnelBackGlow() {
  return (
    <group position={[0, 2.8, -62]}>
      <mesh>
        <planeGeometry args={[4, 5]} />
        <meshBasicMaterial color="#ff9f3a" transparent opacity={0.07} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={7} distance={18} color="#ff9f3a" decay={1.4} />
    </group>
  )
}

export default function Viewer({ onSelectEquipment, liveData }) {
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(null)
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  function handleSearch(e) {
    const val = e.target.value.toUpperCase()
    setSearch(val)

    if (val.length > 1) {
      const found = equipment.find((eq) => eq.id.includes(val))
      setFiltered(found || null)
    } else {
      setFiltered(null)
    }
  }

  const displayEquipment = filtered ? [filtered] : equipment

  return (
    <div style={{ flex: 1, position: 'relative', background: '#120903' }}>
  <AIPanel />
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search — CV-101, GS-203, SK-801..."
          style={{
            background: 'rgba(18,10,4,0.92)',
            border: '1px solid #74431c',
            borderRadius: 10,
            padding: '10px 16px',
            color: '#ffd79a',
            fontSize: 13,
            width: 320,
            outline: 'none',
            boxShadow: '0 0 18px rgba(255,145,60,0.08)',
          }}
        />

        {search && (
          <button
            onClick={() => {
              setSearch('')
              setFiltered(null)
            }}
            style={{
              background: 'rgba(18,10,4,0.92)',
              border: '1px solid #74431c',
              borderRadius: 10,
              color: '#c46e33',
              padding: '0 12px',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          background: 'rgba(20,11,4,0.56)',
          padding: '10px 12px',
          borderRadius: 12,
          border: '1px solid rgba(160,95,35,0.35)',
        }}
      >
        <div style={{ fontSize: 10, color: '#c58a52', letterSpacing: 1.5, marginBottom: 2 }}>
          STATUS
        </div>
        {[
          ['#ff4d4d', 'Critical'],
          ['#ff9b2f', 'Warning'],
          ['#3ad37a', 'Normal'],
        ].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: c,
                boxShadow: `0 0 8px ${c}`,
              }}
            />
            <span style={{ fontSize: 12, color: '#ddb486' }}>{l}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          color: '#c58a52',
          fontSize: 11,
          letterSpacing: 1.5,
          background: 'rgba(20,11,4,0.45)',
          padding: '8px 12px',
          borderRadius: 999,
          border: '1px solid rgba(160,95,35,0.28)',
        }}
      >
        DRAG TO NAVIGATE · SCROLL TO ZOOM · CLICK MARKER TO INSPECT
      </div>
      {selectedEquipment && (
  <div
    style={{
      position: 'absolute',
      top: 90,
      right: 14,
      zIndex: 20,
      width: 320,
      background: 'rgba(18,10,4,0.96)',
      border: '1px solid rgba(160,95,35,0.45)',
      borderRadius: 14,
      padding: 14,
      color: '#ffd79a',
      boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
      <div>
        <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: 1.2 }}>
          EQUIPMENT INFO
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
          {selectedEquipment.id}
        </div>
        <div style={{ fontSize: 14, opacity: 0.95, marginTop: 2 }}>
          {selectedEquipment.type}
        </div>
      </div>

      <button
        onClick={() => setSelectedEquipment(null)}
        style={{
          background: '#c46e33',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        Close
      </button>
    </div>

    <div style={{ marginTop: 12, display: 'grid', gap: 8, fontSize: 13, lineHeight: 1.5 }}>
      <div><strong>Status:</strong> {selectedEquipment.status}</div>
      <div><strong>Zone:</strong> {selectedEquipment.zone}</div>
      <div><strong>Risk Score:</strong> {selectedEquipment.riskScore}</div>
      <div><strong>Last Maintenance:</strong> {selectedEquipment.lastMaintenance}</div>
      <div><strong>Next Service:</strong> {selectedEquipment.nextService}</div>
    </div>

    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, letterSpacing: 1, marginBottom: 6, opacity: 0.8 }}>
        SENSORS
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {selectedEquipment.sensors.map((s) => (
          <div
            key={s.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: 8,
              background: s.alert ? 'rgba(255,77,77,0.12)' : 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span>{s.name}</span>
            <span style={{ color: s.alert ? '#ff7b7b' : '#ffd79a' }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ position: [0, 1.7, 5.5], fov: 82, near: 0.1, far: 150 }}
        style={{ background: '#090401' }}
      >
        <color attach="background" args={['#090401']} />
        <fog attach="fog" args={['#120803', 16, 68]} />

        <ambientLight intensity={0.28} color="#ffb46a" />
        <hemisphereLight intensity={0.36} color="#ffc980" groundColor="#1d0f05" />

        <directionalLight
          position={[2, 5, 6]}
          intensity={0.45}
          color="#fff0cc"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={120}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />

        <RockyWall side="left" />
        <RockyWall side="right" />
        <RockyCeiling />
        <Floor />
        <SteelArches />
        <WallPipes />
        <CableBundles />
        <HangingLights />
        <WarningLamps />
        <RailTrack />
        <WaterPuddles />
        <MineCart position={[0.2, -0.28, -14]} />
        <MineCart position={[0.2, -0.28, -30]} />
        <DustParticles />
        <FloatingMist />
        <TunnelBackGlow />

        {displayEquipment.map((eq) => (
  <EquipmentMarker
    key={eq.id}
    eq={eq}
    onClick={(item) => {
      setSelectedEquipment(item)
      if (onSelectEquipment) onSelectEquipment(item)
    }}
  />
))}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 1.62}
          minPolarAngle={Math.PI / 3.2}
          minDistance={0.8}
          maxDistance={28}
          target={[0, 1.5, -18]}
        />

        <EffectComposer>
          <Bloom
            intensity={0.45}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.75}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.16} darkness={0.46} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}