
import { useEffect, useState } from 'react'
import { api, getToken, clearToken } from './api'
import AuthScreen from './components/AuthScreen'
import BillsTable from './components/BillsTable'
import BillForm from './components/BillForm'
import MeasurementPanel from './components/MeasurementPanel'

// Bill numbers ko numeric descending order mein sort karo.
// Example: 120, 99, 25, 12
function sortBillsDescending(items) {
  return [...items].sort((a, b) => {
    const aNo = String(a.bill_no ?? '').trim()
    const bNo = String(b.bill_no ?? '').trim()

    const aNumeric = /^\d+$/.test(aNo)
    const bNumeric = /^\d+$/.test(bNo)

    if (aNumeric && bNumeric) {
      const aBig = BigInt(aNo)
      const bBig = BigInt(bNo)

      if (aBig > bBig) return -1
      if (aBig < bBig) return 1

      return 0
    }

    if (aNumeric !== bNumeric) {
      return aNumeric ? -1 : 1
    }

    return bNo.localeCompare(bNo, undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  })
}

export default function App() {
  // Auth state
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState(null)

  // Bills state
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [activeMeasureBill, setActiveMeasureBill] = useState(null)

  // Existing login token check
  useEffect(() => {
    const token = getToken()

    if (!token) {
      setCheckingAuth(false)
      return
    }

    api.me()
      .then((data) => setUser(data))
      .catch(() => {
        clearToken()
      })
      .finally(() => setCheckingAuth(false))
  }, [])

  // Backend se bills load karo aur descending order mein dikhao
  const loadBills = () => {
    setLoading(true)

    api.getBills()
      .then((data) => {
        setBills(sortBillsDescending(data))
        setError('')
      })
      .catch((err) => {
        console.error(err)
        setError(
          'Backend se connect nahi ho paaya. Django server chal raha hai ya nahi check karo (README dekho).'
        )
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
    if (
      !window.confirm(
        `Bill No. ${bill.bill_no} (${bill.name}) delete karna hai? Ye undo nahi ho sakta.`
      )
    ) {
      return
    }

    await api.deleteBill(bill.id)
    loadBills()
  }

  const handleFormSaved = () => {
    setShowForm(false)
    setEditingBill(null)
    loadBills()
  }

  const handleToggleStatus = async (bill, field) => {
    await api.updateBill(bill.id, {
      [field]: !bill[field],
    })

    loadBills()
  }

  // Authentication loading
  if (checkingAuth) {
    return (
      <div className="auth-shell">
        <div className="empty-state">Loading...</div>
      </div>
    )
  }

  // Login/register screen
  if (!user) {
    return <AuthScreen onAuthed={handleAuthed} />
  }

  // Main application
  return (
    <div className="app-shell">
      <div className="tape-strip" />

      <header className="app-header">
        <div className="header-top-row">
          <div>
            <div className="brand">
              <h1>{user.shop_name}</h1>
            </div>

            <div className="tagline">
              Bills, measurements aur order status — sab ek jagah
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="toolbar">
          <span className="count-pill">
            {bills.length} bill{bills.length !== 1 ? 's' : ''}
          </span>

          <button
            className="btn btn-primary"
            onClick={handleAddClick}
          >
            + Add Bill
          </button>
        </div>

        {error && (
          <div
            className="card"
            style={{
              padding: 16,
              marginBottom: 16,
              color: 'var(--danger)',
              background: 'var(--danger-bg)',
              border: 'none',
            }}
          >
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
                  <p>
                    "+ Add Bill" dabao aur pehli entry banao.
                  </p>
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
