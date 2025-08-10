<template>
  <div v-if="toastMessage" class="toast show">{{ toastMessage }}</div>

  <ModeSelection 
    v-if="currentView === 'mode-selection'"
    :is-dark-theme="isDarkTheme"
    @start-session="startSession"
    @toggle-theme="toggleTheme"
  />

  <MainContent
    v-else-if="currentView === 'main'"
    :session-mode="sessionMode"
    :current-step="currentStep"
    v-model:session-data="sessionData"
    v-model:settings="settings"
    @start-new-session="startNewSession"
    @go-to-step="goToStep"
    @save-session-data="saveSessionData"
    @save-settings="saveSettings"
    @start-set="startSet"
    @save-history="saveHistory"
    @update-view="updateView"
  />

  <SessionPlayer
    v-if="isSessionRunning"
    :settings="settings"
    :is-session-running="isSessionRunning"
    @save-settings="saveSettings"
    @stop-set="stopSet"
    :play-sound="playSound"
    :cycle-duration="cycleDuration"
  />

  <History
    v-else-if="currentView === 'history'"
    :history="history"
    @update-view="updateView"
  />
</template>

<script>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import ModeSelection from './components/ModeSelection.vue';
import MainContent from './components/MainContent.vue';
import SessionPlayer from './components/SessionPlayer.vue';
import History from './components/History.vue';
import { useAudio } from './composables/useAudio.js';
import { useWakeLock } from './composables/useWakeLock.js';

export default {
  components: {
    ModeSelection,
    MainContent,
    SessionPlayer,
    History,
  },
  setup() {
    // Reactive state
    const currentView = ref('mode-selection');
    const sessionMode = ref('guided'); // 'guided', 'full-form', or 'quick'
    const currentStep = ref(1);
    const isSessionRunning = ref(false);
    const isDarkTheme = ref(false);
    const toastMessage = ref('');

    const settings = ref({
      // Basic settings
      speed: 5, 
      duration: 30, 
      dotSize: 60, 
      volume: 0.5,
      soundType: 'sine', 
      dotColor: '#28a745', 
      visuals: true, 
      audio: true,
      
      // Interaction modes
      interactionMode: 'tap', // 'tap', 'automatic', 'watch'
      hapticFeedback: true,
      autoSlowdown: true,
      tapPrompts: true,
      
      // Advanced options
      movementPattern: 'smooth', // 'smooth', 'linear', 'ease'
      pauseBetweenSides: 200, // milliseconds
      sessionEndMode: 'gradual' // 'gradual', 'immediate'
    });
    const sessionData = ref({});
    const history = ref([]);

    // Methods - UI Helpers
    const showToast = (message) => {
      toastMessage.value = message;
      setTimeout(() => toastMessage.value = '', 3000);
    };

    // Composables
    const { initAudio, playSound } = useAudio(computed(() => settings.value.volume), computed(() => settings.value.soundType), showToast);
    const { acquireWakeLock, releaseWakeLock, handleVisibilityChange } = useWakeLock(showToast);

    // Computed properties
    const cycleDuration = computed(() => 4500 - (settings.value.speed * 250));

    // Lifecycle & Setup
    const loadSettings = () => {
      const storedSettings = localStorage.getItem('emdr-settings');
      if (storedSettings) settings.value = { ...settings.value, ...JSON.parse(storedSettings) };
    };

    const resetSessionData = () => {
      sessionData.value = {
        safePlace: '', targetMemory: '', negativeThought: '', emotions: '',
        bodySensations: '', distressLevel: 5, whatCameUp: '', currentDistress: 5,
        sessionNotes: '', safePlaceReturn: ''
      };
    };

    const loadHistory = () => {
      const storedHistory = localStorage.getItem('emdr-session-history');
      if (storedHistory) history.value = JSON.parse(storedHistory);
    };

    const applyTheme = (theme) => {
      isDarkTheme.value = theme === 'dark';
      document.body.classList.toggle('dark-mode', isDarkTheme.value);
    };

    const handlePopState = (event) => {
      isSessionRunning.value = false;
      if (event.state) {
        renderView(event.state.view, event.state.step);
      } else {
        renderView('mode-selection', null);
      }
    };

    // Watchers
    watch(isSessionRunning, (isRunning) => {
      console.log('App.vue: isSessionRunning changed to', isRunning);
      if (isRunning) {
        updateView('session');
        initAudio();
        acquireWakeLock();
      } else {
        releaseWakeLock();
        if (document.fullscreenElement) document.exitFullscreen();
        if (currentView.value === 'session') {
          const nextStep = sessionMode.value === 'quick' ? 3 : 4;
          updateView('main', nextStep);
        }
      }
    });

    // Methods - View & History
    const updateView = (view, step = null) => {
      const state = { view, step };
      const hash = `#${view}` + (step ? `/${step}` : '');
      if (window.location.hash !== hash) {
           window.history.pushState(state, '', hash);
      }
      renderView(view, step);
    };

    const renderView = (view, step) => {
      currentView.value = view;
      if (step !== null) currentStep.value = step;
      window.scrollTo(0, 0);
    };

    // Methods - Session Flow
    const startSession = (mode) => {
      sessionMode.value = mode;
      resetSessionData();
      if (mode === 'quick') {
        updateView('main', 3);
      } else {
        updateView('main', 1);
      }
    };

    const goToStep = (step) => { updateView('main', step); };
    const startSet = () => { isSessionRunning.value = true; };
    const stopSet = () => { isSessionRunning.value = false; };
    const startNewSession = () => {
      resetSessionData();
      updateView('mode-selection');
    };

    // Methods - Data Management
    const saveSessionData = () => { localStorage.setItem('emdr-current-session', JSON.stringify(sessionData.value)); };
    const loadSessionData = () => {
      const data = localStorage.getItem('emdr-current-session');
      if (data) sessionData.value = JSON.parse(data);
    };
    const saveHistory = () => {
      sessionData.value.timestamp = new Date().toISOString();
      history.value.unshift(sessionData.value);
      if (history.value.length > 50) history.value.pop();
      localStorage.setItem('emdr-session-history', JSON.stringify(history.value));
      showToast('Session Saved!');
    };

    // Methods - Settings, Theme, Wake Lock
    const saveSettings = () => { localStorage.setItem('emdr-settings', JSON.stringify(settings.value)); };
    const toggleTheme = () => {
      const newTheme = isDarkTheme.value ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('emdr-theme', newTheme);
    };

    onMounted(() => {
      loadSettings();
      resetSessionData();
      loadHistory();
      applyTheme(localStorage.getItem('emdr-theme') || 'light');
      
      window.addEventListener('popstate', handlePopState);
      const hash = window.location.hash.replace(/^#/, '');
      const [view, step] = hash.split('/');
      renderView(view || 'mode-selection', step ? parseInt(step) : null);

      document.addEventListener("visibilitychange", handleVisibilityChange);
    });

    onUnmounted(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

    return {
      currentView,
      sessionMode,
      currentStep,
      isSessionRunning,
      isDarkTheme,
      toastMessage,
      settings,
      sessionData,
      history,
      cycleDuration,
      // Methods
      startSession,
      goToStep,
      startSet,
      stopSet,
      startNewSession,
      updateView,
      saveSessionData,
      saveHistory,
      saveSettings,
      toggleTheme,
      showToast,
      playSound,
    };
  },
};
</script>
