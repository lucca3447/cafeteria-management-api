/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { api, clearStoredTokens, getStoredTokens, storeTokens } from '../services/api'

const AuthContext = createContext(null)

function normalizeRole(role) {
  if (role === 'atendente') {
    return 'funcionario'
  }
  return role
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchMe() {
    const response = await api.get('/auth/me')
    setUser(response.data)
    return response.data
  }

  async function login(loginValue, senha) {
    const response = await api.post('/auth/login', { login: loginValue, senha })
    storeTokens(response.data)
    return fetchMe()
  }

  async function logout() {
    const { refreshToken } = getStoredTokens()

    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken })
      }
    } finally {
      clearStoredTokens()
      setUser(null)
    }
  }

  function hasAnyRole(roles = []) {
    if (!user) {
      return false
    }

    const role = normalizeRole(user.perfil)
    return roles.includes(role)
  }

  useEffect(() => {
    let active = true

    async function bootstrap() {
      const { accessToken } = getStoredTokens()
      if (!accessToken) {
        if (active) {
          setLoading(false)
        }
        return
      }

      try {
        await fetchMe()
      } catch {
        clearStoredTokens()
        if (active) {
          setUser(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    const handleSessionExpired = () => {
      clearStoredTokens()
      setUser(null)
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)

    return () => {
      active = false
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [])

  const isAuthenticated = Boolean(getStoredTokens().accessToken)

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    fetchMe,
    hasAnyRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
