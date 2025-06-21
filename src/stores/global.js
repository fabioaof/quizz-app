import { defineStore, acceptHMRUpdate } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    quizRole: '',
    playerName: ''
  }),

  getters: {
    getQuizRole: (state) => state.quizRole,
    getPlayerName: (state) => state.playerName
  },

  actions: {
    setQuizRole(role) {
      this.quizRole = role
    },
    setPlayerName(name) {
      this.playerName = name
    }
  },

  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlobalStore, import.meta.hot))
}
