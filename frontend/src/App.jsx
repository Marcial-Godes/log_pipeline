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
  }, []);

  // =========================
  // RESET FILTROS
  // =========================
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setMethodFilter("");
  };

  // =========================
  // FILTRADO
  // =========================
  const filteredLogs = logs.filter((log) => {
    return (
      log.endpoint.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? log.status_code >= statusFilter : true) &&
      (methodFilter ? log.method === methodFilter : true)
    );
  });

  // =========================
  // AGRUPACIÓN PARA CHART
  // =========================
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

  // =========================
  // PIE DATA
  // =========================
  const pieData = summary
    ? [
        { name: "Correctos", value: summary.success },
        { name: "Errores", value: summary.errors },
      ]
    : [];

  const COLORS = ["#16a34a", "#dc2626"];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        📊 Log Dashboard
      </h1>

      {/* KPI CARDS */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card title="Total" value={summary.total} />
          <Card title="Errores" value={summary.errors} color="text-red-500" />
          <Card title="Correctos" value={summary.success} color="text-green-600" />
          <Card
            title="% Error"
            value={`${((summary.errors / summary.total) * 100).toFixed(1)}%`}
            color="text-orange-500"
          />
        </div>
      )}

      {/* CHART + DONUT */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        {/* LINE CHART */}
        <div className="col-span-2 bg-white shadow rounded p-4">
          <h2 className="mb-3 font-semibold">Actividad</h2>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line dataKey="success" stroke="#16a34a" strokeWidth={2} />
              <Line dataKey="errors" stroke="#dc2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* DONUT */}
        <div className="bg-white shadow rounded p-4 flex items-center justify-center">
          {summary && (
            <div className="relative">

              <PieChart width={260} height={260}>
                <Pie
                  data={pieData}
                  innerRadius={85}
                  outerRadius={120}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>

              {/* CENTRO DEL DONUT */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-gray-500">Logs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {summary.total}
                </p>

                <div className="flex gap-3 mt-1 text-sm">
                  <span className="text-green-600 font-semibold">
                    {summary.success}
                  </span>
                  <span className="text-red-500 font-semibold">
                    {summary.errors}
                  </span>
                </div>
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
          className="border p-2 rounded w-64"
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

        <button
          onClick={clearFilters}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
        >
          Limpiar
        </button>
      </div>

      {/* TABLA */}
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

                <td className={log.status_code >= 400 ? "text-red-500" : "text-green-600"}>
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