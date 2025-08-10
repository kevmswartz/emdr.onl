<template>
  <div>
      <h2 class="step-title">Processing Session</h2>
      <p class="step-description text-center text-gray-600 dark:text-gray-400 mb-8">
          Adjust your preferences for the bilateral stimulation session. The dot will move smoothly across your screen with audio cues.
      </p>
      
      <div class="settings-grid grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- Speed Control -->
          <div class="setting-card bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="setting-header flex items-center gap-3 mb-4">
                  <div class="setting-icon w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                  </div>
                  <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">Movement Speed</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">How fast the dot moves</p>
                  </div>
              </div>
              <div class="setting-control">
                  <div class="flex justify-between items-center mb-3">
                      <span class="text-sm text-gray-500 dark:text-gray-400">Slow</span>
                      <span class="font-semibold text-blue-600 dark:text-blue-400">{{ settings.speed }}/10</span>
                      <span class="text-sm text-gray-500 dark:text-gray-400">Fast</span>
                  </div>
                  <input type="range" min="1" max="10" :value="settings.speed" @input="updateSettings('speed', parseInt($event.target.value))" class="w-full">
              </div>
          </div>

          <!-- Duration Control -->
          <div class="setting-card bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="setting-header flex items-center gap-3 mb-4">
                  <div class="setting-icon w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                  </div>
                  <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">Session Duration</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Length of each set</p>
                  </div>
              </div>
              <div class="setting-control">
                  <div class="flex justify-between items-center mb-3">
                      <span class="text-sm text-gray-500 dark:text-gray-400">20s</span>
                      <span class="font-semibold text-green-600 dark:text-green-400">{{ settings.duration }}s</span>
                      <span class="text-sm text-gray-500 dark:text-gray-400">60s</span>
                  </div>
                  <input type="range" min="20" max="60" :value="settings.duration" @input="updateSettings('duration', parseInt($event.target.value))" class="w-full">
              </div>
          </div>

          <!-- Visual Settings -->
          <div class="setting-card bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="setting-header flex items-center gap-3 mb-4">
                  <div class="setting-icon w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                  </div>
                  <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">Visual Settings</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Dot appearance</p>
                  </div>
              </div>
              <div class="setting-control space-y-4">
                  <div>
                      <div class="flex justify-between items-center mb-3">
                          <span class="text-sm text-gray-500 dark:text-gray-400">Size</span>
                          <span class="font-semibold text-purple-600 dark:text-purple-400">{{ settings.dotSize }}px</span>
                      </div>
                      <input type="range" min="20" max="100" :value="settings.dotSize" @input="updateSettings('dotSize', parseInt($event.target.value))" class="w-full">
                  </div>
                  <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Color</label>
                      <div class="flex items-center gap-3">
                          <input type="color" :value="settings.dotColor" @input="updateSettings('dotColor', $event.target.value)" class="w-12 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer">
                          <span class="text-sm text-gray-500 dark:text-gray-400">{{ settings.dotColor }}</span>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Audio Settings -->
          <div class="setting-card bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="setting-header flex items-center gap-3 mb-4">
                  <div class="setting-icon w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
                      </svg>
                  </div>
                  <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">Audio Cues</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">Sound feedback</p>
                  </div>
              </div>
              <div class="setting-control">
                  <div class="flex justify-between items-center mb-3">
                      <span class="text-sm text-gray-500 dark:text-gray-400">Off</span>
                      <span class="font-semibold text-orange-600 dark:text-orange-400">{{ Math.round(settings.volume * 100) }}%</span>
                      <span class="text-sm text-gray-500 dark:text-gray-400">Loud</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" :value="settings.volume" @input="updateSettings('volume', parseFloat($event.target.value))" class="w-full">
              </div>
          </div>
      </div>
      
      <div class="button-group flex justify-center gap-4">
          <button @click="$emit('goToStep', 2)" class="btn-secondary" v-if="sessionMode !== 'quick'">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
          </button>
          <button @click="$emit('startSet')" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
              <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a2 2 0 002 2h2a2 2 0 002-2v-4M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M12 5l0 0"></path>
              </svg>
              Begin Session
          </button>
      </div>
  </div>
</template>

<script>
export default {
  props: ['settings', 'sessionMode'],
  methods: {
    updateSettings(key, value) {
      this.$emit('update:settings', { ...this.settings, [key]: value });
      this.$emit('saveSettings');
    },
  },
};
</script>
