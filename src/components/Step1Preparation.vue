<template>
  <div>
      <h2 class="step-title">Preparation</h2>
      <div v-if="sessionMode === 'guided'" class="guided-text-container">
          <h3 :class="{ 'fade-in': guidedQuestion, 'fade-out': !guidedQuestion }">{{ guidedQuestion }}</h3>
      </div>
      <div v-if="sessionMode === 'full-form'">
          <div class="journal-section">
              <label>Safe Place</label>
              <textarea :value="sessionData.safePlace" @input="updateSessionData('safePlace', $event.target.value)" placeholder="Describe a place where you feel completely at peace. What do you see, hear, smell, and feel?"></textarea>
          </div>
          <div class="journal-section">
              <label>Target Memory</label>
              <textarea :value="sessionData.targetMemory" @input="updateSessionData('targetMemory', $event.target.value)" placeholder="Briefly describe a memory or situation that causes you mild distress."></textarea>
          </div>
          <div class="journal-section">
              <label>Negative Thought</label>
              <textarea :value="sessionData.negativeThought" @input="updateSessionData('negativeThought', $event.target.value)" placeholder="What negative belief about yourself comes up about yourself with this memory? (e.g., I am not safe, I am powerless)"></textarea>
          </div>
          <div class="button-group">
              <button @click="$emit('goToStep', 2)">Continue</button>
          </div>
      </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue';

export default {
  props: ['sessionMode', 'sessionData'],
  emits: ['update:sessionData', 'saveSessionData', 'goToStep'],
  setup(props, { emit }) {
    const guidedQuestion = ref('');
    const guidedQuestionIndex = ref(0);
    const guidedTimeoutId = ref(null);
    const GUIDED_QUESTIONS = [
      "First, let's bring to mind your Safe or Calm Place...",
      "A place where you feel completely at peace.",
      "Now, think of a memory or situation that causes you mild distress.",
      "What negative thought comes up about yourself with this memory?"
    ];

    const updateSessionData = (key, value) => {
      emit('update:sessionData', { ...props.sessionData, [key]: value });
      emit('saveSessionData');
    };

    const startGuidedSequence = () => {
      guidedQuestionIndex.value = 0;
      showNextQuestion();
    };

    const showNextQuestion = () => {
      if (guidedTimeoutId.value) clearTimeout(guidedTimeoutId.value);
      if (guidedQuestionIndex.value >= GUIDED_QUESTIONS.length) {
        guidedQuestion.value = '';
        emit('goToStep', 2); // Automatically proceed to the next step
        return;
      }
      guidedQuestion.value = GUIDED_QUESTIONS[guidedQuestionIndex.value];
      guidedTimeoutId.value = setTimeout(() => {
        guidedQuestion.value = '';
        guidedTimeoutId.value = setTimeout(() => {
          guidedQuestionIndex.value++;
          showNextQuestion();
        }, 1000);
      }, 3000);
    };

    onMounted(() => {
      if (props.sessionMode === 'guided') {
        startGuidedSequence();
      }
    });

    onUnmounted(() => {
      if (guidedTimeoutId.value) {
        clearTimeout(guidedTimeoutId.value);
      }
    });

    return {
      guidedQuestion,
      updateSessionData,
    };
  },
};
</script>