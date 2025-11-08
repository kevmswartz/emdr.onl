import { ref, onUnmounted } from 'vue'

export function useWakeLock() {
  const wakeLock = ref<WakeLockSentinel | null>(null)
  const error = ref<string | null>(null)
  const isSupported = ref('wakeLock' in navigator)

  const acquireWakeLock = async () => {
    error.value = null

    if (!isSupported.value) {
      error.value = 'Wake lock not supported on this device. Screen may sleep during session.'
      return false
    }

    try {
      wakeLock.value = await navigator.wakeLock.request('screen')
      console.log('Wake lock acquired')
      return true
    } catch (err) {
      const message = 'Could not keep screen awake. Your device may sleep during the session.'
      console.error('Wake lock error:', err)
      error.value = message
      return false
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
    error,
    isSupported,
  }
}