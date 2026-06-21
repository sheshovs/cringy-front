import axios from 'axios'

const API_ORIGIN = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true,
})

// Routes that should never trigger a refresh attempt
const SKIP_REFRESH = ['/auth/me', '/auth/login', '/auth/register', '/auth/refresh']

// Auto-refresh token on 401 — only for authenticated requests
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const url: string = original?.url ?? ''

    // Skip refresh logic for auth routes and already-retried requests
    const shouldSkip = original._retry || SKIP_REFRESH.some((r) => url.includes(r))
    if (error.response?.status === 401 && !shouldSkip) {
      original._retry = true
      try {
        await axios.post(`${API_ORIGIN}/api/auth/refresh`, {}, { withCredentials: true })
        return api(original)
      } catch {
        // Refresh failed — just reject, let the UI handle it
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api
