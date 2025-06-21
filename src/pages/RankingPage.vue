<template>
  <q-page class="q-pa-md">
    <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%; margin-bottom: 20px;">
      <div style="font-size: 2.5em; font-weight: 700; color: #EFE4D2; text-align: center; user-select: none;">Classificação Final</div>
    </div>

    <q-list bordered>
      <q-item v-for="player in ranking" :key="player.id">
        <q-item-section>
          {{ player.name }} — Pontos: {{ player.points }}
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="store.quizRole === 'host'" class="q-mt-lg row q-gutter-sm">
      <q-btn unelevated style="font-weight: 600; height: 80px; width: 130px; background-color: #16404D; color: #EFE4D2" label="Reiniciar Quiz" @click="restartQuiz" />
      <q-btn unelevated style="font-weight: 600; height: 80px; width: 130px; background-color: #8B2D2D; color: #EFE4D2" label="Reiniciar Configurações" @click="resetConfig" />
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from 'boot/firebase'
import { ref as dbRef, onValue, set } from 'firebase/database'
import { useGlobalStore } from 'src/stores/global'

const router = useRouter()
const store = useGlobalStore()

const ranking = ref([])

function fetchRanking() {
  const playersRef = dbRef(db, 'rooms/default/players')
  onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {}
    const results = Object.entries(players).map(([id, data]) => ({
      id,
      name: data.name || id,
      points: data.score || 0
    }))
    results.sort((a, b) => b.points - a.points)
    ranking.value = results
  })
}

function restartQuiz() {
  set(dbRef(db, 'rooms/default/players'), null)
  set(dbRef(db, 'rooms/default/quizState'), 'started')
  router.push('/host')
}

async function resetConfig() {
  await set(dbRef(db, 'rooms/default/hostActive'), false)
  set(dbRef(db, 'rooms/'), null)
  store.setQuizRole('')
  router.push('/')
}

onMounted(() => {
  const hostActiveRef = dbRef(db, 'rooms/default/hostActive')
  onValue(hostActiveRef, (snap) => {
    const active = snap.val()
    if (!active) {
      router.push('/')
    }
  })
  fetchRanking()
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

/* Lista de opções */
.q-list {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  background-color: #4A4B43;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  overflow: hidden;
}


</style>
