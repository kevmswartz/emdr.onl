<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <div class="max-w-4xl mx-auto py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Session History</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Track your progress over time</p>
        </div>
        <button
          @click="$router.push('/')"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-800 dark:text-white transition-colors"
        >
          ← Back
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sessions</div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ statistics.totalSessions }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ formatDuration(statistics.totalDuration) }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Duration</div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ formatDuration(statistics.averageDuration) }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Improvement</div>
          <div class="text-3xl font-bold text-green-600 dark:text-green-500">
            {{ statistics.averageDistressReduction > 0 ? '-' : '' }}{{ statistics.averageDistressReduction.toFixed(1) }}
          </div>
        </div>
      </div>

      <!-- Export Buttons -->
      <div class="flex gap-4 mb-6">
        <button
          @click="$emit('export-json')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          📥 Export JSON
        </button>
        <button
          @click="$emit('export-csv')"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          📊 Export CSV
        </button>
        <button
          v-if="sessions.length > 0"
          @click="confirmClear"
          class="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          🗑️ Clear All
        </button>
      </div>

      <!-- Sessions List -->
      <div class="space-y-4">
        <div v-if="isLoading" class="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading sessions...
        </div>
        <div v-else-if="sessions.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">📊</div>
          <div class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No sessions yet</div>
          <div class="text-gray-600 dark:text-gray-400">Complete a session with journaling enabled to see it here</div>
        </div>
        <div
          v-else
          v-for="session in sessions"
          :key="session.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(session.timestamp) }}</div>
              <div class="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {{ formatDuration(session.duration) }} • {{ patternLabel(session.settings.pattern) }}
              </div>
            </div>
            <button
              @click="$emit('delete', session.id)"
              class="text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
              title="Delete session"
            >
              🗑️
            </button>
          </div>

          <!-- Distress Change -->
          <div
            v-if="session.journal?.initialDistress !== undefined && session.journal?.currentDistress !== undefined"
            class="flex items-center gap-6 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Initial:</span>
              <span class="font-semibold dark:text-white">{{ session.journal.initialDistress }}</span>
            </div>
            <div class="text-gray-400 dark:text-gray-500">→</div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-400">Final:</span>
              <span class="font-semibold dark:text-white">{{ session.journal.currentDistress }}</span>
            </div>
            <div
              v-if="session.distressReduction !== undefined"
              class="ml-auto flex items-center gap-2"
            >
              <span class="text-sm text-gray-600 dark:text-gray-400">Change:</span>
              <span
                class="font-semibold"
                :class="session.distressReduction > 0 ? 'text-green-600 dark:text-green-500' : session.distressReduction < 0 ? 'text-red-600 dark:text-red-500' : 'text-gray-600 dark:text-gray-400'"
              >
                {{ session.distressReduction > 0 ? '-' : session.distressReduction < 0 ? '+' : '' }}{{ Math.abs(session.distressReduction) }}
              </span>
            </div>
          </div>

          <!-- Journal Content -->
          <div v-if="session.journal" class="space-y-2 text-sm">
            <div v-if="session.journal.targetMemory" class="text-gray-600 dark:text-gray-400">
              <span class="font-medium dark:text-gray-300">Target:</span> {{ session.journal.targetMemory }}
            </div>
            <div v-if="session.journal.whatCameUp" class="text-gray-600 dark:text-gray-400">
              <span class="font-medium dark:text-gray-300">What came up:</span> {{ session.journal.whatCameUp }}
            </div>
            <div v-if="session.journal.notes" class="text-gray-600 dark:text-gray-400">
              <span class="font-medium dark:text-gray-300">Notes:</span> {{ session.journal.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session, Statistics } from '../types'

defineProps<{
  sessions: Session[]
  statistics: Statistics
  isLoading: boolean
}>()

const emit = defineEmits<{
  back: []
  delete: [id: string]
  'export-json': []
  'export-csv': []
  'clear-all': []
}>()

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

const patternLabel = (pattern: string) => {
  const labels = {
    horizontal: '→ Horizontal',
    vertical: '↕ Vertical',
    circular: '⭕ Circular',
    figure8: '∞ Figure-8',
    bounce: '📺 Bounce (DVD)',
  }
  return labels[pattern as keyof typeof labels] || pattern
}

const confirmClear = () => {
  if (confirm('Are you sure you want to delete all sessions? This cannot be undone.')) {
    emit('clear-all')
  }
}
</script>
