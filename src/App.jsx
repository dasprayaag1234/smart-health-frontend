import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [riskData, setRiskData] = useState([]);
  const [redistribution, setRedistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [riskRes, redisRes] = await Promise.all([
          axios.get(`${API_BASE}/risk/ranked?limit=20`),
          axios.get(`${API_BASE}/redistribution/recommendations?limit=20`),
        ]);
        setRiskData(riskRes.data);
        setRedistribution(redisRes.data);
      } catch (err) {
        setError("Could not load data. Backend may be waking up (free tier) — try refreshing in 30s.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="status-message">Loading dashboard data...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="dashboard">
      <header>
        <h1>Smart Health & Supply Chain Dashboard</h1>
        <p>Real-time risk scoring and redistribution recommendations across PHC/CHC/District Hospital networks</p>
      </header>

      <section>
        <h2>Top Risk-Ranked Stock Issues</h2>
        <table>
          <thead>
            <tr>
              <th>Facility</th>
              <th>District, State</th>
              <th>Medicine</th>
              <th>Current / Threshold</th>
              <th>Status</th>
              <th>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {riskData.map((row, i) => (
              <tr key={i} className={`risk-${row.stock_status.toLowerCase()}`}>
                <td>{row.facility_name}</td>
                <td>{row.district}, {row.state}</td>
                <td>{row.medicine_name}</td>
                <td>{row.current_quantity} / {row.reorder_threshold}</td>
                <td><span className={`badge badge-${row.stock_status.toLowerCase()}`}>{row.stock_status}</span></td>
                <td>{row.risk_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Redistribution Recommendations</h2>
        <table>
          <thead>
            <tr>
              <th>Medicine</th>
              <th>From</th>
              <th>To</th>
              <th>State</th>
              <th>Recommended Transfer</th>
            </tr>
          </thead>
          <tbody>
            {redistribution.map((row, i) => (
              <tr key={i}>
                <td>{row.medicine_name}</td>
                <td>{row.from_facility_name} ({row.from_district})</td>
                <td>{row.to_facility_name} ({row.to_district})</td>
                <td>{row.state}</td>
                <td>{row.recommended_transfer_quantity} units</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;