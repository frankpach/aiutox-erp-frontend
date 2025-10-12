import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

export interface User {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  // Actions
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true
      const response = await axios.post(API_ENDPOINTS.auth.login, {
        email,
        password
      })

      const { access_token, refresh_token, user: userData } = response.data

      // Store tokens
      accessToken.value = access_token
      refreshToken.value = refresh_token
      user.value = userData

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      return { success: true, data: response.data }
    } catch (error: unknown) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      const axiosError = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        error: axiosError.response?.data?.message || errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      if (refreshToken.value) {
        await axios.post(API_ENDPOINTS.auth.logout, {
          refresh_token: refreshToken.value
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state
      user.value = null
      accessToken.value = null
      refreshToken.value = null

      // Remove axios header
      delete axios.defaults.headers.common['Authorization']
    }
  }

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(API_ENDPOINTS.auth.refresh, {
        refresh_token: refreshToken.value
      })

      const { access_token, refresh_token: newRefreshToken } = response.data

      // Update tokens
      accessToken.value = access_token
      refreshToken.value = newRefreshToken

      // Update axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      return { success: true, access_token }
    } catch (error: unknown) {
      console.error('Token refresh error:', error)

      // Clear state on refresh failure
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      delete axios.defaults.headers.common['Authorization']

      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed'
      const axiosError = error as { response?: { data?: { message?: string } } }
      return { success: false, error: axiosError.response?.data?.message || errorMessage }
    }
  }

  const getMe = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.auth.me)
      user.value = response.data
      return { success: true, data: response.data }
    } catch (error: unknown) {
      console.error('Get me error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user data'
      const axiosError = error as { response?: { data?: { message?: string } } }
      return {
        success: false,
        error: axiosError.response?.data?.message || errorMessage
      }
    }
  }

  const hasPermission = (permission: string): boolean => {
    return user.value?.permissions?.includes(permission) || false
  }

  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) || false
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,

    // Getters
    isAuthenticated,

    // Actions
    login,
    logout,
    refreshAccessToken,
    getMe,
    hasPermission,
    hasRole
  }
})

