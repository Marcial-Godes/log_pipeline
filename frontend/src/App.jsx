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
const WS_URL = "wss://log-pipeline.onrender.com/ws";

function App() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  // 🔥 FALLBACK FETCH (por si WS falla)
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/logs/stats/summary`);
      const data = await res.json();
      setSummary(data);
      setLastUpdate(new Date());
    } catch (e) {
      console.error("Fallback fetch error");
    }
  };

  useEffect(() => {
    let ws;

    const connectWS = () => {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("WS conectado");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.summary) setSummary(data.summary);
        if (data.logs) setLogs(data.logs);

        setLastUpdate(new Date());

        // 🔥 ALERTAS EN TIEMPO REAL
        const errorRate =
          (data.summary.errors / data.summary.total) * 100;

        let alert = null;

        if (errorRate > 50) {
          alert = {
            id: Date.now(),
            type: "critical",
            message: `CRITICAL ${errorRate.toFixed(1)}%`,
            time: new Date(),
          };
        } else if (errorRate > 25) {
          alert = {
            id: Date.now(),
            type: "warning",
            message: `WARNING ${errorRate.toFixed(1)}%`,
            time: new Date(),
          };
        }

        if (alert) {
          setAlerts((prev) => [alert, ...prev].slice(0, 5));
        }
      };

      ws.onerror = () => {
        console.log("WS error → fallback HTTP");
        fetchData();
      };

      ws.onclose = () => {
        console.log("WS reconectando...");
        setTimeout(connectWS, 3000);
      };
    };

    connectWS();

    return () => ws && ws.close();
  }, []);

  const pieData = summary
    ? [
        { name: "Correctos", value: summary.success },
        { name: "Errores", value: summary.errors },
      ]
    : [];

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
      <h1 className="text-4xl text-center mb-2">📊 Log Dashboard</h1>

      {/* LIVE */}
      <div className="text-center text-sm text-green-600 mb-4">
        ● LIVE · {lastUpdate?.toLocaleTimeString() || "--:--"}
      </div>

      {/* ALERTAS */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-2 rounded text-sm ${
                a.type === "critical"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* SUMMARY */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 shadow rounded text-center">
            <p>Total</p>
            <p className="font-bold">{summary.total}</p>
          </div>
          <div className="bg-white p-4 shadow rounded text-center">
            <p>Errores</p>
            <p className="text-red-500 font-bold">
              {summary.errors}
            </p>
          </div>
          <div className="bg-white p-4 shadow rounded text-center">
            <p>Correctos</p>
            <p className="text-green-600 font-bold">
              {summary.success}
            </p>
          </div>
          <div className="bg-white p-4 shadow rounded text-center">
            <p>% Error</p>
            <p className="text-orange-500 font-bold">
              {(
                (summary.errors / summary.total) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      )}

      {/* DONUT */}
      <div className="bg-white shadow rounded p-4 flex justify-center mb-6">
        <div className="relative">
          <PieChart width={220} height={220}>
            <Pie
              data={pieData}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
            />
          </PieChart>

          {summary && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span>{summary.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Buscar..."
          className="border p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setMethodFilter("");
          }}
          className="bg-black text-white px-3"
        >
          Reset
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white shadow p-4 rounded">
        <table className="w-full text-sm">
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
    </div>
  );
}

export default App;