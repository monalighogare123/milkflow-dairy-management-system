
import { useEffect, useState } from "react";
import api from "../api";

function DashboardStats({ refreshKey = 0 }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/reports/dashboard");

        if (isMounted) {
          setDashboard(response.data);
        }
      } catch (err) {
        console.error("Dashboard API error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  if (loading && !dashboard) {
    return <p>Loading dashboard statistics...</p>;
  }

  if (error && !dashboard) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <button
          type="button"
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Farmers",
      value: dashboard?.total_farmers ?? 0,
      icon: "bi-people",
    },
    {
      title: "Total Milk Collected",
      value: `${Number(
        dashboard?.total_milk_collected ?? 0
      ).toFixed(2)} kg`,
      icon: "bi-droplet-half",
    },
    {
      title: "Today's Milk",
      value: `${Number(
        dashboard?.today_milk_collected ?? 0
      ).toFixed(2)} kg`,
      icon: "bi-calendar-check",
    },
    {
      title: "Total Collections",
      value: dashboard?.total_collections ?? 0,
      icon: "bi-clipboard-data",
    },
    {
      title: "Recorded Payments",
      value: dashboard?.total_payments ?? 0,
      icon: "bi-wallet2",
    },
    {
      title: "Total Payment Value",
      value: `₹${Number(
        dashboard?.total_payment_amount ?? 0
      ).toFixed(2)}`,
      icon: "bi-currency-rupee",
    },
  ];

  return (
    <>
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3">
        {stats.map((stat) => (
          <div
            className="col-12 col-sm-6 col-lg-4"
            key={stat.title}
          >
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="text-muted mb-0">
                    {stat.title}
                  </h6>

                  <i
                    className={`bi ${stat.icon} fs-4 text-success`}
                    aria-hidden="true"
                  ></i>
                </div>

                <h3 className="fw-bold mb-0">
                  {stat.value}
                </h3>

                {loading && (
                  <small className="text-muted">
                    Updating...
                  </small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default DashboardStats;
