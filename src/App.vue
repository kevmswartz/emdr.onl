<template>
  <router-view />

  <!-- Toast Notifications -->
  <Toast :message="toastMessage" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, provide } from 'vue'
import { useRouter } from 'vue-router'
import type { Settings, JournalEntry } from './types'
import Toast from './components/Toast.vue'
import { useSessionStorage } from './composables/useSessionStorage'
import { useTheme } from './composables/useTheme'

// UUID generation with fallback for older browsers
const generateUUID = (): string => {
  if (crypto?.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for browsers without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
}

// Theme & accessibility
useTheme() // Initialize theme detection

const router = useRouter()
const toastMessage = ref('')
const sessionStartTime = ref(0)
const sessionDuration = ref(0)
const currentJournal = ref<JournalEntry>({})

const settings = ref<Settings>({
  pattern: 'horizontal',
  speed: 5,
  dotSize: 60,
  dotColor: '#10b981',
  backgroundColor: '#000000',
  audioEnabled: true,
  soundType: 'sine',
  volume: 0.5,
  frequency: 220,
  duration: 60,
  enableJournaling: false,
  hapticFeedback: true,
  keyboardShortcuts: true,
})

// Session storage
const {
  sessions,
  isLoading,
  statistics,
  loadSessions,
  saveSession,
  deleteSession: removeSession,
  clearAllSessions: clearAll,
  exportToJSON,
  exportToCSV,
} = useSessionStorage()

// Session flow
const handleStartSession = () => {
  if (settings.value.enableJournaling) {
    router.push('/pre-journal')
  } else {
    startBLSSession()
  }
}

const handlePreJournalContinue = (journal: JournalEntry) => {
  currentJournal.value = { ...journal }
  startBLSSession()
}

const startBLSSession = () => {
  sessionStartTime.value = Date.now()
  router.push('/session')
}

const handleSessionEnd = () => {
  sessionDuration.value = Math.floor((Date.now() - sessionStartTime.value) / 1000)

  if (settings.value.enableJournaling) {
    router.push('/post-journal')
  } else {
    finishSession()
  }
}

const handlePostJournalSave = async (postJournal: JournalEntry) => {
  // Merge pre and post journal
  const fullJournal: JournalEntry = {
    ...currentJournal.value,
    ...postJournal,
  }

  // Calculate distress reduction
  let distressReduction: number | undefined
  if (fullJournal.initialDistress !== undefined && fullJournal.currentDistress !== undefined) {
    distressReduction = fullJournal.initialDistress - fullJournal.currentDistress
  }

  // Save session
  try {
    await saveSession({
      id: generateUUID(),
      timestamp: sessionStartTime.value,
      duration: sessionDuration.value,
      settings: { ...settings.value },
      journal: fullJournal,
      distressReduction,
    })
    showToast('Session saved!')
    // Delay finishSession to allow the "Session saved!" toast to be visible
    setTimeout(() => finishSession(), 2000)
  } catch (error) {
    showToast('Failed to save session')
    console.error(error)
    // Still finish session even if save fails
    setTimeout(() => finishSession(), 2000)
  }
}

const finishSession = () => {
  currentJournal.value = {}
  router.push('/')
  showToast('Session complete!')
}

// History actions
const deleteSession = async (id: string) => {
  if (confirm('Delete this session?')) {
    try {
      await removeSession(id)
      showToast('Session deleted')
    } catch (error) {
      showToast('Failed to delete session')
    }
  }
}

const clearAllSessions = async () => {
  try {
    await clearAll()
    showToast('All sessions cleared')
  } catch (error) {
    showToast('Failed to clear sessions')
  }
}

// Toast
const showToast = (message: string) => {
  toastMessage.value = message
}

// Persistence
const saveSettings = () => {
  try {
    localStorage.setItem('emdr-settings', JSON.stringify(settings.value))
  } catch (error) {
    // Handle QuotaExceededError or disabled storage
    console.error('Failed to save settings to localStorage:', error)
    // Silently fail - settings just won't persist
  }
}

// Debounced save for performance (300ms delay)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSaveSettings = () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(saveSettings, 300)
}

// Provide all shared state and methods for child routes
provide('settings', settings)
provide('currentJournal', currentJournal)
provide('sessions', sessions)
provide('statistics', statistics)
provide('isLoading', isLoading)
provide('handleStartSession', handleStartSession)
provide('handleSessionEnd', handleSessionEnd)
provide('handlePreJournalContinue', handlePreJournalContinue)
provide('startBLSSession', startBLSSession)
provide('handlePostJournalSave', handlePostJournalSave)
provide('finishSession', finishSession)
provide('showToast', showToast)
provide('deleteSession', deleteSession)
provide('exportToJSON', exportToJSON)
provide('exportToCSV', exportToCSV)
provide('clearAllSessions', clearAllSessions)

onMounted(async () => {
  // Load settings
  try {
    const stored = localStorage.getItem('emdr-settings')
    if (stored) {
      settings.value = { ...settings.value, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }

  // Load sessions
  try {
    await loadSessions()
  } catch (error) {
    console.error('Failed to load sessions:', error)
    showToast('Unable to load session history')
  }
})

// Debounced settings save to avoid excessive localStorage writes
watch(settings, debouncedSaveSettings, { deep: true })
</script>
