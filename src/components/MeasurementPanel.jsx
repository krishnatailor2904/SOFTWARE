import { useEffect, useState } from 'react'
import { api } from '../api'

const SHIRT_FIELDS = [
  ['shirt_length', 'Length'],
  ['shirt_chest', 'Chest'],
  ['shirt_stomach', 'Stomach'],
  ['shirt_sleeve', 'Sleeve'],
  ['shirt_shoulder', 'Shoulder'],
  ['shirt_collar', 'Collar'],
]

const PANT_FIELDS = [
  ['pant_length', 'Length'],
  ['pant_waist', 'Waist'],
  ['pant_thigh', 'Thigh'],
  ['pant_bottom', 'Bottom'],
  ['pant_hip', 'Hip'],
  ['pant_seat_langot', 'Seat (Langot)'],
]

export default function MeasurementPanel({ bill, onClose, onStatusChange }) {
  const [tab, setTab] = useState('shirt')
  const [data, setData] = useState(null)
  const [billStatus, setBillStatus] = useState({ shirt_ready: bill.shirt_ready, pant_ready: bill.pant_ready })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    api.getMeasurement(bill.id).then((m) => {
      setData(m)
      setLoading(false)
    })
  }, [bill.id])

  const handleFieldChange = (field) => (e) => {
    setData((d) => ({ ...d, [field]: e.target.value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSavedMsg('')
    const payload = {}
    ;[...SHIRT_FIELDS, ...PANT_FIELDS].forEach(([key]) => { payload[key] = data[key] || '' })
    payload.notes = data.notes || ''
    await api.saveMeasurement(bill.id, payload)
    setSaving(false)
    setSavedMsg('Saved ✔')
    setTimeout(() => setSavedMsg(''), 1500)
  }

  const toggleReady = async (field) => {
    const newVal = !billStatus[field]
    setBillStatus((s) => ({ ...s, [field]: newVal }))
    await api.updateBill(bill.id, { [field]: newVal })
    onStatusChange()
  }

  const fields = tab === 'shirt' ? SHIRT_FIELDS : PANT_FIELDS
  const readyField = tab === 'shirt' ? 'shirt_ready' : 'pant_ready'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Measurements — {bill.bill_no} ({bill.name})</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="measure-tabs">
            <button className={`measure-tab ${tab === 'shirt' ? 'active' : ''}`} onClick={() => setTab('shirt')}>Shirt</button>
            <button className={`measure-tab ${tab === 'pant' ? 'active' : ''}`} onClick={() => setTab('pant')}>Pant</button>
          </div>

          <div className="measure-status-row">
            <button
              className={`status-toggle ${billStatus[readyField] ? 'on' : ''}`}
              onClick={() => toggleReady(readyField)}
            >
              <span className="dot">{billStatus[readyField] ? '✔' : ''}</span>
              {tab === 'shirt'
                ? (billStatus.shirt_ready ? 'Shirt Ready' : 'Mark Shirt Ready')
                : (billStatus.pant_ready ? 'Pant Ready' : 'Mark Pant Ready')}
            </button>
          </div>

          {loading || !data ? (
            <div className="empty-state">Loading measurements...</div>
          ) : (
            <div className="form-grid">
              {fields.map(([key, label]) => (
                <div className="form-field" key={key}>
                  <label>{label}</label>
                  <input value={data[key] || ''} onChange={handleFieldChange(key)} placeholder="in inches" />
                </div>
              ))}
              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  rows={2}
                  value={data.notes || ''}
                  onChange={handleFieldChange('notes')}
                  placeholder="Koi extra instruction..."
                />
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {savedMsg && <span style={{ color: 'var(--accent-2)', alignSelf: 'center', marginRight: 'auto', fontSize: 13 }}>{savedMsg}</span>}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Measurements'}
          </button>
        </div>
      </div>
    </div>
  )
}
