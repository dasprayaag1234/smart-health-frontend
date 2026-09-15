import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [riskData, setRiskData] = useState([]);
  const [redistribution, setRedistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [riskRes, redisRes, statsRes] = await Promise.all([
  axios.get(`${API_BASE}/risk/ranked?limit=20`),
  axios.get(`${API_BASE}/redistribution/recommendations?limit=20`),
  axios.get(`${API_BASE}/stats/summary`),
]);
setRiskData(riskRes.data);
setRedistribution(redisRes.data);
setStats(statsRes.data);
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

      {stats && (
  <div className="stats-grid">
    <div className="stat-card">
      <div className="stat-value">{stats.total_facilities.toLocaleString()}</div>
      <div className="stat-label">Facilities Monitored</div>
    </div>
    <div className="stat-card">
      <div className="stat-value">{stats.total_states}</div>
      <div className="stat-label">States Covered</div>
    </div>
    <div className="stat-card">
      <div className="stat-value">{stats.total_districts}</div>
      <div className="stat-label">Districts</div>
    </div>
    <div className="stat-card stat-critical">
      <div className="stat-value">{stats.facilities_with_critical_stock.toLocaleString()}</div>
      <div className="stat-label">Facilities with Critical Stock</div>
    </div>
    <div className="stat-card stat-critical">
      <div className="stat-value">{stats.critical_stock_records.toLocaleString()}</div>
      <div className="stat-label">Critical Stock Alerts</div>
    </div>
  </div>
)}

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
    <>
      <tr
        key={i}
        className={`risk-${row.stock_status.toLowerCase()} clickable-row`}
        onClick={() => setExpandedRow(expandedRow === i ? null : i)}
      >
        <td>{row.facility_name}</td>
        <td>{row.district}, {row.state}</td>
        <td>{row.medicine_name}</td>
        <td>{row.current_quantity} / {row.reorder_threshold}</td>
        <td><span className={`badge badge-${row.stock_status.toLowerCase()}`}>{row.stock_status}</span></td>
        <td>{row.risk_score}</td>
      </tr>
      {expandedRow === i && (
        <tr className="explanation-row">
          <td colSpan={6}>{row.risk_explanation}</td>
        </tr>
      )}
    </>
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
