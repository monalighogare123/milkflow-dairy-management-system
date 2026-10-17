
import { useEffect, useState } from 'react'
import api from '../api'

function MilkQuality() {
  const [collections, setCollections] = useState([])
  const [qualityRecords, setQualityRecords] = useState([])

  const [collectionId, setCollectionId] = useState('')
  const [fat, setFat] = useState('')
  const [snf, setSnf] = useState('')
  const [clr, setClr] = useState('')
  const [protein, setProtein] = useState('')
  const [temperature, setTemperature] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [collectionResponse, qualityResponse] =
        await Promise.all([
          api.get('/collections/'),
          api.get('/quality/'),
        ])

      setCollections(collectionResponse.data)
      setQualityRecords(qualityResponse.data)
    } catch (err) {
      const detail = err.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Could not load collections or quality records.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!collectionId) {
      setError('Please select a milk collection.')
      return
    }

    const fatValue = Number(fat)
    const snfValue = Number(snf)
    const clrValue = Number(clr)

    if (
      !Number.isFinite(fatValue) ||
      !Number.isFinite(snfValue) ||
      !Number.isFinite(clrValue) ||
      fatValue < 0 ||
      snfValue < 0 ||
      clrValue < 0
    ) {
      setError('Enter valid, non-negative quality values.')
      return
    }

    const selectedId = Number(collectionId)

    const alreadyRecorded = qualityRecords.some(
      (record) =>
        Number(record.collection_id) === selectedId
    )

    if (alreadyRecorded) {
      setError(
        'This collection already has a quality record.'
      )
      return
    }

    const payload = {
      collection_id: selectedId,
      fat: fatValue,
      snf: snfValue,
      clr: clrValue,
      protein: protein === '' ? null : Number(protein),
      temperature:
        temperature === '' ? null : Number(temperature),
    }

    if (
      (payload.protein !== null &&
        (!Number.isFinite(payload.protein) ||
          payload.protein < 0)) ||
      (payload.temperature !== null &&
        !Number.isFinite(payload.temperature))
    ) {
      setError('Enter valid protein and temperature values.')
      return
    }

    try {
      setSaving(true)

      await api.post('/quality/', payload)

      setSuccess('Milk quality record saved successfully.')

      setCollectionId('')
      setFat('')
      setSnf('')
      setClr('')
      setProtein('')
      setTemperature('')

      await loadData()
    } catch (err) {
      const detail = err.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to save quality record. Check the backend schema.'
      )
    } finally {
      setSaving(false)
    }
  }

  function collectionLabel(collection) {
    return `Collection #${collection.id} — Farmer #${collection.farmer_id} — ${Number(collection.weight).toFixed(2)} kg`
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <p className="section-kicker">QUALITY CONTROL</p>
          <h2 className="fw-bold mb-1">Milk Quality Monitoring</h2>
          <p className="text-secondary mb-0">
            Record and review test results for each collection.
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

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">
            Enter Quality Test Results
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">
                  Milk Collection *
                </label>

                <select
                  className="form-select"
                  value={collectionId}
                  onChange={(event) =>
                    setCollectionId(event.target.value)
                  }
                  required
                  disabled={loading}
                >
                  <option value="">
                    Select a collection
                  </option>

                  {collections
                    .filter(
                      (collection) =>
                        !qualityRecords.some(
                          (record) =>
                            Number(record.collection_id) ===
                            Number(collection.id)
                        )
                    )
                    .map((collection) => (
                      <option
                        key={collection.id}
                        value={collection.id}
                      >
                        {collectionLabel(collection)}
                      </option>
                    ))}
                </select>

                {!loading && collections.length === 0 && (
                  <div className="form-text">
                    Record a milk collection before adding quality results.
                  </div>
                )}

                {!loading &&
                  collections.length > 0 &&
                  collections.every((collection) =>
                    qualityRecords.some(
                      (record) =>
                        Number(record.collection_id) ===
                        Number(collection.id)
                    )
                  ) && (
                    <div className="form-text">
                      All current collections already have quality records.
                    </div>
                  )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Fat (%) *</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fat}
                  onChange={(event) => setFat(event.target.value)}
                  placeholder="Example: 4.2"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">SNF (%) *</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={snf}
                  onChange={(event) => setSnf(event.target.value)}
                  placeholder="Example: 8.5"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">CLR *</label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={clr}
                  onChange={(event) => setClr(event.target.value)}
                  placeholder="Example: 28"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Protein (%) — optional
                </label>
                <input
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  value={protein}
                  onChange={(event) => setProtein(event.target.value)}
                  placeholder="Enter if available"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Temperature (°C) — optional
                </label>
                <input
                  className="form-control"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(event) =>
                    setTemperature(event.target.value)
                  }
                  placeholder="Enter if available"
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={loading || saving}
                >
                  {saving ? 'Saving...' : 'Save Quality Record'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Quality History</h5>

          {loading ? (
            <p className="text-secondary">Loading quality records...</p>
          ) : qualityRecords.length === 0 ? (
            <p className="text-secondary">
              No quality records found.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Collection ID</th>
                    <th>Fat (%)</th>
                    <th>SNF (%)</th>
                    <th>CLR</th>
                    <th>Protein (%)</th>
                    <th>Temperature (°C)</th>
                  </tr>
                </thead>

                <tbody>
                  {qualityRecords.map((record) => (
                    <tr key={record.id}>
                      <td>#{record.id}</td>
                      <td>#{record.collection_id}</td>
                      <td>{record.fat}</td>
                      <td>{record.snf}</td>
                      <td>{record.clr}</td>
                      <td>{record.protein ?? '—'}</td>
                      <td>{record.temperature ?? '—'}</td>
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

export default MilkQuality
