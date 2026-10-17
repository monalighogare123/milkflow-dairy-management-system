
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import api from "../api";

function AnalyticsCharts({ refreshKey = 0 }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real chart data from FastAPI.
  // This runs on first render and whenever refreshKey changes.
  useEffect(() => {
    let isMounted = true;

    const fetchChartData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/reports/chart-data");

        if (isMounted) {
          setChartData(response.data);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);

        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              "Unable to load chart data. Please check your login and backend."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChartData();

    // Prevent state updates if the component unmounts.
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // Loading state
  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="text-muted mt-3 mb-0">
            Loading milk collection charts...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p className="mb-2">{error}</p>

        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Empty state
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div className="alert alert-info">
        No chart data is available yet.
      </div>
    );
  }

  return (
    <div className="row g-4">
      {/* Bar Chart */}
      <div className="col-12 col-xl-6">
        <div className="card h-100 border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title fw-semibold">
              Milk Collection
            </h5>

            <p className="text-muted">
              Daily milk collection for the last seven days (kg)
            </p>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />

                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toLocaleString("en-IN")} kg`,
                      "Milk",
                    ]}
                  />

                  <Bar
                    dataKey="milk"
                    name="Milk Collected"
                    fill="#198754"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="col-12 col-xl-6">
        <div className="card h-100 border-0 shadow-sm">
          <div className="card-body">
            <h5 className="card-title fw-semibold">
              Collection Trend
            </h5>

            <p className="text-muted">
              Changes in daily milk collection (kg)
            </p>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />

                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toLocaleString("en-IN")} kg`,
                      "Milk",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="milk"
                    name="Milk Collected"
                    stroke="#198754"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsCharts;
