<template>
  <div
    ref="containerRef"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center"
    :style="{ backgroundColor: settings.backgroundColor }"
  >
    <!-- Countdown -->
    <div
      v-if="isCountdown"
      class="text-white text-8xl font-bold animate-pulse"
    >
      {{ countdown }}
    </div>

    <!-- Session Active -->
    <template v-else>
      <!-- Timer Display -->
      <div class="absolute top-8 right-8">
        <div class="relative w-20 h-20">
          <!-- Progress Circle -->
          <svg class="w-full h-full -rotate-90">
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
            <span class="text-white text-lg font-semibold">{{ timeRemaining }}</span>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <canvas
        ref="canvasRef"
        class="absolute inset-0 w-full h-full"
      />

      <!-- Controls -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          @click="togglePause"
          class="touch-target w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
        >
          <span v-if="isPaused" class="text-2xl">▶</span>
          <span v-else class="text-2xl">⏸</span>
        </button>
        <button
          @click="stopSession"
          class="touch-target w-14 h-14 bg-red-500/80 hover:bg-red-500 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
        >
          <span class="text-2xl">■</span>
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
  x: (Math.random() - 0.5) * 0.003,
  y: (Math.random() - 0.5) * 0.003
})

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
useKeyboardShortcuts({
  onSpace: () => !isCountdown.value && togglePause(),
  onEscape: () => !isCountdown.value && stopSession(),
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
})

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

  // Check if session complete
  if (elapsedTime.value >= settings.value.duration * 1000) {
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
    const speed = settings.value.speed * 0.0005 // Speed multiplier
    bouncePosition.value.x += bounceVelocity.value.x * speed * 60
    bouncePosition.value.y += bounceVelocity.value.y * speed * 60

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

  // Check if movement cycle complete (skip for bounce pattern)
  if (movementProgress.value >= 1 && settings.value.pattern !== 'bounce') {
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
  const interval = setInterval(() => {
    countdown.value--
    if (settings.value.hapticFeedback) {
      vibrate(50)
    }
    if (countdown.value === 0) {
      clearInterval(interval)
      isCountdown.value = false

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
    emit('showToast', 'Resumed')
  } else {
    // Pause
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
    }
    emit('showToast', 'Paused')
  }
}

const stopSession = () => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  releaseWakeLock()
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
  emit('endSession')
}

const adjustSpeed = (delta: number) => {
  if (!settings.value.keyboardShortcuts) return
  settings.value.speed = Math.max(1, Math.min(10, settings.value.speed + delta))
  emit('showToast', `Speed: ${settings.value.speed}`)
}

const adjustVolume = (delta: number) => {
  if (!settings.value.keyboardShortcuts) return
  settings.value.volume = Math.max(0, Math.min(1, settings.value.volume + delta))
  emit('showToast', `Volume: ${Math.round(settings.value.volume * 100)}%`)
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (!settings.value.keyboardShortcuts || isCountdown.value) return

  switch (e.key) {
    case ' ':
      e.preventDefault()
      togglePause()
      break
    case 'Escape':
      e.preventDefault()
      stopSession()
      break
    case '+':
    case '=':
      e.preventDefault()
      adjustSpeed(1)
      break
    case '-':
    case '_':
      e.preventDefault()
      adjustSpeed(-1)
      break
    case '[':
      e.preventDefault()
      adjustVolume(-0.1)
      break
    case ']':
      e.preventDefault()
      adjustVolume(0.1)
      break
  }
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

  // Add keyboard listener
  window.addEventListener('keydown', handleKeydown)

  // Start countdown
  startCountdown()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
  releaseWakeLock()
  window.removeEventListener('keydown', handleKeydown)
})
</script>