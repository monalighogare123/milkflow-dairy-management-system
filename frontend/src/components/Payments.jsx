import { useEffect, useMemo, useState } from "react";
import api from "../api";

function Payments() {
  const [collections, setCollections] = useState([]);
  const [payments, setPayments] = useState([]);
  const [collectionId, setCollectionId] = useState("");
  const [ratePerKg, setRatePerKg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load milk collections and saved payments from the backend.
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [collectionsResponse, paymentsResponse] =
        await Promise.all([
          api.get("/collections/"),
          api.get("/payments/"),
        ]);

      setCollections(collectionsResponse.data);
      setPayments(paymentsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load collections and payments. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Get collection IDs that already have a payment.
  const paidCollectionIds = useMemo(
    () => new Set(payments.map((payment) => Number(payment.collection_id))),
    [payments]
  );

  // Only collections that have not already been paid are selectable.
  const unpaidCollections = collections.filter(
    (collection) => !paidCollectionIds.has(Number(collection.id))
  );

  const selectedCollection = collections.find(
    (collection) => Number(collection.id) === Number(collectionId)
  );

  const weight = Number(selectedCollection?.weight || 0);
  const rate = Number(ratePerKg || 0);
  const calculatedAmount =
    collectionId && ratePerKg !== "" && rate > 0
      ? weight * rate
      : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!collectionId) {
      setError("Please select a milk collection.");
      return;
    }

    if (ratePerKg === "" || !Number.isFinite(rate) || rate <= 0) {
      setError("Please enter a valid rate greater than zero.");
      return;
    }

    if (paidCollectionIds.has(Number(collectionId))) {
      setError("This collection already has a payment.");
      return;
    }

    setSaving(true);

    try {
      await api.post("/payments/", {
        collection_id: Number(collectionId),
        rate_per_kg: rate,
      });

      setSuccess("Payment created successfully.");
      setCollectionId("");
      setRatePerKg("");

      // Refresh data so the new payment appears in the table.
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Payment could not be created. Please check the selected collection."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString();
  };

  const formatMoney = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return "—";

    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const getAmount = (payment) =>
    payment.amount ??
    payment.total_amount ??
    payment.payment_amount ??
    payment.total ??
    null;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Payment Management</h2>
          <p className="text-secondary mb-0">
            Calculate and manage payments for milk collections.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadData}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-cash-coin me-2"></i>
                Create Payment
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="collectionId" className="form-label">
                    Select unpaid milk collection
                  </label>

                  <select
                    id="collectionId"
                    className="form-select"
                    value={collectionId}
                    onChange={(event) => setCollectionId(event.target.value)}
                    disabled={loading || saving}
                    required
                  >
                    <option value="">Choose a collection</option>

                    {unpaidCollections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        Collection #{collection.id} — Farmer #
                        {collection.farmer_id} — {collection.weight} kg
                      </option>
                    ))}
                  </select>

                  {!loading && unpaidCollections.length === 0 && (
                    <small className="text-secondary">
                      No unpaid collections are currently available.
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="milkWeight" className="form-label">
                    Milk weight (kg)
                  </label>

                  <input
                    id="milkWeight"
                    type="text"
                    className="form-control"
                    value={selectedCollection?.weight ?? ""}
                    readOnly
                    placeholder="Select a collection first"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="ratePerKg" className="form-label">
                    Rate per kg (₹)
                  </label>

                  <input
                    id="ratePerKg"
                    type="number"
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    value={ratePerKg}
                    onChange={(event) => setRatePerKg(event.target.value)}
                    placeholder="Enter rate, e.g. 40"
                    disabled={saving}
                    required
                  />
                </div>

                <div className="rounded-3 bg-light p-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      Estimated payment
                    </span>

                    <h4 className="fw-bold mb-0 text-success">
                      {formatMoney(calculatedAmount)}
                    </h4>
                  </div>

                  <small className="text-secondary">
                    Weight × rate per kg. The backend calculates the saved
                    payment.
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={
                    loading ||
                    saving ||
                    !collectionId ||
                    ratePerKg === "" ||
                    rate <= 0
                  }
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      ></span>
                      Saving payment...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Create Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0">Payment History</h5>

                <span className="badge text-bg-primary">
                  {payments.length} records
                </span>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-secondary mt-2 mb-0">
                    Loading payment records...
                  </p>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center text-secondary py-5">
                  <i className="bi bi-receipt display-5"></i>
                  <p className="mt-3 mb-0">No payments have been recorded yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Payment ID</th>
                        <th>Collection ID</th>
                        <th>Rate/kg</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>#{payment.id}</td>
                          <td>#{payment.collection_id}</td>
                          <td>
                            {payment.rate_per_kg == null
                              ? "—"
                              : formatMoney(payment.rate_per_kg)}
                          </td>
                          <td className="fw-semibold text-success">
                            {formatMoney(getAmount(payment))}
                          </td>
                          <td>
                            {formatDate(
                              payment.created_at ?? payment.payment_date
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;