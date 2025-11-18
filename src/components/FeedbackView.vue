<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">💬 Feedback</h1>
        <p class="text-gray-600 dark:text-gray-400">Help us improve EMDR BLS</p>
      </div>

      <!-- Success Message -->
      <div
        v-if="submitted"
        class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
      >
        <div class="text-4xl mb-3">✅</div>
        <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
          Thank you!
        </h3>
        <p class="text-green-700 dark:text-green-300 mb-4">
          Your feedback has been submitted successfully.
        </p>
        <button
          @click="$emit('back')"
          class="text-green-600 dark:text-green-400 hover:underline font-medium"
        >
          ← Back to Home
        </button>
      </div>

      <!-- Form -->
      <form
        v-else
        name="feedback"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        @submit.prevent="handleSubmit"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 space-y-4"
      >
        <!-- Hidden fields for Netlify -->
        <input type="hidden" name="form-name" value="feedback" />
        <input type="hidden" name="bot-field" />

        <!-- Feedback Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            v-model="formData.type"
            name="type"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select type...</option>
            <option value="bug">🐛 Bug Report</option>
            <option value="feature">✨ Feature Request</option>
            <option value="improvement">💡 Improvement</option>
            <option value="general">💬 General Feedback</option>
          </select>
        </div>

        <!-- Email (Optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email (optional)
          </label>
          <input
            v-model="formData.email"
            name="email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Only if you'd like a response
          </p>
        </div>

        <!-- Message -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            v-model="formData.message"
            name="message"
            required
            rows="6"
            placeholder="Tell us what's on your mind..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ formData.message.length }} / 1000 characters
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="$emit('back')"
            class="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!formData.type || !formData.message || isSubmitting"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {{ isSubmitting ? 'Sending...' : 'Send Feedback' }}
          </button>
        </div>
      </form>

      <!-- Privacy Note -->
      <p class="text-xs text-center text-gray-500 dark:text-gray-400">
        Your feedback is sent securely via Netlify Forms. We respect your privacy.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  back: []
}>()

const formData = ref({
  type: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const submitted = ref(false)

const handleSubmit = async () => {
  if (!formData.value.type || !formData.value.message) return

  isSubmitting.value = true

  try {
    const formElement = document.querySelector('form[name="feedback"]') as HTMLFormElement
    const data = new FormData(formElement)

    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data as any).toString()
    })

    submitted.value = true
  } catch (error) {
    console.error('Feedback submission error:', error)
    alert('Failed to send feedback. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
