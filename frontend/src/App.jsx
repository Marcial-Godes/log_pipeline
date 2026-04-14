import { useEffect, useState } from "react";

const API_URL = "https://log-pipeline.onrender.com";

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [s, l, t] = await Promise.all([
        fetch(`${API_URL}/logs/stats/summary`).then((r) => r.json()),
        fetch(`${API_URL}/logs/recent`).then((r) => r.json()),
        fetch(`${API_URL}/logs/stats/top-endpoints`).then((r) => r.json()),
      ]);

      setSummary(s);
      setLogs(l);
      setTopEndpoints(t);
      setLoading(false);
    } catch (err) {
      console.error("Retrying...", err);

      // 🔁 retry después de 3s
      setTimeout(fetchData, 3000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-semibold text-center mb-6">
        📊 Log Dashboard
      </h1>

      {loading && (
        <p className="text-center text-gray-500">Cargando datos...</p>
      )}

      {summary && (
        <div className="flex justify-center gap-4 mb-6">
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
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
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
                  <td>{log.status_code}</td>
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