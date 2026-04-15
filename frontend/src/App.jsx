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
} from "recharts";

const API_URL = "https://log-pipeline.onrender.com";

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const [lastUpdate, setLastUpdate] = useState(null);

  // 🔄 FETCH DATA
  const fetchData = () => {
    fetch(`${API_URL}/logs/stats/summary`)
      .then((res) => res.json())
      .then((data) => setSummary(data));

    fetch(`${API_URL}/logs/recent`)
      .then((res) => res.json())
      .then((data) => setLogs(data));

    fetch(`${API_URL}/logs/stats/top-endpoints`)
      .then((res) => res.json())
      .then((data) => setTopEndpoints(data));

    setLastUpdate(new Date());
  };

  // 🚀 INIT + AUTO REFRESH (LIVE)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // cada 5s

    return () => clearInterval(interval);
  }, []);

  // 📊 PIE DATA
  const pieData = summary
    ? [
        { name: "Correctos", value: summary.success },
        { name: "Errores", value: summary.errors },
      ]
    : [];

  // 📈 ACTIVIDAD (últimos logs)
  const activityData = logs.slice(0, 20).map((log, i) => ({
    name: i,
    success: log.status_code < 400 ? 1 : 0,
    error: log.status_code >= 400 ? 1 : 0,
  }));

  // 🔍 FILTROS
  const filteredLogs = logs.filter((log) => {
    return (
      log.endpoint.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter ? log.status_code.toString() === statusFilter : true) &&
      (methodFilter ? log.method === methodFilter : true)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <h1 className="text-4xl font-semibold text-center mb-2">
        📊 Log Dashboard
      </h1>

      <p className="text-center text-gray-500 mb-6">
        🟢 LIVE · última actualización:{" "}
        {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
      </p>

      {/* SUMMARY */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow p-4 rounded text-center">
            <p>Total</p>
            <p className="text-xl font-bold">{summary.total}</p>
          </div>
          <div className="bg-white shadow p-4 rounded text-center">
            <p>Errores</p>
            <p className="text-xl font-bold text-red-500">
              {summary.errors}
            </p>
          </div>
          <div className="bg-white shadow p-4 rounded text-center">
            <p>Correctos</p>
            <p className="text-xl font-bold text-green-600">
              {summary.success}
            </p>
          </div>
          <div className="bg-white shadow p-4 rounded text-center">
            <p>% Error</p>
            <p className="text-xl font-bold text-orange-500">
              {(
                (summary.errors / summary.total) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      )}

      {/* GRÁFICOS */}
      <div className="grid grid-cols-4 gap-6 mb-6">

        {/* ACTIVIDAD */}
        <div className="col-span-3 bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">
            📈 Actividad en tiempo real
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#16a34a"
              />
              <Line
                type="monotone"
                dataKey="error"
                stroke="#dc2626"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="col-span-1 bg-white shadow rounded p-4 flex items-center justify-center">
          <div className="relative">
            <PieChart width={220} height={220}>
              <Pie
                data={pieData}
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
              >
                <Cell fill="#16a34a" />
                <Cell fill="#dc2626" />
              </Pie>
            </PieChart>

            {/* CENTER DATA */}
            {summary && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-sm">
                <span className="text-green-600 font-bold">
                  ✔ {summary.success}
                </span>
                <span className="text-red-500 font-bold">
                  ✖ {summary.errors}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar endpoint..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status</option>
          <option value="200">200</option>
          <option value="400">400</option>
          <option value="500">500</option>
        </select>

        <select
          className="border p-2 rounded"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="">Método</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setMethodFilter("");
          }}
          className="bg-black text-white px-4 rounded"
        >
          Reset
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-4 gap-6">

        {/* TOP ENDPOINTS */}
        <div className="col-span-1 bg-white shadow rounded p-4">
          <h2 className="font-semibold mb-2">Top Endpoints</h2>
          <ul className="space-y-1">
            {topEndpoints.map((item, i) => (
              <li key={i}>
                {item.endpoint} → {item.count}
              </li>
            ))}
          </ul>
        </div>

        {/* LOGS */}
        <div className="col-span-3 bg-white shadow rounded p-4 overflow-auto max-h-[400px]">
          <h2 className="font-semibold mb-2">
            Logs ({filteredLogs.length})
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th>Endpoint</th>
                <th>Status</th>
                <th>Método</th>
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
