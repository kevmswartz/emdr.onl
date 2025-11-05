<template>
  <Transition name="toast">
    <div
      v-if="visible"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  duration?: number
}>()

const visible = ref(false)
let timeout: number

watch(
  () => props.message,
  (newMessage) => {
    if (newMessage) {
      visible.value = true
      clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        visible.value = false
      }, props.duration || 3000)
    }
  }
)
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>