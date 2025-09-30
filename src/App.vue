<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🎯 EMDR BLS</h1>
        <p class="text-gray-600">Bilateral Stimulation Tool</p>
      </div>

      <!-- Quick Settings -->
      <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Quick Settings</h2>

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
      </div>

      <!-- Start Button -->
      <button
        @click="startSession"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors touch-target"
      >
        🌀 Start Session
      </button>
    </div>

    <!-- Session View (Fullscreen) -->
    <SessionView
      v-if="isSessionActive"
      :settings="settings"
      @end-session="endSession"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Settings } from './types'
import SessionView from './components/SessionView.vue'

const isSessionActive = ref(false)
const settings = ref<Settings>({
  speed: 5,
  dotSize: 60,
  dotColor: '#10b981',
  backgroundColor: '#000000',
  audioEnabled: true,
  volume: 0.5,
  frequency: 220,
  duration: 60,
})

const startSession = () => {
  isSessionActive.value = true
}

const endSession = () => {
  isSessionActive.value = false
}

// Load settings from localStorage
onMounted(() => {
  const stored = localStorage.getItem('emdr-settings')
  if (stored) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(stored) }
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }
})

// Save settings to localStorage when changed
const saveSettings = () => {
  localStorage.setItem('emdr-settings', JSON.stringify(settings.value))
}

// Watch for settings changes
import { watch } from 'vue'
watch(settings, saveSettings, { deep: true })
</script>