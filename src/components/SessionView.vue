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
import { ref, computed, onMounted, onUnmounted, watch, toRefs } from 'vue'
import type { Settings } from '../types'
import { useAudio } from '../composables/useAudio'
import { useWakeLock } from '../composables/useWakeLock'

const props = defineProps<{
  settings: Settings
}>()

const emit = defineEmits<{
  endSession: []
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

// Dot position (0 = left, 1 = right)
const dotPosition = ref(0.5)
const targetPosition = ref(1)
const movementStartTime = ref(0)
const isMoving = ref(false)

// Audio & Wake Lock
const { initAudio, playSound } = useAudio(
  computed(() => settings.value.volume),
  computed(() => settings.value.frequency)
)
const { acquireWakeLock, releaseWakeLock } = useWakeLock()

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

// Start movement to target
const startMovement = (target: number) => {
  targetPosition.value = target
  isMoving.value = true
  movementStartTime.value = performance.now()

  // Play audio at target side
  const panValue = target === 1 ? 1 : -1
  if (settings.value.audioEnabled) {
    playSound(panValue)
  }
}

// Animation loop
const animate = (currentTime: number) => {
  if (isPaused.value) return

  if (!startTime.value) {
    startTime.value = currentTime
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

  // Calculate dot position
  let currentDotPosition = dotPosition.value

  if (isMoving.value) {
    const movementElapsed = currentTime - movementStartTime.value
    const movementDuration = getMovementDuration()
    const progress = Math.min(movementElapsed / movementDuration, 1)

    // Ease in-out quad
    const easeInOutQuad = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

    const easedProgress = easeInOutQuad(progress)
    currentDotPosition = dotPosition.value + (targetPosition.value - dotPosition.value) * easedProgress

    // Movement complete
    if (progress >= 1) {
      dotPosition.value = targetPosition.value
      isMoving.value = false

      // Start movement to opposite side after brief pause
      setTimeout(() => {
        if (!isPaused.value) {
          const newTarget = targetPosition.value === 1 ? 0 : 1
          startMovement(newTarget)
        }
      }, 200)
    }
  }

  // Draw dot
  const margin = 50
  const x = currentDotPosition * (canvas.width - margin * 2) + margin
  const y = canvas.height / 2
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
    if (countdown.value === 0) {
      clearInterval(interval)
      isCountdown.value = false

      // Initialize audio
      initAudio()

      // Start session
      setTimeout(() => {
        startMovement(1) // Move to right first
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
    if (isMoving.value) {
      movementStartTime.value += pauseDuration
    }
    animationFrameId.value = requestAnimationFrame(animate)
  } else {
    // Pause
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
    }
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