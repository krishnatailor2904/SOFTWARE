import { useState } from 'react'
import { api } from '../api'

function nextBillNo() {
  const now = new Date()
  const stamp = now.getTime().toString().slice(-6)
  return `B${stamp}`
}

function formatDate(value) {
  const d = value ? new Date(value) : new Date()
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function BillForm({ bill, onClose, onSaved }) {
  const isEdit = Boolean(bill)
  const displayDate = formatDate(bill?.created_at)

  const [form, setForm] = useState({
    bill_no: bill?.bill_no || nextBillNo(),
    name: bill?.name || '',
    phone: bill?.phone || '',
    cloth_price: bill?.cloth_price ?? '',
    stitching_price: bill?.stitching_price ?? '',
    note: bill?.note || '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const total =
    (Number(form.cloth_price) || 0) +
    (Number(form.stitching_price) || 0)

  const handleChange = (field) => (e) => {
    setForm((f) => ({
      ...f,
      [field]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        bill_no: form.bill_no,
        name: form.name,
        phone: form.phone,
        cloth_price: form.cloth_price || 0,
        stitching_price: form.stitching_price || 0,
        note: form.note,
      }

      if (isEdit) {
        await api.updateBill(bill.id, payload)
      } else {
        await api.createBill(payload)
      }

      onSaved()
    } catch (err) {
      console.error(err)
      setError(
        'Save nahi ho paaya — shayad ye Bill No. pehle se hai. Alag number try karo.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>{isEdit ? 'Edit Bill' : 'New Bill'}</h2>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="modal-body">

            {error && (
              <div
                style={{
                  marginBottom: 12,
                  color: 'var(--danger)',
                  fontSize: 13
                }}
              >
                {error}
              </div>
            )}

            <div className="form-grid">

              <div className="form-field">
                <label>Bill No.</label>
                <input
                  value={form.bill_no}
                  onChange={handleChange('bill_no')}
                  required
                />
              </div>

              <div className="form-field">
                <label>Phone No.</label>
                <input
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="98xxxxxxxx"
                />
              </div>

              <div className="form-field full">
                <label>Date</label>
                <input value={displayDate} disabled />
              </div>

              <div className="form-field full">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                />
              </div>

              <div className="form-field">
                <label>Cloth Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cloth_price}
                  onChange={handleChange('cloth_price')}
                />
              </div>

              <div className="form-field">
                <label>Stitching Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.stitching_price}
                  onChange={handleChange('stitching_price')}
                />
              </div>

              <div className="form-field full">
                <label>Total Payment</label>
                <input
                  value={total.toFixed(2)}
                  disabled
                />
              </div>

              <div className="form-field full">
                <label>Note</label>
                <textarea
                  value={form.note}
                  onChange={handleChange('note')}
                  placeholder="Enter any note..."
                  rows="3"
                />
              </div>

            </div>
          </div>

          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : isEdit
                  ? 'Save Changes'
                  : 'Add Bill'}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}