<template>
    <q-page class="q-pa-md">
      <p style="font-size: 1.1em; margin-bottom: 20px; text-align: center; max-width: 600px; user-select: none;">Pergunta {{ currentIndex + 1 }} de {{ questions.length }}</p>
      
      <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%; margin-bottom: 20px;">
        <div style="font-size: 2.5em; font-weight: 700; color: #EFE4D2; text-align: center; user-select: none;">{{ currentQuestion.question }}</div>
      </div>
  
      <q-list bordered>
        <q-item
          v-for="(opt, i) in currentQuestion.options"
          :key="i"
          :class="{ correct: showCorrect && currentQuestion.answer === i }"
        >
          <q-item-section>{{ opt }}</q-item-section>
        </q-item>
      </q-list>
  
      <div class="q-mt-md">
        <q-linear-progress
          :value="(questionTime - timeLeft) / questionTime"
          color="positive"
          animated
        />
        <p>Tempo restante: {{ timeLeft }}s</p>
      </div>
  
      <div class="q-mt-lg row q-gutter-sm">
        <q-btn unelevated style="font-weight: 600; height: 80px; width: 130px; background-color: #16404D; color: #EFE4D2" label="Reiniciar Quiz" @click="restartQuiz" />
        <q-btn unelevated style="font-weight: 600; height: 80px; width: 130px; background-color: #8B2D2D; color: #EFE4D2" label="Reiniciar Configurações" color="negative" @click="resetConfig" />
      </div>
    </q-page>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { db } from 'boot/firebase'
  import { ref as dbRef, set } from 'firebase/database'
  import { useGlobalStore } from 'src/stores/global'
  
  const router = useRouter()
  const store = useGlobalStore()
  
  const questions = [
    {
      question: 'Qual é a capital de Portugal?',
      options: ['Lisboa', 'Madrid', 'Paris', 'Porto'],
      answer: 0
    },
    {
      question: '2 + 2 = ?',
      options: ['3', '4', '5', '6'],
      answer: 1
    }
  ]
  
  const questionTime = 15
  const currentIndex = ref(0)
  const timeLeft = ref(questionTime)
  const intervalId = ref(null)
  const showCorrect = ref(false)
  
  const currentQuestion = computed(() => questions[currentIndex.value])
  
  function startTimer() {
    intervalId.value = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        stopTimer()
        showCorrect.value = true
        setTimeout(goToNext, 3000)
      }
    }, 1000)
  }
  
  function stopTimer() {
    clearInterval(intervalId.value)
  }
  
  function publishQuestion() {
    const questionRef = dbRef(db, 'rooms/default/currentQuestion')
    set(questionRef, {
      question: currentQuestion.value.question,
      options: currentQuestion.value.options,
      correctAnswer: currentQuestion.value.answer,
      timeEndsAt: Date.now() + timeLeft.value * 1000
    })
  }
  
  function goToNext() {
    stopTimer()
    showCorrect.value = false
    timeLeft.value = questionTime
  
    if (currentIndex.value < questions.length - 1) {
      currentIndex.value++
      publishQuestion()
      startTimer()
    } else {
      set(dbRef(db, 'rooms/default/quizState'), 'finished')
      router.push('/ranking')
    }
  }
  
  function restartQuiz() {
    currentIndex.value = 0
    timeLeft.value = questionTime
    showCorrect.value = false
    publishQuestion()
    set(dbRef(db, 'rooms/default/players'), null)
    set(dbRef(db, 'rooms/default/quizState'), 'started')
    stopTimer()
    startTimer()
  }
  
  async function resetConfig() {
    await set(dbRef(db, 'rooms/default/hostActive'), false)
    set(dbRef(db, 'rooms/'), null)
    stopTimer()
    store.setQuizRole('')
    router.push('/')
  }
  
  onMounted(() => {
    set(dbRef(db, 'rooms/default/hostActive'), true)
    publishQuestion()
    set(dbRef(db, 'rooms/default/quizState'), 'started')
    startTimer()
  })
  </script>

  <style scoped>
  /* Fundo da página com cor base */
  .q-page {
    background-color: #3C3D37;
    color: #EFE4D2;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    min-height: 100vh;
  }
  
  p {
    font-size: 1.3em;
    margin-bottom: 20px;
    text-align: center;
    max-width: 600px;
    user-select: none;
  }
  
  /* Lista de opções */
  .q-list {
    width: 100%;
    max-width: 600px;
    border-radius: 12px;
    background-color: #4A4B43;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    overflow: hidden;
  }
  
  /* Cada item da lista */
  .q-item {
    padding: 16px 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    color: #EFE4D2;
    font-weight: 600;
    border-bottom: 1px solid #61635B;
    user-select: none;
  }
  
  .q-item:last-child {
    border-bottom: none;
  }
  
  /* Destaca resposta correta */
  .correct {
    background-color: #708A58 !important;
    color: #EFE4D2 !important;
    font-weight: 700 !important;
    box-shadow: 0 0 10px #708A58;
    user-select: none;
  }
  
  /* Container do progresso e tempo */
  .q-mt-md {
    margin-top: 24px !important;
    text-align: center;
    color: #EFE4D2;
    font-weight: 600;
    font-size: 1.1em;
    user-select: none;
  }
  
  /* Barra de progresso estilizada */
  .q-linear-progress {
    border-radius: 12px;
    height: 16px;
    background-color: #61635B;
    max-width: 600px;
    margin: 0 auto 10px auto;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
  }
  
  /* Botões principais */
  .row.q-gutter-sm {
    margin-top: 40px;
    gap: 12px;
    justify-content: center;
    width: 100%;
    max-width: 600px;
  }
  </style>
  
  