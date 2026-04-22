import { useEffect, useState } from "react";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Brush,
  ReferenceArea,
} from "recharts";
import {
  Monitor,
  Smartphone,
  Chrome,
  Globe,
  Apple
} from "lucide-react";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const WS_URL = API_URL
  .replace("https://", "wss://")
  .replace("http://", "ws://");


function App() {
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [slowData, setSlowData] = useState([]);
  const [timeSeries, setTimeSeries] = useState([]);

  const [selectedEndpoint, setSelectedEndpoint] = useState(
    localStorage.getItem("endpoint") || "ALL"
  );

  const [selectedMinutes, setSelectedMinutes] = useState(
    Number(localStorage.getItem("minutes")) || 5
  );

  const [errorCount, setErrorCount] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [total, setTotal] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);

  const [showLatency, setShowLatency] = useState(true);
  const [showErrors, setShowErrors] = useState(true);

  const endpointsList = [
    "ALL",
    ...Array.from(new Set(events.map((e) => e.endpoint))),
  ];
  const getOsIcon = (os) => {

  if (os === "Windows")
    return <Monitor size={40} strokeWidth={2.2} />;

  if (os === "Android")
    return <Smartphone size={18} strokeWidth={2.2} />;

  if (os === "iOS")
    return <Apple size={18} strokeWidth={2.2} />;

  if (os === "Linux")
    return <Globe size={18} strokeWidth={2.2} />;

  return <Globe size={18} strokeWidth={2.2} />;
};
  

  useEffect(() => {
    localStorage.setItem("minutes", selectedMinutes);
  }, [selectedMinutes]);

  useEffect(() => {
    localStorage.setItem("endpoint", selectedEndpoint);
  }, [selectedEndpoint]);

  const maxLatency = Math.max(
    ...(timeSeries.length ? timeSeries.map(d => d.avg_response_time || 0) : [0]),
    0.5
  );

  const latencyCeiling = Math.max(
    maxLatency * 1.3,
    1.5
  );
  
  const getMethodColor = (method) => {
    if (method==="GET") return "#60a5fa";
  if (method==="POST") return "#22c55e";
  if (method==="PUT") return "#f59e0b";
  if (method==="DELETE") return "#ef4444";
  return "#94a3b8";
  };

const getSeverity = (e) => {
  if (e.status_code >=500 || e.response_time >1.2)
    return "critical";
  if (e.response_time >0.6)
    return "warning";

  return "healthy";
};
const detectClient = (ua) => {
  if (!ua){
    return {
      browser:"Unknown",
      os:"Unknown"
    };
  }

  const s = ua.toLowerCase();

  let browser="Other";

  if (s.includes("edg")) browser="Edge";
  else if (s.includes("firefox")) browser="Firefox";
  else if (s.includes("chrome")) browser="Chrome";
  else if (s.includes("safari")) browser="Safari";

  let os="Other";

  if (s.includes("windows")){
    os="Windows";
  }
  else if (s.includes("android")){
    os="Android";
  }
  else if (
    s.includes("iphone") ||
    s.includes("ipad")
  ){
    os="iOS";
  }
  else if (s.includes("linux")){
    os="Linux";
  }

  return { browser, os };
};

  const timeAgo = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const past = new Date(timestamp);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return `${Math.floor(diff / 86400)}d`;
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString();
  };

  const formatTimeSafe = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (!isNaN(d)) return d.toLocaleTimeString();
    return value;
  };

  const getSystemHealth = () => {
    if (errorRate > 12 || avgResponseTime > 1.2) return "critical";
    if (errorRate > 5 || avgResponseTime > 0.6) return "warning";
    return "healthy";
  };

  // 🔥 BOTONES TEST
  const sendTestLog = async (type = "ok") => {

  const okEndpoints = [
    "/users",
    "/login",
    "/search",
    "/inventory"
  ];

  const errorEndpoints = [
    "/orders",
    "/payments",
    "/checkout"
  ];

  const randomFrom = (arr) =>
    arr[Math.floor(Math.random() * arr.length)];

  const randomLatency = (min, max) =>
    +(Math.random() * (max - min) + min).toFixed(3);


  const payload =
    type === "error"
      ? {
          endpoint: randomFrom(errorEndpoints),
          method: ["POST","PUT","DELETE"][
            Math.floor(Math.random()*3)
          ],
          status_code: [500,502,503][
            Math.floor(Math.random()*3)
          ],
          response_time: randomLatency(1.0, 2.2),
        }
      : {
          endpoint: randomFrom(okEndpoints),
          method: ["GET","POST"][
            Math.floor(Math.random()*2)
          ],
          status_code: 200,
          response_time: randomLatency(0.15,0.9),
        };


  await fetch(`${API_URL}/logs/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

};

  const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const labelMap = {
    latency_ok: "Latency",
    latency_warn: "Latency",
    latency_crit: "Latency",
    errors: "Errors",
  };

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        padding: "10px 14px",
        borderRadius: "10px",
        color: "#e2e8f0",
      }}
    >
      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
        🕒 {formatTimeSafe(label)}
      </div>

      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{labelMap[p.dataKey] || p.dataKey}</span>
          <span>
            {p.dataKey === "errors"
              ? p.value
              : `${p.value.toFixed(3)}s`}
          </span>
        </div>
      ))}
    </div>
  );
};

  useEffect(() => {
    const fetchAlerts = async () => {
      const res = await fetch(`${API_URL}/alerts`);
      const data = await res.json();

      const formatted = data.map((a) => ({
        type: a.status,
        endpoint: a.endpoint || "system",
        value: a.value,
        timestamp: a.timestamp,
      }));

      setAlerts(formatted);
    };

    fetchAlerts();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws`);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "new_log") {
        setEvents((prev) => [msg.data, ...prev.slice(0, 99)]);
      }

      if (msg.type === "alert" || msg.type === "recovery") {
        setAlerts((prev) => [
          {
            type: msg.type,
            endpoint: msg.data.endpoint || "system",
            value:
              msg.data.avg_response_time ??
              msg.data.error_rate ??
              0,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      let url = `${API_URL}/metrics/window?minutes=${selectedMinutes}`;

      if (selectedEndpoint !== "ALL") {
        url += `&endpoint=${selectedEndpoint}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setSlowData(data.slowest_endpoints || []);
      setErrorCount(data.errors || 0);
      setErrorRate(data.error_rate || 0);
      setTotal(data.total || 0);
      setAvgResponseTime(data.avg_response_time_global || 0);

      let url2 = `${API_URL}/metrics/timeseries?minutes=${selectedMinutes * 2}`;

      if (selectedEndpoint !== "ALL") {
        url2 += `&endpoint=${selectedEndpoint}`;
      }

      const res2 = await fetch(url2);
      const data2 = await res2.json();
      setTimeSeries(data2.series || []);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, [selectedEndpoint, selectedMinutes]);

  const getErrorRateColor = (rate) => {
    if (rate > 12) return "#ef4444";
    if (rate > 5) return "#f59e0b";
    return "#22c55e";
  };

  const getLatencyColor = (value) => {
    if (value > 1.2) return "#ef4444";
    if (value > 0.6) return "#f59e0b";
    return "#22c55e";
  };

  const getBarColor = (value) => {
    if (value > 0.8) return "#ef4444";
    if (value > 0.5) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "40px" }}>🚀 LOG DASHBOARD TEST 999</h1>

      {/* HEADER MÁS RESPIRADO */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          ⏱ Ventana:
          <select
            value={selectedMinutes}
            onChange={(e) => setSelectedMinutes(Number(e.target.value))}
            style={{ marginLeft: "8px" }}
          >
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
          </select>
        </div>

        <div>
          📍 Endpoint:
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            style={{ marginLeft: "8px" }}
          >
            {endpointsList.map((ep) => (
              <option key={ep} value={ep}>
                {ep}
              </option>
            ))}
          </select>
        </div>

        <div>
          {getSystemHealth() === "healthy" && (
            <span style={{
              background: "#22C55E26",
              color: "#22c55e",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid #22C55E4D",
            }}>
              🟢 Healthy
            </span>
          )}
          {getSystemHealth() === "warning" && (
            <span style={{
              background: "#F59E0B26",
              color: "#f59e0b",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid #F59E0B4D",
            }}>
              🟡 Warning
            </span>
          )}
          {getSystemHealth() === "critical" && (
            <span style={{
              background: "rgba(239,68,68,0.15)",
              color: "#ef4444",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(239,68,68,0.3)",
            }}>
              🔴 Critical
            </span>
          )}
        </div>
                  <button
  onClick={() => sendTestLog("ok")}
  style={{
    background: "#22c55e",
    color: "#022c22",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
  + OK
</button>

<button
  onClick={() => sendTestLog("error")}
  style={{
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    
  }}
>
  + Error
</button>
      </div>

      {/* MÁS ESPACIO ENTRE BLOQUES */}
      <div style={{ marginBottom: "30px" }} className="grid">
        <div className="panel">
          <h2>📊 Total Eventos</h2>
          <div className="metric">{total}</div>
        </div>

        <div className="panel">
          <h2>❌ Errores</h2>
          <div className="metric" style={{ color: "#ef4444" }}>
            {errorCount}
          </div>
        </div>

        <div className="panel">
          <h2>⏱ Avg Response Time</h2>
          <div
            className="metric"
            style={{ color: getLatencyColor(avgResponseTime) }}
          >
            {avgResponseTime}s
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }} className="panel error-rate-panel">
        <h2>⚠️ Error Rate</h2>
        <div
          className="metric"
          style={{ color: getErrorRateColor(errorRate) }}
        >
          {Math.round(errorRate)}%
        </div>
      </div>

      {/* RESTO SIN TOCAR */}
      <div className="grid">
        <div className="panel events-panel">
          <h2>📡 Eventos</h2>
          {events.map((e, i) => {
  const isError = e.status_code >= 400;
  const client = detectClient(e.user_agent);

  return (
    <div
      key={i}
      className="item"
      style={{
        borderLeft: `4px solid ${
          isError ? "#ef4444" : "#22c55e"
        }`,
        padding: "14px 14px 14px 16px"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px"
        }}
      >
        <span
          style={{
            background: getMethodColor(e.method),
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "700",
            color:"#fff"
          }}
        >
          {e.method}
        </span>

        <strong style={{ fontSize: "20px" }}>
          {e.endpoint}
        </strong>

        <span>
          → {e.status_code}
        </span>

        <span
          style={{
            marginLeft: "auto",
            color:
              getSeverity(e) === "critical"
                ? "#ef4444"
                : getSeverity(e) === "warning"
                ? "#f59e0b"
                : "#22c55e"
          }}
        >
          {getSeverity(e)}
        </span>
      </div>

      {/* META */}
      <div
        style={{
          fontSize: "14px",
          opacity: .85,
          marginBottom: "8px"
        }}
      >
        ⏱ {e.response_time?.toFixed(3)}s
        &nbsp;&nbsp;
        🕒 {formatTime(e.timestamp)}
      </div>

      {/* CLIENT */}
      <div
        style={{
          display:"flex",
          alignItems:"center",
          gap:"12px",
          fontSize:"14px",
          opacity:.75,
          marginBottom:"10px"
        }}
      >
        <span
          style={{
            display:"flex",
            alignItems:"center",
            gap:"6px"
          }}
        >
          {getOsIcon(client.os)}
          {client.os} • {client.browser}
        </span>

        <span>
          🌍 {e.ip}
        </span>
      </div>

      {/* TAGS */}
      <div
        style={{
          display:"flex",
          gap:"8px",
          flexWrap:"wrap"
        }}
      >
        {e.response_time > 0.6 && (
          <span
            style={{
              background:"#f59e0b22",
              color:"#f59e0b",
              padding:"4px 8px",
              borderRadius:"999px",
              fontSize:"12px"
            }}
          >
            slow
          </span>
        )}

        {e.status_code >= 500 && (
          <span
            style={{
              background:"#ef444422",
              color:"#ef4444",
              padding:"4px 8px",
              borderRadius:"999px",
              fontSize:"12px"
            }}
          >
            5xx
          </span>
        )}

        <span
          style={{
            background:"#334155",
            padding:"4px 8px",
            borderRadius:"999px",
            fontSize:"12px"
          }}
        >
          {e.endpoint.replace("/", "")}
        </span>
      </div>
    </div>
  );
})}
        </div>

        <div className="panel alerts-panel">
          <h2>🚨 Alertas</h2>
          {alerts.map((a, i) => (
            <div key={i} className={`item ${a.type}`}>
              <div>
                {a.type === "alert"
                  ? "🚨 High error rate"
                  : "🟢 Recovered"}
              </div>

              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                {a.endpoint} • {a.value}% • hace {timeAgo(a.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>📈 Evolución</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeries}>
  {/* ZONAS */}
  <ReferenceArea
    yAxisId="left"
    y1={0}
    y2={0.6}
    fill="#22c55e"
    fillOpacity={0.04}
  />
  <ReferenceArea
    yAxisId="left"
    y1={0.6}
    y2={1.1}
    fill="#f59e0b"
    fillOpacity={0.06}
  />
  <ReferenceArea
    yAxisId="left"
    y1={1.1}
    y2={latencyCeiling}
    fill="#ef4444"
    fillOpacity={0.1}
  />

  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />

  <XAxis dataKey="minute" tickFormatter={formatTimeSafe} />

  <YAxis
    yAxisId="left"
    domain={[0, latencyCeiling]}
    tickFormatter={(v) => `${v.toFixed(1)}s`}
  />

  <YAxis
    yAxisId="right"
    orientation="right"
    domain={[0,"auto"]}
  />

  <Tooltip content={<CustomTooltip />} />
  <Legend />

  {/* LATENCY */}
  {showLatency && (
    <>
    <Line
      yAxisId="left"
      type="monotone"
      dataKey="avg_response_time"
      stroke="#60a5fa"
      strokeWidth={2.5}
      name="Latency"
      dot={{ r: 4 }}
    />
    </>
  )}

  {/* ERRORS */}
  {showErrors && (
    <Line
      yAxisId="right"
      type="monotone"
      dataKey="errors"
      stroke="#ef4444"
      strokeWidth={2.5}
      name="Errors"
      dot={{ r: 4 }}
    />
  )}

  <ReferenceLine
    y={0.6}
    yAxisId="left"
    stroke="#f59e0b"
    strokeDasharray="4 4"
    label={{ value: "warning", position: "right", fill: "#f59e0b" }}
  />

  <ReferenceLine
    y={1.1}
    yAxisId="left"
    stroke="#ef4444"
    strokeDasharray="4 4"
    label={{ value: "critical", position: "right", fill: "#ef4444" }}
  />

  <Brush
    dataKey="minute"
    height={8}
    stroke="#334155"
    travellerWidth={8}
    fill="#0f172a"
    tickFormatter={() => ""}
  />
</LineChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <h2>🐢 Endpoints lentos</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={slowData}>
            <XAxis dataKey="endpoint" />
            <YAxis />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />

            <Bar dataKey="avg_response_time">
              {slowData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={getBarColor(entry.avg_response_time)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;