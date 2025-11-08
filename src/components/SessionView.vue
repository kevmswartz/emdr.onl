<template>
  <div
    ref="containerRef"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center"
    :style="{ backgroundColor: settings.backgroundColor }"
    role="application"
    aria-label="EMDR bilateral stimulation session"
  >
    <!-- Screen Reader Announcements -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ srAnnouncement }}
    </div>

    <!-- Timer Updates (throttled) -->
    <div
      role="timer"
      aria-live="off"
      aria-atomic="true"
      class="sr-only"
    >
      {{ srTimerUpdate }}
    </div>

    <!-- Countdown -->
    <div
      v-if="isCountdown"
      class="text-white text-8xl font-bold animate-pulse"
      aria-label="Session starting countdown"
    >
      {{ countdown }}
    </div>

    <!-- Session Active -->
    <template v-else>
      <!-- Timer Display -->
      <div
        class="absolute top-8 right-8"
        aria-label="Session timer"
      >
        <div class="relative w-20 h-20">
          <!-- Progress Circle -->
          <svg
            class="w-full h-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="rgba(255,255,255,0.2)"
              stroke-width="4"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="white"
              stroke-width="4"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
            />
          </svg>
          <!-- Time Text -->
          <div class="absolute inset-0 flex items-center justify-center">
            <span
              class="text-white text-lg font-semibold"
              aria-label="`Time remaining: ${timeRemaining}`"
            >
              {{ timeRemaining }}
            </span>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <canvas
        ref="canvasRef"
        class="absolute inset-0 w-full h-full will-change-contents"
        :aria-label="`Bilateral stimulation animation showing ${settings.pattern} movement pattern`"
        role="img"
      />

      <!-- Controls -->
      <div
        class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4"
        role="group"
        aria-label="Session controls"
      >
        <button
          @click="togglePause"
          class="touch-target w-14 h-14 bg-white/20 hover:bg-white/30 focus:ring-4 focus:ring-white/50 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
          :aria-label="isPaused ? 'Resume session' : 'Pause session'"
          :aria-pressed="isPaused"
        >
          <span v-if="isPaused" class="text-2xl" aria-hidden="true">▶</span>
          <span v-else class="text-2xl" aria-hidden="true">⏸</span>
        </button>
        <button
          @click="stopSession"
          class="touch-target w-14 h-14 bg-red-500/80 hover:bg-red-500 focus:ring-4 focus:ring-red-300 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Stop session and return home"
        >
          <span class="text-2xl" aria-hidden="true">■</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, toRefs } from 'vue'
import type { Settings } from '../types'
import { useAudio } from '../composables/useAudio'
import { useWakeLock } from '../composables/useWakeLock'
import { useMovementPattern } from '../composables/useMovementPattern'
import { useHaptics } from '../composables/useHaptics'
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts'

const props = defineProps<{
  settings: Settings
}>()

const emit = defineEmits<{
  endSession: []
  showToast: [message: string]
}>()

const { settings } = toRefs(props)
const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Session state
const isCountdown = ref(true)
const countdown = ref(3)
const isPaused = ref(false)
const elapsedTime = ref(0)
const startTime = ref(0)
const animationFrameId = ref<number | null>(null)

// Movement state
const movementProgress = ref(0)
const movementStartTime = ref(0)
const movementDirection = ref(1) // 1 or -1

// Bounce pattern state
const bouncePosition = ref({ x: 0.5, y: 0.5 })
const bounceVelocity = ref({
  x: (Math.random() - 0.5) * 2,
  y: (Math.random() - 0.5) * 2
})

// Screen reader announcements
const srAnnouncement = ref('')
const srTimerUpdate = ref('')
let lastTimerAnnouncement = 0

// Composables
const { initAudio, playSound } = useAudio(
  computed(() => settings.value.volume),
  computed(() => settings.value.frequency),
  computed(() => settings.value.soundType)
)
const { acquireWakeLock, releaseWakeLock } = useWakeLock()
const { calculatePosition, getPanValue } = useMovementPattern()
const { vibrate } = useHaptics()

// Keyboard shortcuts
const shortcutsEnabled = computed(() => settings.value.keyboardShortcuts && !isCountdown.value)

useKeyboardShortcuts(
  {
    onSpace: () => {
      if (!isCountdown.value) {
        togglePause()
      }
    },
    onEscape: () => {
      if (!isCountdown.value) {
        stopSession()
      }
    },
    onPlusOrEqual: () => {
      if (!isCountdown.value && settings.value.speed < 10) {
        settings.value.speed++
        emit('showToast', `Speed: ${settings.value.speed}`)
      }
    },
    onMinus: () => {
      if (!isCountdown.value && settings.value.speed > 1) {
        settings.value.speed--
        emit('showToast', `Speed: ${settings.value.speed}`)
      }
    },
    onBracketLeft: () => {
      if (!isCountdown.value && settings.value.volume > 0) {
        settings.value.volume = Math.max(0, settings.value.volume - 0.1)
        emit('showToast', `Volume: ${Math.round(settings.value.volume * 100)}%`)
      }
    },
    onBracketRight: () => {
      if (!isCountdown.value && settings.value.volume < 1) {
        settings.value.volume = Math.min(1, settings.value.volume + 0.1)
        emit('showToast', `Volume: ${Math.round(settings.value.volume * 100)}%`)
      }
    }
  },
  { enabled: shortcutsEnabled }
)

// Timer calculations
const timeRemaining = computed(() => {
  return Math.max(0, Math.ceil((settings.value.duration * 1000 - elapsedTime.value) / 1000))
})

const circumference = 2 * Math.PI * 36
const progressOffset = computed(() => {
  const progress = elapsedTime.value / (settings.value.duration * 1000)
  return circumference * (1 - progress)
})

// Movement duration based on speed
const getMovementDuration = () => {
  // Speed 1 = 2300ms, Speed 10 = 500ms
  return 2500 - (settings.value.speed * 200)
}

// Animation loop
const animate = (currentTime: number) => {
  if (isPaused.value) return

  if (!startTime.value) {
    startTime.value = currentTime
    movementStartTime.value = currentTime
  }

  elapsedTime.value = currentTime - startTime.value

  // Announce time remaining every 30 seconds (throttled for screen readers)
  const secondsRemaining = timeRemaining.value
  if (secondsRemaining > 0 && secondsRemaining % 30 === 0 && secondsRemaining !== lastTimerAnnouncement) {
    srTimerUpdate.value = `${secondsRemaining} seconds remaining`
    lastTimerAnnouncement = secondsRemaining
  }

  // Check if session complete
  if (elapsedTime.value >= settings.value.duration * 1000) {
    srAnnouncement.value = 'Session complete'
    stopSession()
    return
  }

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Calculate movement progress
  const movementElapsed = currentTime - movementStartTime.value
  const movementDuration = getMovementDuration()
  movementProgress.value = Math.min(movementElapsed / movementDuration, 1)

  // Ease in-out quad
  const easeInOutQuad = (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

  const easedProgress = easeInOutQuad(movementProgress.value)

  // Get position from pattern
  let position
  if (settings.value.pattern === 'bounce') {
    // Update bounce position with physics
    const speed = settings.value.speed * 0.01 // Speed multiplier (increased 10x)
    bouncePosition.value.x += bounceVelocity.value.x * speed
    bouncePosition.value.y += bounceVelocity.value.y * speed

    // Bounce off edges
    const margin = 0.05 // Keep away from edges
    if (bouncePosition.value.x <= margin || bouncePosition.value.x >= 1 - margin) {
      bounceVelocity.value.x *= -1
      bouncePosition.value.x = Math.max(margin, Math.min(1 - margin, bouncePosition.value.x))
      // Play sound on bounce
      if (settings.value.audioEnabled) {
        playSound((bouncePosition.value.x - 0.5) * 2)
      }
      if (settings.value.hapticFeedback) {
        vibrate(20)
      }
    }
    if (bouncePosition.value.y <= margin || bouncePosition.value.y >= 1 - margin) {
      bounceVelocity.value.y *= -1
      bouncePosition.value.y = Math.max(margin, Math.min(1 - margin, bouncePosition.value.y))
    }

    position = bouncePosition.value
  } else {
    position = calculatePosition(settings.value.pattern, easedProgress, movementDirection.value)
  }

  // Check if movement cycle complete (skip for bounce and circular patterns)
  if (movementProgress.value >= 1 && settings.value.pattern !== 'bounce' && settings.value.pattern !== 'circular') {
    // Play audio and haptic at end of movement
    const panValue = getPanValue(settings.value.pattern, position)
    if (settings.value.audioEnabled) {
      playSound(panValue)
    }
    if (settings.value.hapticFeedback) {
      vibrate(30)
    }

    // Reverse direction and restart
    movementDirection.value *= -1
    movementStartTime.value = currentTime
    movementProgress.value = 0
  }

  // For circular pattern, just restart the cycle without reversing
  if (movementProgress.value >= 1 && settings.value.pattern === 'circular') {
    // Play audio and haptic at end of movement
    const panValue = getPanValue(settings.value.pattern, position)
    if (settings.value.audioEnabled) {
      playSound(panValue)
    }
    if (settings.value.hapticFeedback) {
      vibrate(30)
    }

    // Restart without reversing
    movementStartTime.value = currentTime
    movementProgress.value = 0
  }

  // Draw dot
  const margin = 80
  const x = position.x * (canvas.width - margin * 2) + margin
  const y = position.y * (canvas.height - margin * 2) + margin
  const radius = settings.value.dotSize / 2

  // Gradient
  const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius)
  gradient.addColorStop(0, settings.value.dotColor)
  gradient.addColorStop(0.7, settings.value.dotColor)
  gradient.addColorStop(1, 'transparent')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()

  animationFrameId.value = requestAnimationFrame(animate)
}

// Start countdown
const startCountdown = () => {
  srAnnouncement.value = 'Session starting in 3 seconds'

  const interval = setInterval(() => {
    countdown.value--
    if (settings.value.hapticFeedback) {
      vibrate(50)
    }
    if (countdown.value > 0) {
      srAnnouncement.value = `Starting in ${countdown.value}`
    }
    if (countdown.value === 0) {
      clearInterval(interval)
      isCountdown.value = false
      srAnnouncement.value = `Session started. ${settings.value.pattern} pattern for ${settings.value.duration} seconds.`

      // Initialize audio
      initAudio()

      // Start animation
      setTimeout(() => {
        animationFrameId.value = requestAnimationFrame(animate)
      }, 300)
    }
  }, 1000)
}

const togglePause = () => {
  isPaused.value = !isPaused.value

  if (!isPaused.value) {
    // Resume
    const pauseDuration = performance.now() - (startTime.value + elapsedTime.value)
    startTime.value += pauseDuration
    movementStartTime.value += pauseDuration
    animationFrameId.value = requestAnimationFrame(animate)
    srAnnouncement.value = 'Session resumed'
    emit('showToast', 'Resumed')
  } else {
    // Pause
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
    }
    srAnnouncement.value = `Session paused. ${timeRemaining.value} seconds remaining.`
    emit('showToast', 'Paused')
  }
}

const stopSession = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  srAnnouncement.value = 'Session ended'
  releaseWakeLock()
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  emit('endSession')
}

onMounted(() => {
  // Request fullscreen
  if (containerRef.value?.requestFullscreen) {
    containerRef.value.requestFullscreen().catch((err) => {
      console.warn('Fullscreen failed:', err)
    })
  }

  // Acquire wake lock
  acquireWakeLock()

  // Start countdown
  startCountdown()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  releaseWakeLock()
})
</script>
