
import { useEffect, useState } from 'react'
import api from '../api'

function MilkCollection({ onCollectionSaved }) {
  // Store farmers, collections and form values.
  const [farmers, setFarmers] = useState([])
  const [collections, setCollections] = useState([])
  const [farmerId, setFarmerId] = useState('')
  const [weight, setWeight] = useState('')

  // Store loading and message states.
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch farmers and collection history from FastAPI.
  async function loadData() {
    setError('')
    setLoading(true)

    try {
      const [farmerResponse, collectionResponse] =
        await Promise.all([
          api.get('/farmers/'),
          api.get('/collections/'),
        ])

      setFarmers(farmerResponse.data)
      setCollections(collectionResponse.data)
    } catch (err) {
      const detail = err.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Could not load farmers or milk collections.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Load data when the component opens.
  useEffect(() => {
    loadData()
  }, [])

  // Save a new milk collection.
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const parsedFarmerId = Number(farmerId)
    const parsedWeight = Number(weight)

    if (
      !Number.isInteger(parsedFarmerId) ||
      parsedFarmerId < 1
    ) {
      setError('Please select a valid farmer.')
      return
    }

    if (
      !Number.isFinite(parsedWeight) ||
      parsedWeight <= 0
    ) {
      setError('Milk weight must be greater than zero.')
      return
    }

    try {
      setSaving(true)

      await api.post('/collections/', {
        farmer_id: parsedFarmerId,
        weight: parsedWeight,
      })

      setSuccess('Milk collection saved successfully!')

      setFarmerId('')
      setWeight('')

      // Refresh collection history after saving.
      await loadData()

      // Notify App.jsx to refresh the analytics charts.
      if (onCollectionSaved) {
        onCollectionSaved()
      }
    } catch (err) {
      const detail = err.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to save collection. Please check the backend.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Find the farmer name using the farmer ID.
  function getFarmerName(id) {
    const farmer = farmers.find(
      (item) => Number(item.id) === Number(id)
    )

    return farmer ? farmer.name : `Farmer #${id}`
  }

  return (
    <div className="container-fluid px-0">
      {/* Page heading */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <p className="section-kicker">DAILY OPERATIONS</p>
          <h2 className="fw-bold mb-1">Milk Collection</h2>
          <p className="text-secondary mb-0">
            Register and review milk received from farmers.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-success"
          onClick={loadData}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      {/* New collection form */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">
            Record New Collection
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Farmer dropdown */}
              <div className="col-md-6">
                <label className="form-label">
                  Select Farmer *
                </label>

                <select
                  className="form-select"
                  value={farmerId}
                  onChange={(event) =>
                    setFarmerId(event.target.value)
                  }
                  required
                  disabled={loading || farmers.length === 0}
                >
                  <option value="">
                    Choose a registered farmer
                  </option>

                  {farmers.map((farmer) => (
                    <option
                      key={farmer.id}
                      value={farmer.id}
                    >
                      {farmer.name} ({farmer.farmer_code})
                    </option>
                  ))}
                </select>

                {!loading && farmers.length === 0 && (
                  <div className="form-text">
                    Register a farmer before recording a collection.
                  </div>
                )}
              </div>

              {/* Milk weight input */}
              <div className="col-md-6">
                <label className="form-label">
                  Milk Weight (kg) *
                </label>

                <input
                  type="number"
                  className="form-control"
                  min="0.01"
                  step="0.01"
                  value={weight}
                  onChange={(event) =>
                    setWeight(event.target.value)
                  }
                  placeholder="Example: 12.50"
                  required
                />
              </div>

              {/* Submit button */}
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={
                    saving ||
                    loading ||
                    farmers.length === 0
                  }
                >
                  {saving
                    ? 'Saving Collection...'
                    : 'Save Collection'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Collection history */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">
            Collection History
          </h5>

          {loading ? (
            <p className="text-secondary">
              Loading collections...
            </p>
          ) : collections.length === 0 ? (
            <p className="text-secondary">
              No milk collections found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Collection ID</th>
                    <th>Farmer</th>
                    <th>Weight (kg)</th>
                    <th>Collection Time</th>
                  </tr>
                </thead>

                <tbody>
                  {collections.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>

                      <td>
                        {getFarmerName(item.farmer_id)}
                      </td>

                      <td>
                        {Number(item.weight).toFixed(2)} kg
                      </td>

                      <td>
                        {item.collection_time
                          ? new Date(
                              item.collection_time
                            ).toLocaleString()
                          : 'Not available'}
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
  )
}

export default MilkCollection
