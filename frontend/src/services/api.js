import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`

let refreshPromise = null

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

function emitSessionExpired() {
  window.dispatchEvent(new Event('auth:session-expired'))
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const path = originalRequest?.url || ''

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (path.includes('/auth/login') || path.includes('/auth/refresh') || path.includes('/auth/me')) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post('/auth/refresh')
          .then((response) => response.data)
          .catch((refreshError) => {
            emitSessionExpired()
            throw refreshError
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      await refreshPromise
      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
