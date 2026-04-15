import { useEffect, useState } from "react";

const API_URL = "https://log-pipeline.onrender.com";

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      const [summaryRes, logsRes, topRes] = await Promise.all([
        fetch(`${API_URL}/logs/stats/summary`),
        fetch(`${API_URL}/logs/recent`),
        fetch(`${API_URL}/logs/stats/top-endpoints`)
      ]);

      const summaryData = await summaryRes.json();
      const logsData = await logsRes.json();
      const topData = await topRes.json();

      setSummary(summaryData);
      setLogs(logsData);
      setTopEndpoints(topData);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("❌ Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000); // 🔥 cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-semibold text-center mb-2">
        📊 Log Dashboard
      </h1>

      <p className="text-center text-sm text-gray-500 mb-6">
        🟢 LIVE · última actualización: {lastUpdate}
      </p>

      {/* ===== SUMMARY ===== */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card title="Total" value={summary.total} />
          <Card title="Errores" value={summary.errors} color="text-red-500" />
          <Card title="Correctos" value={summary.success} color="text-green-600" />
        </div>
      )}

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
                <th>Tiempo</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
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
                  <td className="text-xs text-gray-500">
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

/* ===== COMPONENTE CARD ===== */
function Card({ title, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default App;
