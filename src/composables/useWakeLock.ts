import { ref, onUnmounted } from 'vue'

export function useWakeLock() {
  const wakeLock = ref<WakeLockSentinel | null>(null)

  const acquireWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.value = await navigator.wakeLock.request('screen')
        console.log('Wake lock acquired')
      } catch (err) {
        console.error('Wake lock error:', err)
      }
    }
  }

  const releaseWakeLock = () => {
    if (wakeLock.value) {
      wakeLock.value.release()
      wakeLock.value = null
      console.log('Wake lock released')
    }
  }

  onUnmounted(() => {
    releaseWakeLock()
  })

  return {
    acquireWakeLock,
    releaseWakeLock,
  }
}