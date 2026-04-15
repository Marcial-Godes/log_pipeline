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
  const [alerts, setAlerts] = useState([]);

  const [lastErrors, setLastErrors] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const [summaryRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/logs/stats/summary`),
        fetch(`${API_URL}/logs/recent`),
      ]);

      const summaryData = await summaryRes.json();
      const logsData = await logsRes.json();

      setSummary(summaryData);
      setLogs(logsData);

      // 🔥 ALERTAS ROBUSTAS
      if (lastErrors !== null && summaryData.errors > lastErrors) {
        const diff = summaryData.errors - lastErrors;

        setAlerts((prev) => [
          {
            id: Date.now(),
            message: `🚨 ${diff} nuevos errores`,
          },
          ...prev,
        ]);
      }

      setLastErrors(summaryData.errors);
      setLastUpdate(new Date());

    } catch (error) {
      console.error("ERROR:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // más reactivo
    return () => clearInterval(interval);
  }, [lastErrors]);

  if (!summary) return <div className="p-6">Cargando...</div>;

  const pieData = [
    { name: "Correctos", value: summary.success },
    { name: "Errores", value: summary.errors },
  ];

  const activityData = logs.slice(0, 20).map((log, i) => ({
    name: i,
    success: log.status_code < 400 ? 1 : 0,
    error: log.status_code >= 400 ? 1 : 0,
  }));

  const filteredLogs = logs.filter((log) =>
    (log.endpoint || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="text-4xl text-center mb-2">📊 Log Dashboard</h1>

      {/* 🔥 ALERTAS VISUALES PRO */}
      <div className="space-y-2 mb-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="bg-red-600 text-white p-3 rounded shadow animate-pulse"
          >
            {a.message}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mb-6">
        🟢 LIVE · {lastUpdate?.toLocaleTimeString()}
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow p-4 text-center">
          <p>Total</p>
          <p className="text-xl">{summary.total}</p>
        </div>

        <div className="bg-white shadow p-4 text-center">
          <p>Errores</p>
          <p className="text-xl text-red-500">{summary.errors}</p>
        </div>

        <div className="bg-white shadow p-4 text-center">
          <p>Correctos</p>
          <p className="text-xl text-green-600">{summary.success}</p>
        </div>

        <div className="bg-white shadow p-4 text-center">
          <p>% Error</p>
          <p className="text-xl text-orange-500">
            {((summary.errors / summary.total) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-4 gap-6 mb-6">

        <div className="col-span-3 bg-white shadow p-4">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="success" stroke="#16a34a" />
              <Line dataKey="error" stroke="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow p-4 flex justify-center items-center">
          <PieChart width={200} height={200}>
            <Pie data={pieData} dataKey="value" innerRadius={60}>
              <Cell fill="#16a34a" />
              <Cell fill="#dc2626" />
            </Pie>
          </PieChart>
        </div>
      </div>

      {/* FILTRO */}
      <div className="mb-4">
        <input
          className="border p-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <table className="w-full bg-white shadow">
        <tbody>
          {filteredLogs.map((log, i) => (
            <tr key={i}>
              <td>{log.endpoint}</td>
              <td>{log.status_code}</td>
              <td>{log.method}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;