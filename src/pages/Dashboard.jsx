import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const response = await API.get("/risks");
      setRisks(response.data.risks || []);
    } catch (error) {
      console.error("FETCH RISKS ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load risks"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteRisk = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this risk?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      await API.delete(`/risks/${id}`);

      setRisks((currentRisks) =>
        currentRisks.filter((risk) => risk.id !== id)
      );
    } catch (error) {
      console.error("DELETE RISK ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Failed to delete risk"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const total = risks.length;

  const critical = risks.filter(
    (risk) => risk.severity === "Critical"
  ).length;

  const high = risks.filter(
    (risk) => risk.severity === "High"
  ).length;

  const medium = risks.filter(
    (risk) => risk.severity === "Medium"
  ).length;

  const low = risks.filter(
    (risk) => risk.severity === "Low"
  ).length;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const goToAddRisk = () => {
    window.location.href = "/add-risk";
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>RiskRadar</h1>
          <p>Enterprise Risk Management Platform</p>
        </div>

        <div className="user-section">
          <div className="user-info">
            <strong>{user?.name || "User"}</strong>
            <small>{user?.role || "Employee"}</small>
          </div>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">

        {/* Welcome */}
        <div className="welcome">
          <div>
            <h2>Risk Overview</h2>
            <p>
              Monitor, assess and manage organizational risks.
            </p>
          </div>

          
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="stats-grid">

          <div className="stat-card total-card">
            
            <div>
              <h3>Total Risks</h3>
              <strong>{total}</strong>
            </div>
          </div>

          <div className="stat-card critical-card">
            <div className="stat-icon">🔴</div>
            <div>
              <h3>Critical</h3>
              <strong>{critical}</strong>
            </div>
          </div>

          <div className="stat-card high-card">
            <div className="stat-icon">🟠</div>
            <div>
              <h3>High</h3>
              <strong>{high}</strong>
            </div>
          </div>

          <div className="stat-card medium-card">
            <div className="stat-icon">🟡</div>
            <div>
              <h3>Medium</h3>
              <strong>{medium}</strong>
            </div>
          </div>

          <div className="stat-card low-card">
            <div className="stat-icon">🟢</div>
            <div>
              <h3>Low</h3>
              <strong>{low}</strong>
            </div>
          </div>

        </div>

        {/* Risk Table */}
        <section className="risk-section">

          <div className="section-header">
            <div>
              <h2>Risk Register</h2>
              <p>Recently identified organizational risks</p>
            </div>

            <button onClick={goToAddRisk}>
              + Add Risk
            </button>
          </div>

          {risks.length === 0 ? (

            <div className="empty-state">
              <div className="empty-icon">🛡️</div>

              <h3>No risks found</h3>

              <p>
                Start by adding your first organizational risk.
              </p>

              <button
                className="add-risk-button empty-add-button"
                onClick={goToAddRisk}
              >
                + Create Your First Risk
              </button>
            </div>

          ) : (

            <div className="risk-table">

              <div className="table-header">
                <span>Risk</span>
                <span>Category</span>
                <span>Score</span>
                <span>Severity</span>
                <span>Action</span>
              </div>

              {risks.map((risk) => (

                <div
                  className="table-row"
                  key={risk.id}
                >

                  <span className="risk-name">
                    <strong>{risk.title}</strong>

                    <small>
                      {risk.description}
                    </small>
                  </span>

                  <span className="category-badge">
                    {risk.category}
                  </span>

                  <span className="risk-score">
                    {risk.riskScore}
                  </span>

                  <span>
                    <b
                      className={`severity ${risk.severity.toLowerCase()}`}
                    >
                      {risk.severity}
                    </b>
                  </span>

                  <span>
                    <button
                      className="delete-button"
                      onClick={() => deleteRisk(risk.id)}
                      disabled={deletingId === risk.id}
                    >
                      {deletingId === risk.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>
    </div>
  );
}

export default Dashboard;