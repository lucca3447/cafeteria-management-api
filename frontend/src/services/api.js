import axios from 'axios'

const ACCESS_TOKEN_KEY = 'cafeteria_access_token'
const REFRESH_TOKEN_KEY = 'cafeteria_refresh_token'

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

let refreshPromise = null

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  }
}

export function storeTokens({ access_token, refresh_token }) {
  if (access_token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token)
  }

  if (refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token)
  }
}

export function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function emitSessionExpired() {
  window.dispatchEvent(new Event('auth:session-expired'))
}

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredTokens()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const path = originalRequest?.url || ''

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (path.includes('/auth/login') || path.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    const { refreshToken } = getStoredTokens()

    if (!refreshToken) {
      clearStoredTokens()
      emitSessionExpired()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken })
          .then((response) => {
            storeTokens(response.data)
            return response.data.access_token
          })
          .catch((refreshError) => {
            clearStoredTokens()
            emitSessionExpired()
            throw refreshError
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newAccessToken = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
