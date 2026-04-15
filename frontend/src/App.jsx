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
    <div className="bg-white shadow rounded p-4 w-32 h-24 flex flex-col justify-center items-center hover:scale-105 transition">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
      .then(([summaryData, logsData, endpointsData]) => {
        setSummary(summaryData);
        setLogs(logsData);
        setTopEndpoints(endpointsData);
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
      {/* HEADER */}
      <h1 className="text-4xl font-semibold text-center mb-2">
        📊 Log Dashboard
      </h1>

      {lastUpdate && (
        <p className="text-center text-sm text-gray-500 mb-6">
          🟢 LIVE · última actualización: {lastUpdate}
        </p>
      )}

      {/* TOP SECTION */}
      {summary && (
        <div className="flex gap-8 justify-center items-center mb-8 flex-wrap">
          <Card title="Total" value={summary.total} />
          <Card title="Errores" value={summary.errors} color="text-red-500" />
          <Card title="Correctos" value={summary.success} color="text-green-600" />

          {/* PIE CHART */}
          <div className="bg-white shadow rounded p-4 flex items-center justify-center hover:scale-105 transition">
            <PieChart width={220} height={220}>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                label={({ value, x, y }) => (
                  <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {value}
                  </text>
                )}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-4 gap-6">
        {/* LEFT */}
        <div className="col-span-1 bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Top Endpoints</h2>
          <ul className="space-y-1 text-sm">
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