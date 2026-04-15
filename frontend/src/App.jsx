import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const API_URL = "https://log-pipeline.onrender.com";
const COLORS = ["#22c55e", "#ef4444"];

function Card({ title, value, color = "" }) {
  return (
    <div className="bg-white shadow rounded w-28 h-20 flex flex-col justify-center items-center">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = () => {
    Promise.all([
      fetch(`${API_URL}/logs/stats/summary`).then((res) => res.json()),
      fetch(`${API_URL}/logs/recent`).then((res) => res.json()),
      fetch(`${API_URL}/logs/stats/top-endpoints`).then((res) => res.json()),
    ])
      .then(([s, l, t]) => {
        setSummary(s);
        setLogs(l);
        setTopEndpoints(t);
        setLastUpdate(new Date().toLocaleTimeString());
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = summary
    ? [
        { name: "Correctos", value: summary.success },
        { name: "Errores", value: summary.errors },
      ]
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-semibold text-center mb-2">
        📊 Log Dashboard
      </h1>

      {lastUpdate && (
        <p className="text-center text-sm text-gray-500 mb-6">
          🟢 LIVE · {lastUpdate}
        </p>
      )}

      {/* TOP */}
      {summary && (
        <div className="flex gap-6 justify-center items-center mb-8 flex-wrap">
          <Card title="Total" value={summary.total} />
          <Card title="Errores" value={summary.errors} color="text-red-500" />
          <Card title="Correctos" value={summary.success} color="text-green-600" />

          {/* CHART */}
          <div className="bg-white shadow rounded p-4 flex items-center justify-center">
            <PieChart width={220} height={220}>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}

                {/* 🔥 TEXTO CENTRAL CORRECTO */}
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  style={{ fontSize: "12px", fill: "#666" }}
                >
                  Correctos
                </text>

                <text
                  x="50%"
                  y="52%"
                  textAnchor="middle"
                  style={{ fontSize: "16px", fontWeight: "bold", fill: "#22c55e" }}
                >
                  {summary.success}
                </text>

                <text
                  x="50%"
                  y="62%"
                  textAnchor="middle"
                  style={{ fontSize: "12px", fill: "#666" }}
                >
                  Errores
                </text>

                <text
                  x="50%"
                  y="70%"
                  textAnchor="middle"
                  style={{ fontSize: "16px", fontWeight: "bold", fill: "#ef4444" }}
                >
                  {summary.errors}
                </text>
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-4 gap-6">
        {/* LEFT */}
        <div className="col-span-1 bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Top Endpoints</h2>
          <ul className="text-sm space-y-1">
            {topEndpoints.map((item, i) => (
              <li key={i}>
                {item.endpoint} → {item.count}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="col-span-3 bg-white shadow rounded p-4 overflow-auto max-h-[400px]">
          <h2 className="font-semibold mb-2">Logs</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th>Endpoint</th>
                <th>Status</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b">
                  <td>{log.endpoint}</td>
                  <td
                    className={
                      log.status_code >= 400
                        ? "text-red-500 font-semibold"
                        : "text-green-600"
                    }
                  >
                    {log.status_code}
                  </td>
                  <td>{log.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;