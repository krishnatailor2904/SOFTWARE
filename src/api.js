// Django backend ka base URL.
// Local dev me Vite `.env` file se nahi mile to localhost pe fallback hota hai.
// Production (Vercel) me VITE_API_URL environment variable set karna zaroori
// hai - Vercel project ke Settings -> Environment Variables me daalo, jaise:
//   VITE_API_URL = https://your-backend-project.vercel.app/api
// (backend ke URL ke aage /api zaroor lagana, jaise upar example me hai)
// Trailing slash ho ya na ho - dono chalega, neeche khud hata diya jaata hai.
const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

const TOKEN_KEY = 'tailor_shop_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Token ${token}` } : {}
}

async function handle(res) {
  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.error || JSON.stringify(body)
    } catch {
      // response JSON nahi tha, default message hi rakho
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // ---- Auth ----
  register: (data) =>
    fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),

  login: (data) =>
    fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handle),

  me: () =>
    fetch(`${BASE_URL}/auth/me/`, { headers: authHeaders() }).then(handle),

  // ---- Bills ----
  getBills: () => fetch(`${BASE_URL}/bills/`, { headers: authHeaders() }).then(handle),

  createBill: (data) =>
    fetch(`${BASE_URL}/bills/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),

  updateBill: (id, data) =>
    fetch(`${BASE_URL}/bills/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),

  deleteBill: (id) =>
    fetch(`${BASE_URL}/bills/${id}/`, { method: 'DELETE', headers: authHeaders() }).then(handle),

  // ---- Measurements ----
  getMeasurement: (billId) =>
    fetch(`${BASE_URL}/bills/${billId}/measurement/`, { headers: authHeaders() }).then(handle),

  saveMeasurement: (billId, data) =>
    fetch(`${BASE_URL}/bills/${billId}/measurement/save/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    }).then(handle),
}
