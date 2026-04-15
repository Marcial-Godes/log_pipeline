import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API_URL = "https://log-pipeline.onrender.com";

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

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

  // =====================
  // RESET FILTROS
  // =====================
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setMethodFilter("");
  };

  // =====================
  // FILTROS
  // =====================
  const filteredLogs = logs.filter((log) => {
    return (
      log.endpoint.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? log.status_code >= statusFilter : true) &&
      (methodFilter ? log.method === methodFilter : true)
    );
  });

  // =====================
  // CHART DATA
  // =====================
  const grouped = {};

  logs.slice(0, 50).forEach((log) => {
    const time = new Date(log.timestamp).toLocaleTimeString();

    if (!grouped[time]) {
      grouped[time] = { time, errors: 0, success: 0 };
    }

    if (log.status_code >= 400) grouped[time].errors++;
    else grouped[time].success++;
  });

  const chartData = Object.values(grouped);

  // =====================
  // PIE DATA
  // =====================
  const pieData = summary
    ? [
        { name: "Correctos", value: summary.success },
        { name: "Errores", value: summary.errors },
      ]
    : [];

  const COLORS = ["#16a34a", "#dc2626"];

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
        <p className="text-sm text-gray-500 mb-4">🟢 Sistema activo</p>

        {/* KPIs */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card title="Total" value={summary.total} />
            <Card title="Errores" value={summary.errors} color="text-red-500" />
            <Card title="Correctos" value={summary.success} color="text-green-600" />
          </div>
        )}

        {/* CHART + PIE */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          {/* LINE */}
          <div className="col-span-2 bg-white shadow rounded p-4">
            <h2 className="font-semibold mb-3">Actividad</h2>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line dataKey="success" stroke="#16a34a" />
                <Line dataKey="errors" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PIE */}
          <div className="bg-white shadow rounded p-4 flex items-center justify-center">
            {summary && (
              <div className="relative">

                <PieChart width={220} height={220}>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>

                {/* TEXTO CENTRO */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-green-600 font-bold text-lg">
                    ✔ {summary.success}
                  </p>
                  <p className="text-red-500 font-bold text-lg">
                    ✖ {summary.errors}
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 mb-4">
          <input
            value={search}
            placeholder="Buscar endpoint..."
            className="border p-2 rounded"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            className="border p-2 rounded"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="400">Errores</option>
            <option value="200">Correctos</option>
          </select>

          <select
            value={methodFilter}
            className="border p-2 rounded"
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">Método</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>

          {/* BOTÓN LIMPIAR */}
          <button
            onClick={clearFilters}
            className="bg-gray-800 text-white px-4 rounded"
          >
            Limpiar
          </button>
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

function Card({ title, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default App;