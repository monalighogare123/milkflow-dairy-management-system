
import { useState } from 'react'
import api from '../api'

function AddFarmer({ onFarmerAdded, onClose }) {
  const [formData, setFormData] = useState({
    farmer_code: '',
    name: '',
    mobile: '',
    address: '',
    milk_type: 'Cow',
    center_id: '1',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!/^\d{10}$/.test(formData.mobile)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    if (!Number.isInteger(Number(formData.center_id)) ||
        Number(formData.center_id) < 1) {
      setError('Enter a valid collection center ID.')
      return
    }

    try {
      setLoading(true)

      const newFarmer = {
        ...formData,
        center_id: Number(formData.center_id),
      }

      await api.post('/farmers/', newFarmer)

      setSuccess('Farmer registered successfully!')

      if (onFarmerAdded) {
        await onFarmerAdded()
      }

      setFormData({
        farmer_code: '',
        name: '',
        mobile: '',
        address: '',
        milk_type: 'Cow',
        center_id: '1',
      })
    } catch (err) {
      const detail = err.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to register farmer. Check the form and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1">Register New Farmer</h5>
            <p className="text-secondary small mb-0">
              Enter the farmer's details below.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
            >
              Close
            </button>
          )}
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

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Farmer Code *</label>
              <input
                className="form-control"
                name="farmer_code"
                value={formData.farmer_code}
                onChange={handleChange}
                placeholder="Example: FARM003"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Full Name *</label>
              <input
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter farmer name"
                maxLength={100}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Mobile Number *</label>
              <input
                className="form-control"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                inputMode="numeric"
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Milk Type *</label>
              <select
                className="form-select"
                name="milk_type"
                value={formData.milk_type}
                onChange={handleChange}
                required
              >
                <option value="Cow">Cow</option>
                <option value="Buffalo">Buffalo</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Collection Center ID *</label>
              <input
                className="form-control"
                type="number"
                name="center_id"
                min="1"
                step="1"
                value={formData.center_id}
                onChange={handleChange}
                required
              />
              <div className="form-text">
                Use an ID of an existing collection center.
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input
                className="form-control"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Village or address"
                maxLength={255}
              />
            </div>

            <div className="col-12">
              <button
                type="submit"
                className="btn btn-success px-4"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Register Farmer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFarmer
