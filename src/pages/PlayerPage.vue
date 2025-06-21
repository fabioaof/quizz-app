<template>
    <q-page class="q-pa-md">
      <template v-if="currentQuestion">
      
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%; margin-bottom: 20px;">
          <div style="font-size: 2.5em; font-weight: 700; color: #EFE4D2; text-align: center; user-select: none;">{{ currentQuestion.question }}</div>
        </div>
  
        <q-list bordered>
          <q-item
            v-for="(opt, i) in currentQuestion.options"
            :key="i"
            clickable
            :class="{
              selected: selectedAnswer === i,
              correct: showCorrect && currentQuestion.correctAnswer === i,
              wrong: showCorrect && selectedAnswer === i && selectedAnswer !== currentQuestion.correctAnswer
            }"
            @click="selectAnswer(i)"
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
      </template>
  
      <template v-else>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
          <q-spinner-dots color="positive" size="40px" />
        </div>
        <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
          <p>A aguardar pergunta do host...</p>
        </div>
      </template> 
    </q-page>
  </template>
  
  <script setup>
    import { ref, onMounted } from 'vue'
    import { db } from 'boot/firebase'
    import { ref as dbRef, onValue, set } from 'firebase/database'
    import { useRouter } from 'vue-router'
    import { useGlobalStore } from 'src/stores/global'

    const router = useRouter()
    const store = useGlobalStore()

    const questionTime = 15
    const currentQuestion = ref(null)
    const timeLeft = ref(questionTime)
    const selectedAnswer = ref(null)
    const showCorrect = ref(false)
    let intervalId = null
    const hostActive = ref(false)
    const playerId = Date.now().toString()

    function stopTimer() {
      if (intervalId) clearInterval(intervalId)
    }

    function startTimer(timeEndsAt) {
      stopTimer()
      updateTimeLeft(timeEndsAt)
      intervalId = setInterval(() => {
        updateTimeLeft(timeEndsAt)
      }, 1000)
    }

    function updateTimeLeft(timeEndsAt) {
      const remaining = Math.floor((timeEndsAt - Date.now()) / 1000)
      if (remaining >= 0) {
        timeLeft.value = remaining
      } else {
        stopTimer()
        showCorrect.value = true

        // Verificar se a resposta foi correta
        if (
          selectedAnswer.value !== null &&
          selectedAnswer.value === currentQuestion.value.correctAnswer
        ) {
          const playerScoreRef = dbRef(db, `rooms/default/players/${playerId}/score`)
          onValue(playerScoreRef, (snap) => {
            const currentScore = snap.val() || 0
            set(playerScoreRef, currentScore + 1)
          }, { onlyOnce: true })
        }
      }
    }


    function selectAnswer(i) {
      if (selectedAnswer.value !== null) return
      selectedAnswer.value = i
    }

    function resetQuestion() {
      selectedAnswer.value = null
      showCorrect.value = false
    }

    onMounted(() => {
      const hostActiveRef = dbRef(db, 'rooms/default/hostActive')
      const quizStateRef = dbRef(db, 'rooms/default/quizState')
      const questionRef = dbRef(db, 'rooms/default/currentQuestion')
      const playerRef = dbRef(db, `rooms/default/players/${playerId}`)

      set(playerRef, {
        name: store.playerName,
        joinedAt: Date.now(),
        score: 0
      })

      onValue(hostActiveRef, (snap) => {
        hostActive.value = !!snap.val()
        if (!hostActive.value) {
          currentQuestion.value = null
          stopTimer()
          resetQuestion()
        }
      })

      onValue(questionRef, (qsnap) => {
        if (!hostActive.value) {
          // Se host não ativo, ignora as perguntas
          currentQuestion.value = null
          stopTimer()
          resetQuestion()
          return
        }
        const data = qsnap.val()
        if (!data) {
          currentQuestion.value = null
          stopTimer()
          resetQuestion()
          return
        }
        currentQuestion.value = data
        resetQuestion()
        startTimer(data.timeEndsAt)
      })

      onValue(quizStateRef, (snap) => {
        const state = snap.val()
        if (state === 'finished') {
          stopTimer()
          router.push('/ranking')
        } else if (state === 'started') {
          if (router.currentRoute.value.path === '/ranking') {
            router.push('/player')
          }
        }
      })
    })
  </script>
  
  <style scoped>
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

  .selected {
    background-color: #CA7842;
    color: #EFE4D2;
  }
  .correct {
    background-color: #708A58;
    color: #EFE4D2;
  }
  .wrong {
    background-color: #8B2D2D;
    color: #EFE4D2;
  }
  </style>
  