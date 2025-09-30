export function useHaptics() {
  const vibrate = (duration: number = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }

  const vibratePattern = (pattern: number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return {
    vibrate,
    vibratePattern,
  }
}