<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
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
          @click="handleStartSession()"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors touch-target"
          aria-label="Start BLS session"
        >
          🌀 Start Session
        </button>
        <button
          @click="$router.push('/history')"
          class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-xl transition-colors"
          aria-label="View session history"
        >
          📊 View History
        </button>
        <button
          @click="$router.push('/feedback')"
          class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-xl transition-colors"
          aria-label="Give feedback"
        >
          💬 Feedback
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { Ref } from 'vue'
import type { Settings } from '../types'

const settings = inject<Ref<Settings>>('settings')!
const handleStartSession = inject<() => void>('handleStartSession')!
</script>
