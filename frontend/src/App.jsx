import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "https://log-pipeline.onrender.com";

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetch(`${API_URL}/logs/stats/summary`)
      .then((res) => res.json())
      .then(setSummary);

    fetch(`${API_URL}/logs/recent`)
      .then((res) => res.json())
      .then(setLogs);

    fetch(`${API_URL}/logs/stats/top-endpoints`)
      .then((res) => res.json())
      .then(setTopEndpoints);
  }, []);

  // =========================
  // FILTROS
  // =========================
  const filteredLogs = logs.filter((log) => {
    return (
      log.endpoint.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? log.status_code >= statusFilter : true) &&
      (methodFilter ? log.method === methodFilter : true)
    );
  });

  // =========================
  // DATA CHART
  // =========================
  const chartData = logs.slice(0, 20).map((log, i) => ({
    name: i,
    errors: log.status_code >= 400 ? 1 : 0,
    success: log.status_code < 400 ? 1 : 0,
  }));

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-lg font-bold mb-4">📊 Panel</h2>

        <ul className="space-y-2 text-sm">
          <li className="font-semibold">Dashboard</li>
          <li className="text-gray-500">Logs</li>
          <li className="text-gray-500">Analytics</li>
        </ul>

        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Top Endpoints</h3>
          {topEndpoints.map((e, i) => (
            <div key={i} className="text-xs text-gray-600">
              {e.endpoint} → {e.count}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        <h1 className="text-3xl font-bold mb-2">Log Dashboard</h1>
        <p className="text-sm text-gray-500 mb-4">
          🟢 Sistema activo
        </p>

        {/* ALERT */}
        {summary && summary.errors > summary.success && (
          <div className="bg-red-100 border border-red-300 text-red-600 p-3 rounded mb-4">
            ⚠ Alto porcentaje de errores ({(
              (summary.errors / summary.total) *
              100
            ).toFixed(1)}%)
          </div>
        )}

        {/* KPI CARDS */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <BigCard title="Total" value={summary.total} />
            <BigCard title="Errores" value={summary.errors} color="text-red-500" />
            <BigCard title="Correctos" value={summary.success} color="text-green-600" />
            <BigCard
              title="% Error"
              value={((summary.errors / summary.total) * 100).toFixed(1) + "%"}
              color="text-orange-500"
            />
          </div>
        )}

        {/* CHART */}
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="font-semibold mb-3">Actividad</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="success" stroke="#16a34a" />
              <Line dataKey="errors" stroke="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Buscar endpoint..."
            className="border p-2 rounded"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            onChange={(e) => setStatusFilter(Number(e.target.value))}
          >
            <option value="">Status</option>
            <option value="400">Errores</option>
            <option value="200">Correctos</option>
          </select>

          <select
            className="border p-2 rounded"
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">Método</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow rounded p-4 overflow-auto max-h-[500px]">
          <h2 className="mb-2 font-semibold">
            Logs ({filteredLogs.length})
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
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
                  <td
                    className={
                      log.status_code >= 400
                        ? "text-red-500"
                        : "text-green-600"
                    }
                  >
                    {log.status_code}
                  </td>
                  <td>{log.method}</td>
                  <td>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// =========================
// COMPONENTE KPI
// =========================
function BigCard({ title, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 text-center hover:scale-105 transition">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default App;