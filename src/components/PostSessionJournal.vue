<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-2xl">
      <div class="bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Post-Session Check-In</h2>
          <p class="text-gray-600">How are you feeling now?</p>
        </div>

        <!-- Distress Change Summary -->
        <div
          v-if="initialJournal?.initialDistress !== undefined"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-600">Initial Distress</div>
              <div class="text-2xl font-bold text-gray-900">{{ initialJournal.initialDistress }}</div>
            </div>
            <div class="text-2xl">→</div>
            <div>
              <div class="text-sm text-gray-600">Current Distress</div>
              <div class="text-2xl font-bold text-gray-900">{{ journal.currentDistress }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Change</div>
              <div
                class="text-2xl font-bold"
                :class="distressChange > 0 ? 'text-green-600' : distressChange < 0 ? 'text-red-600' : 'text-gray-600'"
              >
                {{ distressChange > 0 ? '-' : distressChange < 0 ? '+' : '' }}{{ Math.abs(distressChange) }}
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <!-- What Came Up -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              What Came Up?
              <span class="text-gray-400 text-xs ml-1">(optional)</span>
            </label>
            <textarea
              v-model="journal.whatCameUp"
              rows="4"
              maxlength="500"
              placeholder="Any thoughts, feelings, images, or insights that emerged during the session?"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div class="text-xs text-gray-400 text-right mt-1">
              {{ journal.whatCameUp?.length || 0 }}/500
            </div>
          </div>

          <!-- Current Distress -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Current Distress Level: {{ journal.currentDistress }}
            </label>
            <div class="flex items-center gap-4">
              <span class="text-2xl">😌</span>
              <input
                type="range"
                v-model.number="journal.currentDistress"
                min="0"
                max="10"
                class="flex-1"
              />
              <span class="text-2xl">😰</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>No distress</span>
              <span>Maximum distress</span>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
              <span class="text-gray-400 text-xs ml-1">(optional)</span>
            </label>
            <textarea
              v-model="journal.notes"
              rows="3"
              maxlength="500"
              placeholder="Any other observations or reflections..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div class="text-xs text-gray-400 text-right mt-1">
              {{ journal.notes?.length || 0 }}/500
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            @click="$emit('skip')"
            class="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Skip & Finish
          </button>
          <button
            @click="$emit('save', journal)"
            class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            💾 Save Session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { JournalEntry } from '../types'

const props = defineProps<{
  initialJournal?: JournalEntry
}>()

defineEmits<{
  save: [journal: JournalEntry]
  skip: []
}>()

const journal = reactive<JournalEntry>({
  whatCameUp: '',
  currentDistress: props.initialJournal?.initialDistress || 5,
  notes: '',
})

const distressChange = computed(() => {
  if (props.initialJournal?.initialDistress === undefined) return 0
  return props.initialJournal.initialDistress - (journal.currentDistress || 0)
})
</script>