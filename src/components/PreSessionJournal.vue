<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-2xl">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pre-Session Journal</h2>
          <p class="text-gray-600 dark:text-gray-400">Take a moment to reflect before your session</p>
        </div>

        <div class="space-y-4">
          <!-- Target Memory -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Memory or Situation
              <span class="text-gray-400 dark:text-gray-500 text-xs ml-1">(optional)</span>
            </label>
            <textarea
              v-model="journal.targetMemory"
              rows="3"
              maxlength="500"
              placeholder="What memory or situation would you like to process?"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div class="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
              {{ journal.targetMemory?.length || 0 }}/500
            </div>
          </div>

          <!-- Negative Belief -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Negative Belief
              <span class="text-gray-400 dark:text-gray-500 text-xs ml-1">(optional)</span>
            </label>
            <textarea
              v-model="journal.negativeBelief"
              rows="2"
              maxlength="200"
              placeholder="What negative thought about yourself comes up? (e.g., I am not safe, I am powerless)"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div class="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
              {{ journal.negativeBelief?.length || 0 }}/200
            </div>
          </div>

          <!-- Body Sensations -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Body Sensations
              <span class="text-gray-400 dark:text-gray-500 text-xs ml-1">(optional)</span>
            </label>
            <textarea
              v-model="journal.bodySensations"
              rows="2"
              maxlength="200"
              placeholder="Where do you notice tension or discomfort in your body?"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div class="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
              {{ journal.bodySensations?.length || 0 }}/200
            </div>
          </div>

          <!-- Initial Distress -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Distress Level: {{ journal.initialDistress }}
            </label>
            <div class="flex items-center gap-4">
              <span class="text-2xl">😌</span>
              <input
                type="range"
                v-model.number="journal.initialDistress"
                min="0"
                max="10"
                class="flex-1"
              />
              <span class="text-2xl">😰</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>No distress</span>
              <span>Maximum distress</span>
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            @click="handleSkip"
            class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Skip Journal
          </button>
          <button
            @click="handleContinue"
            class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Continue to Session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, inject } from 'vue'
import type { JournalEntry } from '../types'

// Inject handlers from App.vue
const handlePreJournalContinue = inject<(journal: JournalEntry) => void>('handlePreJournalContinue')!
const startBLSSession = inject<() => void>('startBLSSession')!

const journal = reactive<JournalEntry>({
  targetMemory: '',
  negativeBelief: '',
  bodySensations: '',
  initialDistress: 5,
})

const handleContinue = () => {
  handlePreJournalContinue(journal)
}

const handleSkip = () => {
  startBLSSession()
}
</script>