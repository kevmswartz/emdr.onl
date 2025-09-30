<template>
  <!-- Home View -->
  <div v-if="currentView === 'home'" class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🎯 EMDR BLS</h1>
        <p class="text-gray-600">Bilateral Stimulation Tool</p>
      </div>

      <!-- Quick Settings -->
      <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Quick Settings</h2>

        <!-- Pattern -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Movement Pattern
          </label>
          <select
            v-model="settings.pattern"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="horizontal">→ Horizontal</option>
            <option value="vertical">↕ Vertical</option>
            <option value="circular">⭕ Circular</option>
            <option value="figure8">∞ Figure-8</option>
          </select>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Duration: {{ settings.duration }}s
          </label>
          <input
            type="range"
            v-model.number="settings.duration"
            min="10"
            max="180"
            step="10"
            class="w-full"
          />
        </div>

        <!-- Speed -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Speed: {{ settings.speed }}/10
          </label>
          <input
            type="range"
            v-model.number="settings.speed"
            min="1"
            max="10"
            class="w-full"
          />
        </div>

        <!-- Sound Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sound Type
          </label>
          <select
            v-model="settings.soundType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sine">🎵 Soft (Sine)</option>
            <option value="triangle">📐 Mellow (Triangle)</option>
            <option value="sawtooth">🔊 Bright (Sawtooth)</option>
          </select>
        </div>

        <!-- Volume -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Volume: {{ Math.round(settings.volume * 100) }}%
          </label>
          <input
            type="range"
            v-model.number="settings.volume"
            min="0"
            max="1"
            step="0.1"
            class="w-full"
          />
        </div>

        <!-- Dot Color -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Dot Color
          </label>
          <input
            type="color"
            v-model="settings.dotColor"
            class="w-full h-12 rounded-lg cursor-pointer"
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
          <label for="journaling" class="ml-2 text-sm font-medium text-gray-700">
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
          <label for="haptic" class="ml-2 text-sm font-medium text-gray-700">
            📳 Haptic Feedback
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="handleStartSession"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors touch-target"
        >
          🌀 Start Session
        </button>
        <button
          @click="goToHistory"
          class="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-xl transition-colors"
        >
          📊 View History
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
import Toast from './components/Toast.vue'
import { useSessionStorage } from './composables/useSessionStorage'

type View = 'home' | 'pre-journal' | 'session' | 'post-journal' | 'history'

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