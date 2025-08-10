import { ref, onUnmounted } from 'vue';

export function useAudio(volume, soundType, showToast) {
  const audioContext = ref(null);
  const gainNode = ref(null);

  const initAudio = () => {
    if (!audioContext.value) {
      try {
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
        gainNode.value = audioContext.value.createGain();
        gainNode.value.connect(audioContext.value.destination);
      } catch (e) {
        console.error('Web Audio API is not supported.', e);
        if (showToast) showToast('Audio not supported or failed to initialize.');
      }
    }
    if (audioContext.value && audioContext.value.state === 'suspended') {
      audioContext.value.resume();
    }
    if (gainNode.value) {
      gainNode.value.gain.setValueAtTime(volume.value, audioContext.value.currentTime);
    }
  };

  const playSound = (panValue) => {
    if (!audioContext.value || !volume.value) return;
    const oscillator = audioContext.value.createOscillator();
    const panner = audioContext.value.createStereoPanner();
    oscillator.type = soundType.value;
    oscillator.frequency.setValueAtTime(220, audioContext.value.currentTime);
    panner.pan.setValueAtTime(panValue, audioContext.value.currentTime);
    oscillator.connect(panner).connect(gainNode.value);
    oscillator.start();
    oscillator.stop(audioContext.value.currentTime + 0.15);
  };

  onUnmounted(() => {
    if (audioContext.value) {
      audioContext.value.close();
    }
  });

  return { initAudio, playSound };
}