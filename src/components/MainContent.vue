<template>
  <div class="main-container">
      <!-- Enhanced Header with better navigation -->
      <div class="main-header">
          <button @click="$emit('startNewSession')" class="home-button flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Home
          </button>
          
          <!-- Improved Progress Bar -->
          <div class="progress-container" v-if="sessionMode !== 'quick'">
              <div class="progress-bar-wrapper">
                  <div class="progress-bar-track"></div>
                  <div class="progress-bar-fill" :style="{ width: `${((currentStep - 1) / 4) * 100}%` }"></div>
                  <div class="progress-steps">
                      <div 
                          v-for="(step, index) in stepLabels" 
                          :key="index + 1" 
                          class="progress-step"
                          :class="{
                              'active': currentStep === index + 1,
                              'completed': currentStep > index + 1,
                              'future': currentStep < index + 1
                          }"
                      >
                          <div class="progress-step-circle">
                              <svg v-if="currentStep > index + 1" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                              </svg>
                              <span v-else class="text-xs font-semibold">{{ index + 1 }}</span>
                          </div>
                          <div class="progress-step-label">{{ step }}</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="container">
          <Step1Preparation
            v-if="currentStep === 1"
            :session-mode="sessionMode"
            :session-data="sessionData"
            @update:sessionData="val => $emit('update:sessionData', val)"
            @save-session-data="$emit('saveSessionData')"
            @go-to-step="$emit('goToStep', $event)"
          />

          <Step2SetupAssessment
            v-else-if="currentStep === 2"
            :session-data="sessionData"
            @update:sessionData="val => $emit('update:sessionData', val)"
            @save-session-data="$emit('saveSessionData')"
            @go-to-step="$emit('goToStep', $event)"
          />

          <Step3ProcessingSession
            v-else-if="currentStep === 3"
            :settings="settings"
            :session-mode="sessionMode"
            @update:settings="val => $emit('update:settings', val)"
            @save-settings="$emit('saveSettings')"
            @start-set="$emit('startSet')"
            @go-to-step="$emit('goToStep', $event)"
          />

          <Step4Checkin
            v-else-if="currentStep === 4"
            :session-data="sessionData"
            @update:sessionData="val => $emit('update:sessionData', val)"
            @save-session-data="$emit('saveSessionData')"
            @start-set="$emit('startSet')"
            @go-to-step="$emit('goToStep', $event)"
          />

          <Step5Closing
            v-else-if="currentStep === 5"
            :session-data="sessionData"
            @update:sessionData="val => $emit('update:sessionData', val)"
            @save-session-data="$emit('saveSessionData')"
            @save-history="$emit('saveHistory')"
            @start-new-session="$emit('startNewSession')"
            @update-view="$emit('updateView', $event)"
          />
      </div>
  </div>
</template>

<script>
import Step1Preparation from './Step1Preparation.vue';
import Step2SetupAssessment from './Step2SetupAssessment.vue';
import Step3ProcessingSession from './Step3ProcessingSession.vue';
import Step4Checkin from './Step4Checkin.vue';
import Step5Closing from './Step5Closing.vue';

export default {
  components: {
    Step1Preparation,
    Step2SetupAssessment,
    Step3ProcessingSession,
    Step4Checkin,
    Step5Closing,
  },
  props: ['sessionMode', 'currentStep', 'sessionData', 'settings'],
  emits: ['startNewSession', 'goToStep', 'saveSessionData', 'saveSettings', 'startSet', 'saveHistory', 'updateView', 'update:sessionData', 'update:settings'],
  computed: {
    stepLabels() {
      return ['Prepare', 'Assess', 'Process', 'Check-in', 'Close'];
    }
  }
};
</script>
