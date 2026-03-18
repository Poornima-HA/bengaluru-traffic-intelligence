import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useEffect } from 'react'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const junctions = [
  { name: "Silk Board", position: [12.9177, 77.6228], level: "high", vehicles: 1200, delay: "25 mins" },
  { name: "Marathahalli", position: [12.9591, 77.6974], level: "high", vehicles: 980, delay: "20 mins" },
  { name: "KR Puram", position: [13.0035, 77.6950], level: "medium", vehicles: 650, delay: "12 mins" },
  { name: "Hebbal", position: [13.0358, 77.5970], level: "medium", vehicles: 700, delay: "10 mins" },
  { name: "Tin Factory", position: [12.9987, 77.6609], level: "low", vehicles: 300, delay: "3 mins" },
  { name: "Nagawara", position: [13.0438, 77.6180], level: "low", vehicles: 250, delay: "2 mins" },
]

const colors = { high: "red", medium: "orange", low: "green" }
const signals = { high: 90, medium: 45, low: 20 }
const alternateRoutes = {
  "Silk Board": "Take Hosur Road → Bommanahalli → BTM Layout",
  "Marathahalli": "Take Outer Ring Road → Kadugodi → Whitefield",
  "KR Puram": "Take Old Madras Road → Banaswadi → Kalyan Nagar",
  "Hebbal": "Take Bellary Road → Kogilu → Yelahanka",
  "Tin Factory": "Take ITPL Road → Mahadevapura → Whitefield",
  "Nagawara": "Take HBR Layout → Kalyan Nagar → Banaswadi",
}
const predictions = {
  "Silk Board": ["🔴 HIGH", "🔴 HIGH", "🟡 MEDIUM", "🟢 LOW"],
  "Marathahalli": ["🔴 HIGH", "🟡 MEDIUM", "🟡 MEDIUM", "🟢 LOW"],
  "KR Puram": ["🟡 MEDIUM", "🟡 MEDIUM", "🟢 LOW", "🟢 LOW"],
  "Hebbal": ["🟡 MEDIUM", "🟢 LOW", "🟢 LOW", "🟢 LOW"],
  "Tin Factory": ["🟢 LOW", "🟢 LOW", "🟢 LOW", "🟡 MEDIUM"],
  "Nagawara": ["🟢 LOW", "🟢 LOW", "🟢 LOW", "🟢 LOW"],
}

function App() {
  const [selected, setSelected] = useState(null)
  const [aiAlert, setAiAlert] = useState("")
  const [loadingAI, setLoadingAI] = useState(false)
  const [showPrediction, setShowPrediction] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

useEffect(() => {
  const clock = setInterval(() => setCurrentTime(new Date()), 1000)
  return () => clearInterval(clock)
}, [])

const hour = currentTime.getHours()
const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)
  const [timers, setTimers] = useState({
    "Silk Board": 90, "Marathahalli": 90, "KR Puram": 45,
    "Hebbal": 45, "Tin Factory": 20, "Nagawara": 20
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = {}
        junctions.forEach(j => {
          updated[j.name] = prev[j.name] <= 1 ? signals[j.level] : prev[j.name] - 1
        })
        return updated
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function getAIAlert(junction) {
    setLoadingAI(true)
    setAiAlert("")
    await new Promise(resolve => setTimeout(resolve, 1500))
    if (junction.level === "high") {
      setAiAlert(`⚠️ Critical congestion at ${junction.name}! ${junction.vehicles} vehicles causing ${junction.delay} delay. Recommend alternate routes via Outer Ring Road. Signal extended to ${signals[junction.level]}s.`)
    } else if (junction.level === "medium") {
      setAiAlert(`🟡 Moderate traffic at ${junction.name}. ${junction.vehicles} vehicles detected. Monitor situation. Signal timing optimal at ${signals[junction.level]}s.`)
    } else {
      setAiAlert(`✅ Traffic flowing smoothly at ${junction.name}. Only ${junction.vehicles} vehicles. No action needed. Signal at ${signals[junction.level]}s.`)
    }
    setLoadingAI(false)
  }

  function handleJunctionClick(j) {
    setSelected(j)
    setAiAlert("")
    setShowPrediction(false)
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "Arial", position: "relative" }}>

      {/* Left Sidebar */}
      <div style={{ width: "280px", background: "#1a1a2e", color: "white", padding: "16px", overflowY: "auto", flexShrink: 0 }}>
        <h2 style={{ color: "#00d4ff", marginBottom: "4px" }}>🚦 Bengaluru Traffic</h2>
        <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "8px" }}>AI-Powered Smart Mobility</p>
        <div style={{ background: "#16213e", padding: "8px", borderRadius: "8px", marginBottom: "12px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#00d4ff" }}>
        {currentTime.toLocaleTimeString()}
      </div>
      <div style={{ fontSize: "11px", marginTop: "4px", color: isRushHour ? "#ff4444" : "#00cc44", fontWeight: "bold" }}>
        {isRushHour ? "🔴 RUSH HOUR ACTIVE" : "🟢 NORMAL TRAFFIC HOURS"}
       </div>
      </div>
        <button onClick={() => {
          const randomJunction = junctions[Math.floor(Math.random() * junctions.length)]
          alert(`🚨 EMERGENCY ALERT!\nAmbulance detected near ${randomJunction.name}!\n\n✅ Signal cleared for emergency route\n🔀 All vehicles rerouting via:\n${alternateRoutes[randomJunction.name]}\n\n⏱ ETA clearance: 30 seconds`)
        }}
          style={{ background: "#ff0000", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", width: "100%", fontWeight: "bold", marginBottom: "12px", fontSize: "13px" }}>
          🚨 Simulate Emergency Vehicle
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          <div style={{ background: "#16213e", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ff4444" }}>2</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>High Traffic</div>
          </div>
          <div style={{ background: "#16213e", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ff8800" }}>2</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>Medium Traffic</div>
          </div>
          <div style={{ background: "#16213e", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00cc44" }}>2</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>Low Traffic</div>
          </div>
          <div style={{ background: "#16213e", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#00d4ff" }}>4080</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>Total Vehicles</div>
          </div>
        </div>

        <h3 style={{ fontSize: "13px", color: "#aaa", marginBottom: "8px" }}>JUNCTIONS</h3>
        {junctions.map((j, i) => (
          <div key={i} onClick={() => handleJunctionClick(j)}
            style={{ background: selected?.name === j.name ? "#0f3460" : "#16213e", padding: "10px", borderRadius: "8px", marginBottom: "8px", cursor: "pointer", borderLeft: `4px solid ${colors[j.level]}` }}>
            <div style={{ fontWeight: "bold", fontSize: "13px" }}>{j.name}</div>
            <div style={{ fontSize: "11px", color: "#aaa" }}>🚗 {j.vehicles} vehicles · ⏱ {j.delay}</div>
            <div style={{ fontSize: "11px", marginTop: "4px" }}>
              🚦 Signal: <span style={{ color: colors[j.level] }}>{timers[j.name]}s</span>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "16px", fontSize: "11px", color: "#555", textAlign: "center" }}>
          Powered by Azure AI Services
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {junctions.map((j, i) => (
            <div key={i}>
              <Circle center={j.position} radius={500} color={colors[j.level]} fillColor={colors[j.level]} fillOpacity={0.4} />
              <Marker position={j.position} eventHandlers={{ click: () => handleJunctionClick(j) }}>
                <Popup>
                  <b>{j.name}</b><br />
                  Traffic: <span style={{ color: colors[j.level] }}><b>{j.level.toUpperCase()}</b></span><br />
                  Vehicles: {j.vehicles}<br />
                  Delay: {j.delay}
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>
      </div>

      {/* Right Popup Panel */}
      {selected && (
        <div style={{
          position: "absolute", right: 0, top: 0, height: "100%",
          width: "300px", background: "#1a1a2e", color: "white",
          padding: "16px", overflowY: "auto", boxShadow: "-4px 0 20px rgba(0,0,0,0.5)",
          zIndex: 1000, borderLeft: `4px solid ${colors[selected.level]}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ color: "#00d4ff", margin: 0 }}>📍 {selected.name}</h3>
            <button onClick={() => { setSelected(null); setAiAlert(""); setShowPrediction(false) }}
              style={{ background: "transparent", color: "#aaa", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
          </div>

          <div style={{ background: "#16213e", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}>
            <p style={{ fontSize: "13px", margin: "4px 0" }}>Status: <span style={{ color: colors[selected.level], fontWeight: "bold" }}>{selected.level.toUpperCase()}</span></p>
            <p style={{ fontSize: "13px", margin: "4px 0" }}>🚗 Vehicles: {selected.vehicles}</p>
            <p style={{ fontSize: "13px", margin: "4px 0" }}>⏱ Avg Delay: {selected.delay}</p>
            <p style={{ fontSize: "13px", margin: "4px 0" }}>🚦 Signal Timer: <span style={{ color: colors[selected.level] }}>{timers[selected.name]}s</span></p>
          </div>

          <button onClick={() => getAIAlert(selected)}
            style={{ background: "#00d4ff", color: "#000", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", width: "100%", fontWeight: "bold", marginBottom: "8px" }}>
            {loadingAI ? "🤖 Analyzing..." : "🤖 Get Azure AI Alert"}
          </button>

          {aiAlert && (
            <div style={{ background: "#0a2a4a", padding: "10px", borderRadius: "6px", marginBottom: "8px", fontSize: "12px", lineHeight: "1.6", border: "1px solid #00d4ff" }}>
              {aiAlert}
            </div>
          )}

          <button onClick={() => setShowPrediction(!showPrediction)}
            style={{ background: "#7f77dd", color: "white", border: "none", padding: "10px", borderRadius: "6px", cursor: "pointer", width: "100%", fontWeight: "bold", marginBottom: "8px" }}>
            📈 {showPrediction ? "Hide" : "Show"} Traffic Prediction
          </button>

          {showPrediction && (
            <div style={{ background: "#0a2a4a", padding: "10px", borderRadius: "6px", marginBottom: "8px", fontSize: "12px" }}>
              <b style={{ color: "#00d4ff" }}>Next 4 hours prediction:</b>
              <div style={{ marginTop: "6px" }}>
                {predictions[selected.name].map((p, i) => (
                  <div key={i} style={{ padding: "6px 0", borderBottom: "0.5px solid #1a3a5a", fontSize: "13px" }}>
                    +{i + 1} hr → {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.level === "high" && (
            <div style={{ background: "#ff4444", padding: "10px", borderRadius: "6px", fontSize: "12px", lineHeight: "1.6" }}>
              ⚠️ High congestion!<br />
              🔀 Alternate Route:<br />
              <b>{alternateRoutes[selected.name]}</b>
            </div>
          )}
          {selected.level === "medium" && (
            <div style={{ background: "#ff8800", padding: "10px", borderRadius: "6px", fontSize: "12px", lineHeight: "1.6" }}>
              🟡 Moderate congestion!<br />
              🔀 Suggested: {alternateRoutes[selected.name]}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App