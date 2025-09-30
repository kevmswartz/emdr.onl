import { ref, onUnmounted, type Ref } from 'vue'

export function useAudio(volume: Ref<number>, frequency: Ref<number>) {
  const audioContext = ref<AudioContext | null>(null)
  const gainNode = ref<GainNode | null>(null)

  const initAudio = () => {
    if (!audioContext.value) {
      try {
        audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
        gainNode.value = audioContext.value.createGain()
        gainNode.value.connect(audioContext.value.destination)
      } catch (e) {
        console.error('Web Audio API not supported:', e)
        return false
      }
    }

    // Resume context if suspended (browser autoplay policy)
    if (audioContext.value.state === 'suspended') {
      audioContext.value.resume()
    }

    // Update volume
    if (gainNode.value) {
      gainNode.value.gain.setValueAtTime(volume.value, audioContext.value.currentTime)
    }

    return true
  }

  const playSound = (panValue: number) => {
    if (!audioContext.value || !gainNode.value || volume.value === 0) return

    const oscillator = audioContext.value.createOscillator()
    const panner = audioContext.value.createStereoPanner()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency.value, audioContext.value.currentTime)

    panner.pan.setValueAtTime(panValue, audioContext.value.currentTime)

    oscillator.connect(panner)
    panner.connect(gainNode.value)

    oscillator.start()
    oscillator.stop(audioContext.value.currentTime + 0.15)
  }

  onUnmounted(() => {
    if (audioContext.value) {
      audioContext.value.close()
    }
  })

  return {
    initAudio,
    playSound,
  }
}