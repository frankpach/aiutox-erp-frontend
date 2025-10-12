import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AppState {
  loading: boolean
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  locale: string
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  persistent?: boolean
}

export const useAppStore = defineStore('app', () => {
  // State
  const loading = ref(false)
  const sidebarOpen = ref(true)
  const theme = ref<'light' | 'dark'>('light')
  const locale = ref('es-CO')
  const notifications = ref<Notification[]>([])

  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const currentLocale = computed(() => locale.value)

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const setSidebarOpen = (value: boolean) => {
    sidebarOpen.value = value
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    // Store in localStorage
    localStorage.setItem('theme', newTheme)
  }

  const setLocale = (newLocale: string) => {
    locale.value = newLocale
    // Store in localStorage
    localStorage.setItem('locale', newLocale)
  }

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto remove notification
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const showSuccess = (title: string, message: string, duration = 5000) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }

  const showError = (title: string, message: string, persistent = false) => {
    addNotification({
      type: 'error',
      title,
      message,
      persistent
    })
  }

  const showWarning = (title: string, message: string, duration = 5000) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  const showInfo = (title: string, message: string, duration = 5000) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }

  // Initialize from localStorage
  const initialize = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      theme.value = savedTheme
    }

    const savedLocale = localStorage.getItem('locale')
    if (savedLocale) {
      locale.value = savedLocale
    }
  }

  return {
    // State
    loading,
    sidebarOpen,
    theme,
    locale,
    notifications,

    // Getters
    isDark,
    currentLocale,

    // Actions
    setLoading,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    setLocale,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    initialize
  }
})

