import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddRisk() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Operational",
    probability: 1,
    impact: 1,
    owner: "",
    mitigation: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await API.post("/risks", {
        ...form,
        probability: Number(form.probability),
        impact: Number(form.impact)
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("ADD RISK ERROR:", error);

      setError(
        error.response?.data?.message ||
        "Failed to create risk"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <h1>RiskRadar</h1>
          <p>Add a new organizational risk</p>
        </div>

        <div className="user-section">
          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-content">

        <div className="risk-form-container">

          <div className="form-header">
            <h2>Create New Risk</h2>
            <p>
              Record and assess a new organizational risk.
            </p>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="risk-form">

            <div className="form-group">
              <label>Risk Title</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Data Security Breach"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                placeholder="Describe the risk..."
                value={form.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Operational</option>
                <option>Financial</option>
                <option>Cybersecurity</option>
                <option>Compliance</option>
                <option>Strategic</option>
                <option>Reputational</option>
                <option>Technology</option>
              </select>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Probability (1–5)</label>

                <select
                  name="probability"
                  value={form.probability}
                  onChange={handleChange}
                >
                  <option value="1">1 - Very Low</option>
                  <option value="2">2 - Low</option>
                  <option value="3">3 - Medium</option>
                  <option value="4">4 - High</option>
                  <option value="5">5 - Very High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Impact (1–5)</label>

                <select
                  name="impact"
                  value={form.impact}
                  onChange={handleChange}
                >
                  <option value="1">1 - Very Low</option>
                  <option value="2">2 - Low</option>
                  <option value="3">3 - Medium</option>
                  <option value="4">4 - High</option>
                  <option value="5">5 - Very High</option>
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Risk Owner</label>

              <input
                type="text"
                name="owner"
                placeholder="e.g. IT Security Team"
                value={form.owner}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mitigation Strategy</label>

              <textarea
                name="mitigation"
                placeholder="How will this risk be reduced or controlled?"
                value={form.mitigation}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Risk"}
              </button>

            </div>

          </form>

        </div>

      </main>
    </div>
  );
}

export default AddRisk;