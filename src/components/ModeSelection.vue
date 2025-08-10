<template>
  <div class="container" style="text-align: center; max-width: 500px;">
      <h1 style="color: var(--primary-color);">Guided EMDR</h1>
      <p style="margin-bottom: 30px;">Choose how you'd like to begin your session.</p>
      <div class="button-group">
          <button @click="$emit('startSession', 'guided')">Guided Session</button>
          <button @click="$emit('startSession', 'full-form')" class="btn-secondary">Full Form</button>
          <button @click="$emit('startSession', 'quick')" class="btn-secondary">Quick Start (BLS Only)</button>
      </div>
      <button @click="$emit('toggleTheme')" class="theme-toggle-main">{{ isDarkTheme ? 'Light' : 'Dark' }}</button>
  </div>
</template>

<script>
export default {
  props: ['isDarkTheme'],
};
</script>
