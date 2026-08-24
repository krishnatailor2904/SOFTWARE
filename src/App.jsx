import { useEffect, useState } from 'react'
import { api, getToken, clearToken } from './api'
import AuthScreen from './components/AuthScreen'
import BillsTable from './components/BillsTable'
import BillForm from './components/BillForm'
import MeasurementPanel from './components/MeasurementPanel'

export default function App() {
  // ---- Auth state ----
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState(null) // { username, shop_name }

  // ---- Bills state ----
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)     // bill being edited, null = new bill
  const [activeMeasureBill, setActiveMeasureBill] = useState(null) // bill whose measurement panel is open

  // App khulte hi check karo: agar pehle se login token saved hai (localStorage
  // me), to seedha andar le jao, dobara login mangwane ki zaroorat nahi.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setCheckingAuth(false)
      return
    }
    api.me()
      .then((data) => setUser(data))
      .catch(() => {
        clearToken() // token expire/invalid ho gaya, dobara login karwao
      })
      .finally(() => setCheckingAuth(false))
  }, [])

  // Data hamesha backend (database) se load hota hai, sirf isi login-shop ka.
  const loadBills = () => {
    setLoading(true)
    api.getBills()
      .then((data) => {
        setBills(data)
        setError('')
      })
      .catch((err) => {
        console.error(err)
        setError('Backend se connect nahi ho paaya. Django server chal raha hai ya nahi check karo (README dekho).')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user) loadBills()
  }, [user])

  const handleAuthed = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setBills([])
  }

  const handleAddClick = () => {
    setEditingBill(null)
    setShowForm(true)
  }

  const handleEditClick = (bill) => {
    setEditingBill(bill)
    setShowForm(true)
  }

  const handleDelete = async (bill) => {
    if (!window.confirm(`Bill No. ${bill.bill_no} (${bill.name}) delete karna hai? Ye undo nahi ho sakta.`)) return
    await api.deleteBill(bill.id)
    loadBills()
  }

  const handleFormSaved = () => {
    setShowForm(false)
    setEditingBill(null)
    loadBills()
  }

  const handleToggleStatus = async (bill, field) => {
    await api.updateBill(bill.id, { [field]: !bill[field] })
    loadBills()
  }

  // ---- Render: auth check ho raha hai ----
  if (checkingAuth) {
    return <div className="auth-shell"><div className="empty-state">Loading...</div></div>
  }

  // ---- Render: login/register screen (koi user login nahi hai) ----
  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />
  }

  // ---- Render: main app (login ho chuka hai) ----
  return (
    <div className="app-shell">
      <div className="tape-strip" />
      <header className="app-header">
        <div className="header-top-row">
          <div>
            <div className="brand">
              <h1>{user.shop_name}</h1>
            </div>
            <div className="tagline">Bills, measurements aur order status — sab ek jagah</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <div className="toolbar">
          <span className="count-pill">{bills.length} bill{bills.length !== 1 ? 's' : ''}</span>
          <button className="btn btn-primary" onClick={handleAddClick}>+ Add Bill</button>
        </div>

        {error && (
          <div className="card" style={{ padding: 16, marginBottom: 16, color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none' }}>
            {error}
          </div>
        )}

        {!error && (
          <div className="card">
            <div className="table-wrap">
              {loading ? (
                <div className="empty-state">Loading...</div>
              ) : bills.length === 0 ? (
                <div className="empty-state">
                  <h3>Abhi koi bill nahi hai</h3>
                  <p>"+ Add Bill" dabao aur pehli entry banao.</p>
                </div>
              ) : (
                <BillsTable
                  bills={bills}
                  onOpenMeasurement={setActiveMeasureBill}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <BillForm
          bill={editingBill}
          onClose={() => setShowForm(false)}
          onSaved={handleFormSaved}
        />
      )}

      {activeMeasureBill && (
        <MeasurementPanel
          bill={activeMeasureBill}
          onClose={() => setActiveMeasureBill(null)}
          onStatusChange={loadBills}
        />
      )}
    </div>
  )
}
