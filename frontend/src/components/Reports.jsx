
import { useEffect, useState } from "react";
import api from "../api";
import AnalyticsCharts from "./AnalyticsCharts";

function Reports() {
  const [activeTab, setActiveTab] = useState("daily");

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [dailyReport, setDailyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [farmerReport, setFarmerReport] = useState([]);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch report data whenever the selected filters change.
  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, reportDate, year, month]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (activeTab === "daily") {
        const response = await api.get("/reports/daily", {
          params: {
            report_date: reportDate,
          },
        });

        setDailyReport(response.data);
      } else if (activeTab === "monthly") {
        const response = await api.get("/reports/monthly", {
          params: {
            year: Number(year),
            month: Number(month),
          },
        });

        setMonthlyReport(response.data);
      } else if (activeTab === "farmer") {
        const response = await api.get("/reports/farmer-wise");

        const data = response.data;
        const rows = Array.isArray(data)
          ? data
          : data?.farmers || data?.data || [];

        setFarmerReport(rows);
      }
    } catch (err) {
      console.error("Error fetching report:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load the report. Please check your login and backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  // Export milk collection data as a CSV file.
  const handleExport = async () => {
    setExporting(true);
    setError("");
    setMessage("");

    try {
      const response = await api.get("/reports/export/collections", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "milk_collections.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      setMessage("CSV report downloaded successfully.");
    } catch (err) {
      console.error("Error exporting report:", err);

      setError(
        "Unable to export the CSV report. Please check your login and backend server."
      );
    } finally {
      setExporting(false);
    }
  };

  // Format numbers for display.
  const formatNumber = (value) => {
    const number = Number(value ?? 0);

    return Number.isFinite(number)
      ? number.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })
      : "0";
  };

  // Reusable report metric card.
  const MetricCard = ({ title, value, unit = "" }) => (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body">
          <p className="text-muted mb-2">{title}</p>

          <h4 className="fw-bold mb-0">
            {formatNumber(value)}
            {unit && (
              <small className="fs-6 text-muted ms-1">{unit}</small>
            )}
          </h4>
        </div>
      </div>
    </div>
  );

  // Render the four report metrics.
  const renderMetrics = (report) => (
    <div className="row g-3 mb-4">
      <MetricCard
        title="Milk Collected"
        value={report?.total_milk_collected}
        unit="kg"
      />

      <MetricCard
        title="Collection Records"
        value={report?.total_collections}
      />

      <MetricCard
        title="Payments Recorded"
        value={report?.total_payments}
      />

      <MetricCard
        title="Total Payment Amount"
        value={report?.total_payment_amount}
        unit="₹"
      />
    </div>
  );

  return (
    <div className="container-fluid py-3">
      {/* Page heading */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Reports & Analytics</h2>
          <p className="text-muted mb-0">
            View milk collection, payment, and farmer reports.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-success"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Exporting...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-spreadsheet me-2" />
              Export Collections CSV
            </>
          )}
        </button>
      </div>

      {/* Error notification */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}

          <button
            type="button"
            className="btn-close float-end"
            aria-label="Close"
            onClick={() => setError("")}
          />
        </div>
      )}

      {/* Success notification */}
      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      {/* Analytics charts */}
      <section className="mb-4">
        <h4 className="fw-semibold mb-3">Visual Analytics</h4>
        <AnalyticsCharts />
      </section>

      {/* Report tabs and content */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          {/* Tab buttons */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              className={`btn ${
                activeTab === "daily"
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={() => setActiveTab("daily")}
            >
              Daily Report
            </button>

            <button
              type="button"
              className={`btn ${
                activeTab === "monthly"
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly Report
            </button>

            <button
              type="button"
              className={`btn ${
                activeTab === "farmer"
                  ? "btn-success"
                  : "btn-outline-success"
              }`}
              onClick={() => setActiveTab("farmer")}
            >
              Farmer-wise Report
            </button>
          </div>

          {/* Daily report filter */}
          {activeTab === "daily" && (
            <div className="row align-items-end g-3 mb-4">
              <div className="col-12 col-md-4">
                <label htmlFor="reportDate" className="form-label">
                  Select Report Date
                </label>

                <input
                  id="reportDate"
                  type="date"
                  className="form-control"
                  value={reportDate}
                  onChange={(event) =>
                    setReportDate(event.target.value)
                  }
                />
              </div>

              <div className="col-12 col-md-auto">
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={fetchReport}
                  disabled={loading}
                >
                  Refresh Report
                </button>
              </div>
            </div>
          )}

          {/* Monthly report filters */}
          {activeTab === "monthly" && (
            <div className="row align-items-end g-3 mb-4">
              <div className="col-12 col-md-3">
                <label htmlFor="reportMonth" className="form-label">
                  Select Month
                </label>

                <select
                  id="reportMonth"
                  className="form-select"
                  value={month}
                  onChange={(event) =>
                    setMonth(Number(event.target.value))
                  }
                >
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((monthName, index) => (
                    <option key={monthName} value={index + 1}>
                      {monthName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="reportYear" className="form-label">
                  Select Year
                </label>

                <input
                  id="reportYear"
                  type="number"
                  className="form-control"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(event) => {
                    const value = event.target.value;
                    setYear(value === "" ? "" : Number(value));
                  }}
                />
              </div>

              <div className="col-12 col-md-auto">
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={fetchReport}
                  disabled={
                    loading ||
                    year === "" ||
                    Number(year) < 2000 ||
                    Number(year) > 2100
                  }
                >
                  Refresh Report
                </button>
              </div>
            </div>
          )}

          {/* Loading indicator and report content */}
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-success"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>

              <p className="text-muted mt-2 mb-0">
                Loading report...
              </p>
            </div>
          ) : (
            <>
              {/* Daily report */}
              {activeTab === "daily" && dailyReport && (
                <>
                  <h5 className="fw-semibold mb-3">
                    Daily Summary — {reportDate}
                  </h5>

                  {renderMetrics(dailyReport)}
                </>
              )}

              {/* Monthly report */}
              {activeTab === "monthly" && monthlyReport && (
                <>
                  <h5 className="fw-semibold mb-3">
                    Monthly Summary —{" "}
                    {new Date(
                      Number(year),
                      Number(month) - 1,
                      1
                    ).toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h5>

                  {renderMetrics(monthlyReport)}
                </>
              )}

              {/* Farmer-wise report */}
              {activeTab === "farmer" && (
                <div>
                  <h5 className="fw-semibold mb-3">
                    Farmer-wise Collection Summary
                  </h5>

                  <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle">
                      <thead className="table-success">
                        <tr>
                          <th>Farmer ID</th>
                          <th>Farmer Name</th>
                          <th>Farmer Code</th>
                          <th>Total Milk (kg)</th>
                          <th>Collections</th>
                          <th>Total Payments (₹)</th>
                        </tr>
                      </thead>

                      <tbody>
                        {farmerReport.length > 0 ? (
                          farmerReport.map((farmer, index) => (
                            <tr
                              key={
                                farmer.farmer_id ??
                                farmer.id ??
                                index
                              }
                            >
                              <td>
                                {farmer.farmer_id ??
                                  farmer.id ??
                                  "-"}
                              </td>

                              <td>
                                {farmer.farmer_name ??
                                  farmer.name ??
                                  "-"}
                              </td>

                              <td>{farmer.farmer_code ?? "-"}</td>

                              <td>
                                {formatNumber(
                                  farmer.total_milk_collected
                                )}
                              </td>

                              <td>
                                {formatNumber(
                                  farmer.total_collections
                                )}
                              </td>

                              <td>
                                ₹
                                {formatNumber(
                                  farmer.total_payment_amount
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center py-4"
                            >
                              No farmer report data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty states */}
              {activeTab === "daily" &&
                !dailyReport &&
                !error && (
                  <p className="text-muted">
                    No daily report data available.
                  </p>
                )}

              {activeTab === "monthly" &&
                !monthlyReport &&
                !error && (
                  <p className="text-muted">
                    No monthly report data available.
                  </p>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
