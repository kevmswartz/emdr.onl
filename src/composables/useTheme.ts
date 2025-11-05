import { ref, onMounted, onUnmounted } from 'vue'

export function useTheme() {
  const isDarkMode = ref(false)
  const prefersReducedMotion = ref(false)

  const updateTheme = () => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = darkModeQuery.matches

    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const updateReducedMotion = () => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = reducedMotionQuery.matches
  }

  let darkModeQuery: MediaQueryList | null = null
  let reducedMotionQuery: MediaQueryList | null = null

  onMounted(() => {
    // Initial check
    updateTheme()
    updateReducedMotion()

    // Listen for changes
    darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    darkModeQuery.addEventListener('change', updateTheme)
    reducedMotionQuery.addEventListener('change', updateReducedMotion)
  })

  onUnmounted(() => {
    darkModeQuery?.removeEventListener('change', updateTheme)
    reducedMotionQuery?.removeEventListener('change', updateReducedMotion)
  })

  return {
    isDarkMode,
    prefersReducedMotion
  }
}
