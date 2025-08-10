<template>
  <div>
      <h2 class="step-title">Setup & Assessment</h2>
      <div class="journal-section">
          <label>Emotions</label>
          <textarea :value="sessionData.emotions" @input="updateSessionData('emotions', $event.target.value)" placeholder="What emotions are you feeling right now? (e.g., anger, sadness, fear)"></textarea>
      </div>
      <div class="journal-section">
          <label>Body Sensations</label>
          <textarea :value="sessionData.bodySensations" @input="updateSessionData('bodySensations', $event.target.value)" placeholder="Where do you notice tension or discomfort in your body? (e.g., tight chest, clenched jaw)"></textarea>
      </div>
      <div class="journal-section">
          <label>Distress Level: {{ sessionData.distressLevel }}</label>
          <input type="range" min="0" max="10" :value="sessionData.distressLevel" @input="updateSessionData('distressLevel', parseInt($event.target.value))">
      </div>
      <div class="button-group">
          <button @click="$emit('goToStep', 1)" class="btn-secondary">Back</button>
          <button @click="$emit('goToStep', 3)">Continue</button>
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
