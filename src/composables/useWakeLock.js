import { ref, onUnmounted } from 'vue';

export function useWakeLock(showToast) {
  const wakeLock = ref(null);

  const acquireWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLock.value = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock acquired!');
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
        if (showToast) showToast(`Wake Lock failed: ${err.message}`);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock.value) {
      wakeLock.value.release();
      wakeLock.value = null;
      console.log('Screen Wake Lock released!');
    }
  };

  const handleVisibilityChange = () => {
    if (wakeLock.value !== null && document.visibilityState === 'visible') {
      acquireWakeLock();
    }
  };

  onUnmounted(() => {
    releaseWakeLock();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  return { acquireWakeLock, releaseWakeLock, handleVisibilityChange };
}