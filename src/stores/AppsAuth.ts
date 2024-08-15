import { defineStore } from 'pinia'
interface HealthAuthState {
  loading: boolean;
  error: string | null;
  rate: any;
  user: any;
}

export const useAuthStore = defineStore('authStore', {
  state: (): HealthAuthState => ({
    loading: false,
    error: null,
    user: 'None@gmail.com',
    rate: 0,
  }),

  actions: {
    async isAuthorizedMgmt (user: string | undefined) {
      const enforcer = String(user)
      const authorizedEmails = [
        'test1@gmail.com',
        'test2@gmail.com',
        'test3@gmail.com',
        'test4@gmail.com',
        'test5@gmail.com',
        'test6@gmail.com',
      ]
      this.formatUser(enforcer)
      return authorizedEmails.includes(enforcer)
    },

    async isAuthorizedAdmin (user: string | undefined) {
      const enforcer = String(user)
      const authorizedEmails = [
        'test1@gmail.com',
        'test2@gmail.com',
        'test3@gmail.com',
      ]
      this.formatUser(enforcer)
      return authorizedEmails.includes(enforcer)
    },

    async isAuthoririsedRevoked () {
      const enforcer = 'NONE@gmail.com'
      this.formatUser(enforcer)
    },

    formatUser (date: any) {
      this.user = date
      return this.user
    },
  },

  getters: {
    loadedRates (state) {
      return state.rate
    },
    loadedUsers (state) {
      const x = sessionStorage.getItem('ActiveUserEmail')
      console.log(state.user)
      console.log(x)
      return state.user
    },
  },
})
