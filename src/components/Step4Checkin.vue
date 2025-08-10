<template>
  <div>
      <h2 class="step-title">Check-in</h2>
      <div class="journal-section">
          <label>What came up?</label>
          <textarea :value="sessionData.whatCameUp" @input="updateSessionData('whatCameUp', $event.target.value)" placeholder="Describe any thoughts, feelings, sensations, or images that came to mind."></textarea>
      </div>
      <div class="journal-section">
          <label>Current Distress: {{ sessionData.currentDistress }}</label>
          <input type="range" min="0" max="10" :value="sessionData.currentDistress" @input="updateSessionData('currentDistress', parseInt($event.target.value))">
      </div>
      <div class="button-group">
          <button @click="$emit('startSet')" class="btn-secondary">Do Another Set</button>
          <button @click="$emit('goToStep', 5)">Finish Session</button>
      </div>
  </div>
</template>

<script>
export default {
  props: ['sessionData'],
  methods: {
    updateSessionData(key, value) {
      this.$emit('update:sessionData', { ...this.sessionData, [key]: value });
      this.$emit('saveSessionData');
    },
  },
};
</script>
