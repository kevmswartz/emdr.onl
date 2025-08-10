<template>
  <div class="container">
      <h2 class="step-title">Session History</h2>
      <div v-if="!history.length"><p style="text-align: center;">No sessions saved yet.</p></div>
      <div v-for="session in history" :key="session.timestamp" class="history-entry">
          <p><strong>Target:</strong> {{ session.targetMemory }}</p>
          <p><strong>Initial Distress:</strong> {{ session.distressLevel }}</p>
          <p><strong>Final Distress:</strong> {{ session.currentDistress }}</p>
      </div>
      <div class="button-group">
          <button @click="$emit('updateView', 'main', 5)">Back</button>
      </div>
  </div>
</template>

<script>
export default {
  props: ['history'],
};
</script>
