import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_URL = "https://log-pipeline.onrender.com";

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const fetchData = async () => {
    try {
      const [summaryRes, logsRes, topRes] = await Promise.all([
        fetch(`${API_URL}/logs/stats/summary`),
        fetch(`${API_URL}/logs/recent`),
        fetch(`${API_URL}/logs/stats/top-endpoints`)
      ]);

      setSummary(await summaryRes.json());
      setLogs(await logsRes.json());
      setTopEndpoints(await topRes.json());
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ===== FILTROS =====
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.endpoint
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus = statusFilter
      ? log.status_code === Number(statusFilter)
      : true;

    const matchesMethod = methodFilter
      ? log.method === methodFilter
      : true;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // ===== 🔥 TRANSFORMACIÓN PARA GRÁFICO =====
  const chartData = Object.values(
    logs.reduce((acc, log) => {
      const time = new Date(log.timestamp)
        .toLocaleTimeString()
        .slice(0, 5); // HH:mm

      if (!acc[time]) {
        acc[time] = { time, success: 0, errors: 0 };
      }

      if (log.status_code >= 400) {
        acc[time].errors += 1;
      } else {
        acc[time].success += 1;
      }

      return acc;
    }, {})
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-semibold text-center mb-2">
        📊 Log Dashboard
      </h1>

      <p className="text-center text-sm text-gray-500 mb-6">
        🟢 LIVE · {lastUpdate}
      </p>

      {/* ===== SUMMARY ===== */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card title="Total" value={summary.total} />
          <Card title="Errores" value={summary.errors} color="text-red-500" />
          <Card title="Correctos" value={summary.success} color="text-green-600" />
        </div>
      )}

      {/* ===== 🔥 GRÁFICO ===== */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="font-semibold mb-4">Actividad en el tiempo</h2>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="success"
              stroke="#16a34a"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="errors"
              stroke="#dc2626"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ===== FILTROS ===== */}
      <div className="bg-white shadow rounded p-4 mb-6 flex gap-4 flex-wrap">
        <input
          placeholder="Buscar endpoint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Status</option>
          <option value="200">200</option>
          <option value="400">400</option>
          <option value="500">500</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">Método</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Top Endpoints</h2>
          {topEndpoints.map((item, i) => (
            <p key={i}>{item.endpoint} → {item.count}</p>
          ))}
        </div>

        <div className="col-span-3 bg-white shadow rounded p-4 overflow-auto max-h-[400px]">
          <h2 className="font-semibold mb-2">
            Logs ({filteredLogs.length})
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th>Endpoint</th>
                <th>Status</th>
                <th>Método</th>
                <th>Tiempo</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={i} className="border-b">
                  <td>{log.endpoint}</td>
                  <td className={log.status_code >= 400 ? "text-red-500" : "text-green-600"}>
                    {log.status_code}
                  </td>
                  <td>{log.method}</td>
                  <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default App;
