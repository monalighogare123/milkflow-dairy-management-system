import { useEffect, useMemo, useState } from "react";
import api from "./api";

import AddFarmer from "./components/AddFarmer";
import MilkCollection from "./components/MilkCollection";
import MilkQuality from "./components/MilkQuality";
import Payments from "./components/Payments";
import DashboardStats from "./components/DashboardStats";
import Reports from "./components/Reports";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [farmers, setFarmers] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token")),
  );

  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddFarmer, setShowAddFarmer] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [farmerResponse, userResponse] = await Promise.all([
        api.get("/farmers/"),
        api.get("/auth/me"),
      ]);

      setFarmers(farmerResponse.data);
      setUser(userResponse.data);
      setLoggedIn(true);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        setLoggedIn(false);
        setUser(null);
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      loadDashboard();
    }
  }, []);

  async function handleLogin(event) {
    event.preventDefault();

    setLoginLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("access_token", response.data.access_token);

      setLoggedIn(true);

      await loadDashboard();

      setPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");

    setLoggedIn(false);
    setUser(null);
    setFarmers([]);
    setPassword("");
    setEmail("");
    setSearch("");
    setMessage("You have been logged out.");
    setError("");
  }

  const filteredFarmers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return farmers;
    }

    return farmers.filter((farmer) =>
      [
        farmer.farmer_code,
        farmer.name,
        farmer.mobile,
        farmer.milk_type,
        String(farmer.id),
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [farmers, search]);

  // Login page
  if (!loggedIn) {
    return (
      <main className="login-page">
        <section className="login-visual">
          <div className="login-brand">
            <span className="brand-icon">
              <i className="bi bi-droplet-fill"></i>
            </span>

            <span>
              Milk<span className="brand-light">Flow</span>
            </span>
          </div>

          <div className="login-hero-content">
            <span className="eyebrow">
              <i className="bi bi-stars me-2"></i>
              SMART DAIRY MANAGEMENT
            </span>

            <h1>Better dairy operations start here.</h1>

            <p>
              Manage farmers, monitor milk collection, and organize your dairy
              operations from one simple workspace.
            </p>

            <div className="login-feature">
              <i className="bi bi-check-circle-fill"></i>
              <span>Centralized farmer records</span>
            </div>

            <div className="login-feature">
              <i className="bi bi-check-circle-fill"></i>
              <span>Secure account access</span>
            </div>

            <div className="login-feature">
              <i className="bi bi-check-circle-fill"></i>
              <span>Milk collection management</span>
            </div>
          </div>

          <p className="login-footer">
            A smarter way to manage dairy operations.
          </p>
        </section>

        <section className="login-form-area">
          <div className="login-card">
            <div className="mobile-brand">
              <span className="brand-icon">
                <i className="bi bi-droplet-fill"></i>
              </span>
              <span>MilkFlow</span>
            </div>

            <div className="login-heading-icon">
              <i className="bi bi-person-lock"></i>
            </div>

            <p className="section-kicker">WELCOME BACK</p>
            <h2>Sign in to your account</h2>

            <p className="muted-text">
              Enter your account details to access your dashboard.
            </p>

            {message && <div className="alert alert-success">{message}</div>}

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleLogin}>
              <label className="form-label">Email address</label>

              <div className="input-group custom-input mb-4">
                <span className="input-group-text">
                  <i className="bi bi-envelope"></i>
                </span>

                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <label className="form-label">Password</label>

              <div className="input-group custom-input mb-4">
                <span className="input-group-text">
                  <i className="bi bi-lock"></i>
                </span>

                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-green w-100 py-3"
                disabled={loginLoading}
              >
                {loginLoading ? "Signing in..." : "Sign in to dashboard"}

                {!loginLoading && <i className="bi bi-arrow-right ms-2"></i>}
              </button>
            </form>

            <p className="login-security">
              <i className="bi bi-shield-lock me-2"></i>
              Secure access to your dairy workspace
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Main application after login
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <a
          href="#dashboard"
          className="sidebar-brand"
          onClick={() => setActivePage("Dashboard")}
        >
          <span className="brand-icon">
            <i className="bi bi-droplet-fill"></i>
          </span>

          <span>
            Milk<span className="brand-light">Flow</span>
          </span>
        </a>

        <p className="nav-label">WORKSPACE</p>

        {/* Dashboard navigation */}
        <button
          className={`side-link ${activePage === "Dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("Dashboard")}
        >
          <i className="bi bi-grid-1x2"></i>
          <span>Dashboard</span>
        </button>

        {/* Farmers navigation */}
        <button
          className={`side-link ${activePage === "Farmers" ? "active" : ""}`}
          onClick={() => setActivePage("Farmers")}
        >
          <i className="bi bi-people"></i>
          <span>Farmers</span>
          <span className="nav-count">{farmers.length}</span>
        </button>

        {/* Milk collections navigation */}
        <button
          className={`side-link ${
            activePage === "Milk collections" ? "active" : ""
          }`}
          onClick={() => {
            setActivePage("Milk collections");
            setMessage("");
          }}
        >
          <i className="bi bi-droplet-half"></i>
          <span>Milk collections</span>
        </button>

        {/* Milk quality navigation */}
        <button
          className={`side-link ${activePage === "Quality" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Quality");
            setMessage("");
          }}
        >
          <i className="bi bi-clipboard2-pulse"></i>
          <span>Milk quality</span>
        </button>

        {/* Payments navigation */}
        <button
          className={`side-link ${activePage === "Payments" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Payments");
            setMessage("");
          }}
        >
          <i className="bi bi-wallet2"></i>
          <span>Payments</span>
        </button>

        {/* Reports navigation */}
        <button
          className={`side-link ${activePage === "Reports" ? "active" : ""}`}
          onClick={() => {
            setActivePage("Reports");
            setMessage("");
          }}
        >
          <i className="bi bi-bar-chart-line"></i>
          <span>Reports</span>
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <i className="bi bi-headset"></i>
            </div>

            <strong>Your dairy, organized.</strong>
            <p>One workspace for everyday operations.</p>
          </div>

          <div className="sidebar-version">MILKFLOW · MANAGEMENT</div>
        </div>
      </aside>

      <main className="dashboard-main">
        {/* Top navigation bar */}
        <header className="topbar">
          <div>
            <p className="breadcrumb-text">Workspace / Overview</p>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-actions">
            <div className="system-status">
              <span className="status-dot"></span>
              API workspace
            </div>

            <div className="user-summary">
              <div className="avatar">
                {(user?.email || "U").charAt(0).toUpperCase()}
              </div>

              <div className="user-info">
                <strong>{user?.email || "Dairy User"}</strong>
                <span>{user?.role || "User"}</span>
              </div>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Global error message */}
          {error && (
            <div className="alert alert-danger">
              {error}

              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={loadDashboard}
              >
                Retry
              </button>
            </div>
          )}

          {/* Global information message */}
          {message && (
            <div className="alert alert-info alert-dismissible">
              {message}

              <button
                className="btn-close"
                onClick={() => setMessage("")}
                aria-label="Close"
              ></button>
            </div>
          )}

          {/* Milk collections page */}
          {activePage === "Milk collections" ? (
            <MilkCollection
              onCollectionSaved={() => {
                setChartRefreshKey((previousKey) => previousKey + 1);
              }}
            />
          ) : /* Milk quality page */
          activePage === "Quality" ? (
            <MilkQuality />
          ) : /* Payments page */
          activePage === "Payments" ? (
            <Payments />
          ) : /* Reports page */
          activePage === "Reports" ? (
            <Reports refreshKey={chartRefreshKey} />
          ) : /* Farmers page */
          activePage === "Farmers" ? (
            <section className="farmer-panel">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">FARMER DIRECTORY</p>
                  <h2>All farmers</h2>

                  <p className="panel-description">
                    Search and review registered farmer information.
                  </p>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="record-badge">{farmers.length} records</span>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => setShowAddFarmer((previous) => !previous)}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    {showAddFarmer ? "Hide Form" : "Add Farmer"}
                  </button>
                </div>
              </div>

              {/* Add farmer form */}
              {showAddFarmer && (
                <AddFarmer
                  onFarmerAdded={loadDashboard}
                  onClose={() => setShowAddFarmer(false)}
                />
              )}

              {/* Farmer search and refresh */}
              <div className="table-toolbar">
                <div className="search-box">
                  <i className="bi bi-search"></i>

                  <input
                    type="search"
                    placeholder="Search name, code or mobile..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search farmers"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-outline-green"
                  onClick={loadDashboard}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>

              {/* Farmer records table */}
              <div className="table-responsive">
                <table className="table farmer-table align-middle">
                  <thead>
                    <tr>
                      <th>FARMER</th>
                      <th>FARMER CODE</th>
                      <th>MOBILE NUMBER</th>
                      <th>MILK TYPE</th>
                      <th>CENTER ID</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Loading farmer records...
                        </td>
                      </tr>
                    ) : filteredFarmers.length > 0 ? (
                      filteredFarmers.map((farmer) => (
                        <tr key={farmer.id}>
                          <td>
                            <div className="farmer-identity">
                              <div className="farmer-avatar">
                                {(farmer.name || "F").charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <strong>{farmer.name}</strong>
                                <span>Farmer ID #{farmer.id}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="code-badge">
                              {farmer.farmer_code}
                            </span>
                          </td>

                          <td>{farmer.mobile}</td>

                          <td>
                            <span className="milk-type-badge">
                              <i className="bi bi-droplet me-1"></i>
                              {farmer.milk_type}
                            </span>
                          </td>

                          <td>Center #{farmer.center_id}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          <i className="bi bi-search fs-3 d-block mb-2"></i>

                          {search
                            ? "No farmers match your search."
                            : "No farmer records found yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  Showing {filteredFarmers.length} of {farmers.length} farmers
                </span>

                <span>
                  <i className="bi bi-shield-check me-1"></i>
                  Protected workspace
                </span>
              </div>
            </section>
          ) : (
            /* Dashboard page */
            <>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <span className="eyebrow">DAIRY OPERATIONS CENTER</span>

                  <h2>
                    Good to see you
                    <span className="welcome-period">.</span>
                  </h2>

                  <p>
                    Here is your workspace. Keep track of your farmer records
                    and daily dairy operations.
                  </p>
                </div>

                <div className="welcome-art" aria-hidden="true">
                  <div className="art-circle art-circle-one"></div>
                  <div className="art-circle art-circle-two"></div>

                  <i className="bi bi-droplet-half"></i>

                  <span className="art-leaf">
                    <i className="bi bi-leaf-fill"></i>
                  </span>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <p className="section-kicker">AT A GLANCE</p>
                  <h2>Workspace overview</h2>
                </div>

                <button
                  className="btn btn-light-green"
                  onClick={loadDashboard}
                  disabled={loading}
                >
                  <i
                    className={`bi ${
                      loading ? "bi-arrow-repeat" : "bi-arrow-clockwise"
                    } me-2`}
                  ></i>

                  {loading ? "Refreshing..." : "Refresh data"}
                </button>
              </div>

             <DashboardStats refreshKey={chartRefreshKey} />
            </>
          )}

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} MilkFlow Dairy Management</span>

            <span>Built for better dairy operations</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
