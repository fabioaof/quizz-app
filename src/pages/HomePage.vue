<template>
  <q-page class="q-pa-lg flex flex-center column" style="margin: auto; background-color: #3C3D37;">
    <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%;">
      <div class="q-mb-lg" style="font-weight: 700; letter-spacing: 1px; color: #EFE4D2; font-size: 2.5em; text-align: center;">
        Escolhe o teu papel
      </div>
    </div>

    <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 100%; gap: 10px;">
      <q-btn
        label="Sou o Host"
        unelevated
        @click="chooseRole('host')"
        style="font-weight: 600; height: 80px; width: 130px; background-color: #16404D; color: #EFE4D2"
      />
      <q-btn
        label="Sou Jogador"
        unelevated
        @click="chooseRole('player')"
        style="font-weight: 600; height: 80px; width: 130px; background-color: #708A58; color: #EFE4D2"
      />
    </div>

    <!-- Diálogo para introduzir nome -->
    <q-dialog v-model="nameDialog" persistent>
      <q-card class="q-pa-md" style="min-width: 320px; border-radius: 16px;">
        <q-card-section>
          <div class="text-h6 text-weight-bold text-secondary q-mb-md">
            Escreve o teu nome
          </div>
          <q-input
            v-model="playerName"
            label="Nome"
            outlined
            autofocus
            clearable
            dense
            :rules="[val => val && val.trim().length > 0 || 'Nome é obrigatório']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Entrar" color="primary" @click="confirmName" :disable="!playerName.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalStore } from 'src/stores/global'

const router = useRouter()
const store = useGlobalStore()

const nameDialog = ref(false)
const playerName = ref('')

function chooseRole(role) {
  if (role === 'host') {
    store.setQuizRole('host')
    router.push('/host')
  } else {
    store.setQuizRole('player')
    nameDialog.value = true
  }
}

function confirmName() {
  store.setPlayerName(playerName.value.trim())
  nameDialog.value = false
  router.push('/player')
}
</script>
