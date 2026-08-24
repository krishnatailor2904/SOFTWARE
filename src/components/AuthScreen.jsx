import { useState } from 'react'
import { api, setToken } from '../api'

export default function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', password: '', shop_name: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let result
      if (mode === 'register') {
        result = await api.register({
          username: form.username,
          password: form.password,
          shop_name: form.shop_name,
          phone: form.phone,
        })
      } else {
        result = await api.login({ username: form.username, password: form.password })
      }
      setToken(result.token)
      onAuthed({ username: result.username, shop_name: result.shop_name })
    } catch (err) {
      setError(err.message || 'Kuch galat ho gaya, dobara try karo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="tape-strip" />
      <div className="auth-card">
        <h1 className="auth-title">Tailor Shop Manager</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Apni shop ke account me login karo' : 'Nayi shop ka account banao'}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError('') }}
            type="button"
          >
            Register (New Shop)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-field full">
              <label>Shop / Brand Name</label>
              <input
                value={form.shop_name}
                onChange={handleChange('shop_name')}
                placeholder="jaise: Sharma Tailors"
                required
              />
            </div>
          )}
          <div className="form-field full">
            <label>Username</label>
            <input value={form.username} onChange={handleChange('username')} required />
          </div>
          {mode === 'register' && (
            <div className="form-field full">
              <label>Phone No. (optional)</label>
              <input value={form.phone} onChange={handleChange('phone')} />
            </div>
          )}
          <div className="form-field full">
            <label>Password</label>
            <input type="password" value={form.password} onChange={handleChange('password')} required />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 6 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register & Start'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>Naya shop hai? <button type="button" onClick={() => setMode('register')}>Register karo</button></>
          ) : (
            <>Pehle se account hai? <button type="button" onClick={() => setMode('login')}>Login karo</button></>
          )}
        </p>
      </div>
    </div>
  )
}
