<template>
  <div>
      <h2 class="step-title">Session Complete</h2>
      <div class="journal-section">
          <label>Session Notes</label>
          <textarea :value="sessionData.sessionNotes" @input="updateSessionData('sessionNotes', $event.target.value)" placeholder="Any final insights or observations about this session?"></textarea>
      </div>
      <div class="button-group">
          <button @click="$emit('saveHistory')">Save Session</button>
          <button @click="$emit('startNewSession')" class="btn-secondary">New Session</button>
          <button @click="$emit('updateView', 'history')" class="btn-secondary">View History</button>
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
