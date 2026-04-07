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
function ModuleBlock({ module, centerX, centerY, isSelected, onClick }) {
  const pos = modulePosition(module.angle, module.distance)
  const blockX = centerX + pos.x
  const blockY = centerY + pos.y

  return (
    <div
      className={`module-block${isSelected ? ' module-block--selected' : ''}`}
      style={{ left: blockX, top: blockY }}
      onClick={() => onClick(module)}
    >
      <div className="module-card" style={isSelected ? { borderColor: module.color, boxShadow: `0 0 20px ${module.color}44` } : {}}>
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

// ── Function Panel (профессии) ────────────────────────────────────
function FunctionPanel({ fn, professions, loading, onClose }) {
  return (
    <div className="function-panel">
      <div className="block-panel-header">
        <div className="block-panel-title">
          <div>
            <div className="block-panel-name">{fn.name}</div>
            <div className="block-panel-sub">ПРОФЕССИИ</div>
          </div>
        </div>
        <button className="block-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="block-panel-desc">{fn.description}</div>

      <div className="block-panel-functions">
        {loading ? (
          <div className="block-panel-loading">ЗАГРУЗКА...</div>
        ) : professions.length === 0 ? (
          <div className="block-panel-loading">НЕТ ДАННЫХ</div>
        ) : (
          professions.map((p, i) => (
            <div key={p.id} className="function-item profession-item">
              <div className="function-index">0{i + 1}</div>
              <div className="function-body">
                <div className="function-name">{p.name}</div>
                <div className="function-desc">{p.description}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Block Panel (drill-down) ───────────────────────────────────────
function BlockPanel({ block, functions, loading, onClose, onFunctionClick, selectedFunction }) {
  return (
    <div className="block-panel">
      <div className="block-panel-header">
        <div className="block-panel-title">
          <span className="block-panel-icon">{block.icon_hover}</span>
          <div>
            <div className="block-panel-name">{block.name}</div>
            <div className="block-panel-sub">ФУНКЦИИ БЛОКА</div>
          </div>
        </div>
        <button className="block-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="block-panel-desc">{block.description}</div>

      <div className="block-panel-functions">
        {loading ? (
          <div className="block-panel-loading">ЗАГРУЗКА...</div>
        ) : functions.length === 0 ? (
          <div className="block-panel-loading">НЕТ ДАННЫХ</div>
        ) : (
          functions.map((fn, i) => (
            <div
              key={fn.id}
              className={`function-item${selectedFunction?.id === fn.id ? ' function-item--selected' : ''}`}
              onClick={() => onFunctionClick(fn)}
            >
              <div className="function-index">0{i + 1}</div>
              <div className="function-body">
                <div className="function-name">{fn.name}</div>
                <div className="function-desc">{fn.description}</div>
              </div>
              <div className="function-arrow">›</div>
            </div>
          ))
        )}
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
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [functions, setFunctions] = useState([])
  const [functionsLoading, setFunctionsLoading] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState(null)
  const [professions, setProfessions] = useState([])
  const [professionsLoading, setProfessionsLoading] = useState(false)

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

  const handleBlockClick = useCallback((block) => {
    if (selectedBlock?.id === block.id) {
      setSelectedBlock(null)
      setFunctions([])
      setSelectedFunction(null)
      setProfessions([])
      return
    }
    setSelectedBlock(block)
    setFunctions([])
    setSelectedFunction(null)
    setProfessions([])
    setFunctionsLoading(true)
    supabase
      .from('functions')
      .select('*')
      .eq('block_id', block.id)
      .order('order_index')
      .then(({ data, error }) => {
        if (!error && data) setFunctions(data)
        setFunctionsLoading(false)
      })
  }, [selectedBlock])

  const handleFunctionClick = useCallback((fn) => {
    if (selectedFunction?.id === fn.id) {
      setSelectedFunction(null)
      setProfessions([])
      return
    }
    setSelectedFunction(fn)
    setProfessions([])
    setProfessionsLoading(true)
    supabase
      .from('professions')
      .select('*')
      .eq('function_id', fn.id)
      .order('order_index')
      .then(({ data, error }) => {
        if (!error && data) setProfessions(data)
        setProfessionsLoading(false)
      })
  }, [selectedFunction])

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
          isSelected={selectedBlock?.id === m.id}
          onClick={handleBlockClick}
        />
      ))}

      {/* Block panel */}
      {selectedBlock && (
        <BlockPanel
          block={selectedBlock}
          functions={functions}
          loading={functionsLoading}
          selectedFunction={selectedFunction}
          onFunctionClick={handleFunctionClick}
          onClose={() => { setSelectedBlock(null); setFunctions([]); setSelectedFunction(null); setProfessions([]) }}
        />
      )}

      {/* Function panel */}
      {selectedFunction && (
        <FunctionPanel
          fn={selectedFunction}
          professions={professions}
          loading={professionsLoading}
          onClose={() => { setSelectedFunction(null); setProfessions([]) }}
        />
      )}

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
          <div className="hud-stat-value">v0.3.0</div>
        </div>
      </div>
    </div>
  )
}
