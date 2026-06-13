/**
 * api.js — CompressorAI v6
 * Axios instance with:
 *  - Auto base URL from env variable (VITE_API_URL)
 *  - JWT token injection on every request
 *  - 401 auto-logout
 *  - ngrok header bypass (for ngrok browser warning)
 *
 * Fix vs previous version:
 *  - Token key changed from 'token' → 'auth_token' to match authStore.js.
 *  - 401 handler now clears 'auth_token' + 'auth_user' (was 'token' + 'user').
 *  - FormData fix: Content-Type header removed for multipart requests so browser
 *    can set the correct boundary automatically. Without this, axios sends
 *    'application/json' even for file uploads → FastAPI returns 422.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes — ML analysis can take long
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// ── Request interceptor — inject JWT + fix FormData content-type ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // FIX: When sending FormData (file uploads), delete Content-Type so the
    // browser sets it automatically with the correct multipart boundary.
    // If axios sends 'application/json' for a multipart request, FastAPI
    // cannot parse the file and returns 422 Unprocessable Entity.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 auto-logout ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      const publicPaths = ['/login', '/register', '/verify-email', '/verify', '/', '/tutorial']
      const isPublic = publicPaths.some(p => window.location.pathname === p)
      if (!isPublic) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
