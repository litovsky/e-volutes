import { useRef, useEffect, useState, useCallback } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

// ── Stars (generated once) ─────────────────────────────────────────
const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5,
  duration: Math.random() * 4 + 2,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.5 + 0.2,
}))

// ── Helpers ────────────────────────────────────────────────────────
function degToRad(deg) { return (deg * Math.PI) / 180 }

function modulePosition(angle, distance) {
  const rad = degToRad(angle)
  return {
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
  }
}

// ── Earth component ────────────────────────────────────────────────
function Earth() {
  return (
    <div className="earth-wrapper">
      <div className="earth-rings" />
      <div className="earth-rings" />
      <div className="earth-rings" />
      <div className="earth">
        <span className="earth-label">EARTH · SYSTEM STATUS</span>
      </div>
    </div>
  )
}

// ── Module Block ───────────────────────────────────────────────────
function ModuleBlock({ module, centerX, centerY }) {
  const pos = modulePosition(module.angle, module.distance)
  const blockX = centerX + pos.x
  const blockY = centerY + pos.y

  return (
    <div
      className="module-block"
      style={{ left: blockX, top: blockY }}
    >
      <div className="module-card">
        <span className="module-icon">{module.icon}</span>
        <span className="module-icon-hover">{module.icon_hover}</span>
        <div className="module-name">{module.name}</div>
        <div className="module-status">
          <div
            className="module-status-bar"
            style={{ width: '80%', background: `linear-gradient(90deg, ${module.color}, ${module.color}88)` }}
          />
        </div>
      </div>
      <div className="tooltip">
        <strong>{module.name}</strong>
        {module.description}
      </div>
    </div>
  )
}

// ── SVG Lines ──────────────────────────────────────────────────────
function Lines({ modules, centerX, centerY }) {
  return (
    <svg className="lines-canvas">
      <defs>
        {modules.map(m => (
          <marker
            key={`arrow-${m.id}`}
            id={`arrow-${m.id}`}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill={m.color} opacity="0.7" />
          </marker>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {modules.map(m => {
        const pos = modulePosition(m.angle, m.distance)
        const ex = centerX + pos.x
        const ey = centerY + pos.y

        const rad = degToRad(m.angle)
        const startX = centerX + Math.cos(rad) * 65
        const startY = centerY + Math.sin(rad) * 65

        const endX = ex - Math.cos(rad) * 72
        const endY = ey - Math.sin(rad) * 40

        const mx = (startX + endX) / 2
        const my = (startY + endY) / 2 - 20

        return (
          <g key={m.id}>
            <path
              d={`M${startX},${startY} Q${mx},${my} ${endX},${endY}`}
              stroke={m.color}
              strokeWidth="1.5"
              fill="none"
              opacity="0.15"
              strokeDasharray="none"
              filter="url(#glow)"
            />
            <path
              d={`M${startX},${startY} Q${mx},${my} ${endX},${endY}`}
              stroke={m.color}
              strokeWidth="1"
              fill="none"
              opacity="0.5"
              strokeDasharray="4 4"
              markerEnd={`url(#arrow-${m.id})`}
            >
              <animate
                attributeName="stroke-dashoffset"
                from="8"
                to="0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx={startX} cy={startY} r="3" fill={m.color} opacity="0.5" />
          </g>
        )
      })}
    </svg>
  )
}

// ── Main App ───────────────────────────────────────────────────────
export default function App() {
  const containerRef = useRef(null)
  const [center, setCenter] = useState({ x: 0, y: 0 })
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)

  const updateCenter = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth: w, offsetHeight: h } = containerRef.current
      setCenter({ x: w / 2, y: h / 2 })
    }
  }, [])

  useEffect(() => {
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [updateCenter])

  useEffect(() => {
    supabase
      .from('blocks')
      .select('*')
      .order('order_index')
      .then(({ data, error }) => {
        if (!error && data) setBlocks(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="dashboard" ref={containerRef}>
      {/* Background */}
      <div className="grid-overlay" />
      <div className="stars">
        {STARS.map(s => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              '--d': `${s.duration}s`,
              '--delay': `${s.delay}s`,
              '--op': s.opacity,
            }}
          />
        ))}
      </div>

      {/* HUD corners */}
      <div className="hud-corner hud-corner--tl" />
      <div className="hud-corner hud-corner--tr" />
      <div className="hud-corner hud-corner--bl" />
      <div className="hud-corner hud-corner--br" />

      {/* Header */}
      <div className="hud-header">
        <h1>E-VOLUTES · PLANETARY DASHBOARD</h1>
        <div className="subtitle">SYSTEM ANALYSIS · CIVILIZATION MODULES</div>
      </div>

      {/* SVG lines */}
      {!loading && center.x > 0 && (
        <Lines modules={blocks} centerX={center.x} centerY={center.y} />
      )}

      {/* Earth */}
      <Earth />

      {/* Module blocks */}
      {!loading && center.x > 0 && blocks.map(m => (
        <ModuleBlock
          key={m.id}
          module={m}
          centerX={center.x}
          centerY={center.y}
        />
      ))}

      {/* Bottom stats */}
      <div className="hud-status">
        <div className="hud-stat">
          <div className="hud-stat-label">Модули</div>
          <div className="hud-stat-value">{loading ? '...' : `${blocks.length} / 10`}</div>
        </div>
        <div className="hud-stat">
          <div className="hud-stat-label">Статус</div>
          <div className="hud-stat-value">{loading ? '...' : 'ONLINE'}</div>
        </div>
        <div className="hud-stat">
          <div className="hud-stat-label">Версия</div>
          <div className="hud-stat-value">v0.2.0</div>
        </div>
      </div>
    </div>
  )
}
