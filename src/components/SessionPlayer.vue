<template>
  <div id="session-view" ref="sessionView" class="session-container">
    <!-- Countdown Overlay -->
    <div v-if="isCountingDown" class="countdown-overlay">
      <div class="countdown-content">
        <div class="countdown-number">{{ countdown }}</div>
        <div class="countdown-text">Get ready...</div>
      </div>
    </div>
    
    <!-- Session Progress -->
    <div v-if="!isCountingDown" class="session-progress">
      <div class="progress-ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="4"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            stroke="#3b82f6"
            stroke-width="4"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="progressOffset"
            transform="rotate(-90 40 40)"
            class="progress-circle"
          />
        </svg>
        <div class="progress-text">
          <div class="time-remaining">{{ timeRemaining }}s</div>
        </div>
      </div>
    </div>

    <!-- Main Canvas -->
    <canvas 
      ref="sessionCanvas" 
      @click="handleTap"
      :class="{ 'tap-ready': showTapPrompt }"
    ></canvas>
    
    <!-- Tap Prompt Overlay -->
    <div v-if="showTapPrompt" class="tap-prompt">
      <div class="tap-circle" :class="{ 'pulse': showTapPrompt }">
        TAP
      </div>
    </div>

    <!-- Session Controls -->
    <div class="session-controls" v-if="!isCountingDown">
      <button @click="togglePause" class="control-btn">
        <svg v-if="!isPaused" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <button @click="$emit('stopSet')" class="control-btn stop-btn">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';

export default {
  props: ['settings', 'playSound', 'isSessionRunning', 'cycleDuration'],
  emits: ['stopSet'],
  setup(props, { emit }) {
    const sessionView = ref(null);
    const sessionCanvas = ref(null);
    const animationFrameId = ref(null);
    const isCountingDown = ref(false);
    const countdown = ref(3);
    const isPaused = ref(false);
    const showTapPrompt = ref(false);
    
    // Session timing
    const sessionStartTime = ref(null);
    const sessionDuration = ref(0);
    const elapsedTime = ref(0);
    
    // Dot movement state
    const dotPosition = ref(0); // 0 = left, 1 = right
    const isMoving = ref(false);
    const movementStartTime = ref(null);
    const movementDirection = ref(1); // 1 = left to right, -1 = right to left
    const targetPosition = ref(1);
    
    // Speed adaptation
    const initialSpeed = ref(0);
    const currentSpeed = ref(0);
    
    // Computed properties
    const timeRemaining = computed(() => {
      return Math.max(0, Math.ceil((sessionDuration.value - elapsedTime.value) / 1000));
    });
    
    const circumference = 2 * Math.PI * 35;
    const progressOffset = computed(() => {
      const progress = sessionDuration.value > 0 ? elapsedTime.value / sessionDuration.value : 0;
      return circumference * (1 - progress);
    });

    // Haptic feedback function
    const triggerHaptic = (intensity = 0.5) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // Short vibration
      }
      
      // For devices with haptic feedback API
      if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS haptic feedback
        if ('taptic' in window) {
          window.taptic.impact({ style: 'medium' });
        }
      }
    };

    // Calculate movement duration based on speed (therapeutic timing)
    const getMovementDuration = () => {
      // Speed 1 = 2000ms (0.5 Hz), Speed 10 = 500ms (2 Hz) 
      // Gradually slow down over session
      const sessionProgress = sessionDuration.value > 0 ? elapsedTime.value / sessionDuration.value : 0;
      const speedReduction = sessionProgress * 0.2; // 20% slowdown over session
      const effectiveSpeed = Math.max(1, currentSpeed.value * (1 - speedReduction));
      return 2500 - (effectiveSpeed * 200); // 2300ms to 500ms range
    };

    // Start dot movement to target
    const startMovement = (target) => {
      if (isPaused.value) return;
      
      isMoving.value = true;
      movementStartTime.value = performance.now();
      targetPosition.value = target;
      movementDirection.value = target > dotPosition.value ? 1 : -1;
      showTapPrompt.value = false;
    };

    // Handle user tap
    const handleTap = () => {
      if (!showTapPrompt.value || isPaused.value) return;
      
      // Haptic feedback
      triggerHaptic();
      
      // Audio cue
      const panValue = targetPosition.value === 1 ? 1 : -1;
      props.playSound(panValue);
      
      // Start movement to opposite side
      const newTarget = targetPosition.value === 1 ? 0 : 1;
      startMovement(newTarget);
    };

    // Animation loop
    const animate = (currentTime) => {
      if (!props.isSessionRunning || isPaused.value) {
        return;
      }

      if (!sessionStartTime.value) {
        sessionStartTime.value = currentTime;
        sessionDuration.value = props.settings.duration * 1000;
      }

      elapsedTime.value = currentTime - sessionStartTime.value;

      // Check if session is complete
      if (elapsedTime.value >= sessionDuration.value) {
        emit('stopSet');
        return;
      }

      const canvas = sessionCanvas.value;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (props.settings.visuals) {
        // Calculate dot position
        let currentDotPosition = dotPosition.value;
        
        if (isMoving.value && movementStartTime.value) {
          const movementElapsed = currentTime - movementStartTime.value;
          const movementDuration = getMovementDuration();
          const progress = Math.min(movementElapsed / movementDuration, 1);
          
          // Smooth easing function
          const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const easedProgress = easeInOutQuad(progress);
          
          currentDotPosition = dotPosition.value + (targetPosition.value - dotPosition.value) * easedProgress;
          
          // Movement complete
          if (progress >= 1) {
            dotPosition.value = targetPosition.value;
            isMoving.value = false;
            
            // Show tap prompt after brief delay
            setTimeout(() => {
              if (props.isSessionRunning && !isPaused.value) {
                showTapPrompt.value = true;
                triggerHaptic(0.3); // Gentle haptic cue
              }
            }, 200);
          }
        }

        // Draw the dot
        const x = currentDotPosition * (canvas.width - 100) + 50; // 50px margin
        const y = canvas.height / 2;
        const radius = props.settings.dotSize / 2;
        
        // Dot color and gradient
        const gradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
        gradient.addColorStop(0, props.settings.dotColor);
        gradient.addColorStop(0.7, props.settings.dotColor);
        gradient.addColorStop(1, 'transparent');
        
        // Draw main dot
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw subtle glow if tap is ready
        if (showTapPrompt.value) {
          ctx.shadowColor = props.settings.dotColor;
          ctx.shadowBlur = 20;
          ctx.fillStyle = props.settings.dotColor;
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.7, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId.value = requestAnimationFrame(animate);
    };

    // Start countdown
    const startCountdown = () => {
      isCountingDown.value = true;
      countdown.value = 3;
      
      const interval = setInterval(() => {
        countdown.value -= 1;
        triggerHaptic(0.7);
        
        if (countdown.value === 0) {
          clearInterval(interval);
          isCountingDown.value = false;
          
          // Initialize session
          sessionStartTime.value = null;
          dotPosition.value = 0.5; // Start in center
          currentSpeed.value = props.settings.speed;
          initialSpeed.value = props.settings.speed;
          
          // Start first movement after brief pause
          setTimeout(() => {
            startMovement(1); // Move to right first
          }, 500);
          
          animationFrameId.value = requestAnimationFrame(animate);
        }
      }, 1000);
    };

    // Toggle pause
    const togglePause = () => {
      isPaused.value = !isPaused.value;
      
      if (!isPaused.value && props.isSessionRunning) {
        // Resume animation
        animationFrameId.value = requestAnimationFrame(animate);
      } else {
        // Cancel animation
        if (animationFrameId.value) {
          cancelAnimationFrame(animationFrameId.value);
        }
      }
    };

    // Watchers
    watch(() => props.isSessionRunning, (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (sessionView.value?.requestFullscreen) {
            sessionView.value.requestFullscreen().catch(err => console.warn('Fullscreen failed:', err));
          }
          startCountdown();
        });
      } else {
        if (animationFrameId.value) {
          cancelAnimationFrame(animationFrameId.value);
        }
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.warn('Exit fullscreen failed:', err));
        }
        
        // Reset state
        isCountingDown.value = false;
        isPaused.value = false;
        showTapPrompt.value = false;
        elapsedTime.value = 0;
        sessionStartTime.value = null;
      }
    });

    onUnmounted(() => {
      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value);
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    });

    return {
      sessionView,
      sessionCanvas,
      isCountingDown,
      countdown,
      isPaused,
      showTapPrompt,
      timeRemaining,
      circumference,
      progressOffset,
      handleTap,
      togglePause,
    };
  },
};
</script>

<style scoped>
.session-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
}

canvas.tap-ready {
  filter: brightness(1.1);
}

.countdown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.countdown-content {
  text-align: center;
  color: white;
}

.countdown-number {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
  animation: countdownPulse 1s ease-in-out;
}

.countdown-text {
  font-size: 1.5rem;
  opacity: 0.8;
  font-weight: 300;
}

@keyframes countdownPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.session-progress {
  position: absolute;
  top: 40px;
  right: 40px;
  z-index: 5;
}

.progress-ring {
  position: relative;
  width: 80px;
  height: 80px;
}

.progress-circle {
  transition: stroke-dashoffset 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.time-remaining {
  font-size: 1.2rem;
  font-weight: 600;
}

.tap-prompt {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 5;
}

.tap-circle {
  width: 100px;
  height: 100px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.tap-circle.pulse {
  animation: tapPulse 1.5s ease-in-out infinite;
}

@keyframes tapPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.session-controls {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 5;
}

.control-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.stop-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

@media (max-width: 640px) {
  .session-progress {
    top: 20px;
    right: 20px;
    transform: scale(0.8);
  }
  
  .session-controls {
    bottom: 20px;
  }
  
  .control-btn {
    width: 50px;
    height: 50px;
  }
  
  .countdown-number {
    font-size: 6rem;
  }
}
</style>