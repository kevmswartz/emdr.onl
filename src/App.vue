<template>
  <!-- Home View -->
  <div v-if="currentView === 'home'" class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="w-full max-w-md space-y-8" role="main" aria-label="EMDR BLS Home">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">🎯 EMDR BLS</h1>
        <p class="text-gray-600 dark:text-gray-400">Bilateral Stimulation Tool</p>
      </div>

      <!-- Quick Settings -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Settings</h2>

        <!-- Pattern -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Movement Pattern
          </label>
          <select
            v-model="settings.pattern"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Movement pattern"
          >
            <option value="horizontal">→ Horizontal</option>
            <option value="vertical">↕ Vertical</option>
            <option value="circular">⭕ Circular</option>
            <option value="figure8">∞ Figure-8</option>
            <option value="bounce">📺 Bounce (DVD)</option>
          </select>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration: {{ settings.duration }}s
          </label>
          <input
            type="range"
            v-model.number="settings.duration"
            min="10"
            max="180"
            step="10"
            class="w-full"
            aria-label="Session duration in seconds"
          />
        </div>

        <!-- Speed -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Speed: {{ settings.speed }}/10
          </label>
          <input
            type="range"
            v-model.number="settings.speed"
            min="1"
            max="10"
            class="w-full"
            aria-label="Movement speed"
          />
        </div>

        <!-- Sound Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sound Type
          </label>
          <select
            v-model="settings.soundType"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Sound type"
          >
            <option value="sine">🎵 Soft (Sine)</option>
            <option value="triangle">📐 Mellow (Triangle)</option>
            <option value="sawtooth">🔊 Bright (Sawtooth)</option>
          </select>
        </div>

        <!-- Volume -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Volume: {{ Math.round(settings.volume * 100) }}%
          </label>
          <input
            type="range"
            v-model.number="settings.volume"
            min="0"
            max="1"
            step="0.1"
            class="w-full"
            aria-label="Volume level"
          />
        </div>

        <!-- Dot Color -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dot Color
          </label>
          <input
            type="color"
            v-model="settings.dotColor"
            class="w-full h-12 rounded-lg cursor-pointer"
            aria-label="Dot color picker"
          />
        </div>

        <!-- Enable Journaling -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="journaling"
            v-model="settings.enableJournaling"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="journaling" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            📝 Enable Journaling
          </label>
        </div>

        <!-- Haptic Feedback -->
        <div class="flex items-center">
          <input
            type="checkbox"
            id="haptic"
            v-model="settings.hapticFeedback"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label for="haptic" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            📳 Haptic Feedback
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="handleStartSession"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors touch-target"
          aria-label="Start BLS session"
        >
          🌀 Start Session
        </button>
        <button
          @click="goToHistory"
          class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-xl transition-colors"
          aria-label="View session history"
        >
          📊 View History
        </button>
        <button
          @click="goToFeedback"
          class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-xl transition-colors"
          aria-label="Give feedback"
        >
          💬 Feedback
        </button>
      </div>
    </div>
  </div>

  <!-- Pre-Session Journal -->
  <PreSessionJournal
    v-else-if="currentView === 'pre-journal'"
    @continue="handlePreJournalContinue"
    @skip="startBLSSession"
  />

  <!-- Session View (Fullscreen) -->
  <SessionView
    v-else-if="currentView === 'session'"
    :settings="settings"
    @end-session="handleSessionEnd"
    @show-toast="showToast"
  />

  <!-- Post-Session Journal -->
  <PostSessionJournal
    v-else-if="currentView === 'post-journal'"
    :initial-journal="currentJournal"
    @save="handlePostJournalSave"
    @skip="finishSession"
  />

  <!-- History View -->
  <HistoryView
    v-else-if="currentView === 'history'"
    :sessions="sessions"
    :statistics="statistics"
    :is-loading="isLoading"
    @back="goHome"
    @delete="deleteSession"
    @export-json="exportToJSON"
    @export-csv="exportToCSV"
    @clear-all="clearAllSessions"
  />

  <!-- Feedback View -->
  <FeedbackView
    v-else-if="currentView === 'feedback'"
    @back="goHome"
  />

  <!-- Toast Notifications -->
  <Toast :message="toastMessage" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Settings, JournalEntry } from './types'
import SessionView from './components/SessionView.vue'
import PreSessionJournal from './components/PreSessionJournal.vue'
import PostSessionJournal from './components/PostSessionJournal.vue'
import HistoryView from './components/HistoryView.vue'
import FeedbackView from './components/FeedbackView.vue'
import Toast from './components/Toast.vue'
import { useSessionStorage } from './composables/useSessionStorage'
import { useTheme } from './composables/useTheme'

type View = 'home' | 'pre-journal' | 'session' | 'post-journal' | 'history' | 'feedback'

// Theme & accessibility
useTheme() // Initialize theme detection

const currentView = ref<View>('home')
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

// Navigation
const goHome = () => {
  currentView.value = 'home'
}

const goToHistory = () => {
  currentView.value = 'history'
}

const goToFeedback = () => {
  currentView.value = 'feedback'
}

// Session flow
const handleStartSession = () => {
  if (settings.value.enableJournaling) {
    currentView.value = 'pre-journal'
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
  currentView.value = 'session'
}

const handleSessionEnd = () => {
  sessionDuration.value = Math.floor((Date.now() - sessionStartTime.value) / 1000)

  if (settings.value.enableJournaling) {
    currentView.value = 'post-journal'
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
      id: crypto.randomUUID(),
      timestamp: sessionStartTime.value,
      duration: sessionDuration.value,
      settings: { ...settings.value },
      journal: fullJournal,
      distressReduction,
    })
    showToast('Session saved!')
  } catch (error) {
    showToast('Failed to save session')
    console.error(error)
  }

  finishSession()
}

const finishSession = () => {
  currentJournal.value = {}
  currentView.value = 'home'
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
  localStorage.setItem('emdr-settings', JSON.stringify(settings.value))
}

onMounted(async () => {
  // Load settings
  const stored = localStorage.getItem('emdr-settings')
  if (stored) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(stored) }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }

  // Load sessions
  await loadSessions()
})

watch(settings, saveSettings, { deep: true })
</script>