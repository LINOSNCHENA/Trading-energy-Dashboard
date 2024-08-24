import { IDataPoint } from '@/types/types'
import { defineStore } from 'pinia'

interface HealthAuthState {
  loading: boolean;
  error: any | null;
  rate: number;
  user: string;
  pricesData: IDataPoint[];
  url: string;
}

export const useAuthStore = defineStore('authStore', {
  state: (): HealthAuthState => ({
    loading: false,
    error: null,
    user: 'Guest@gmail.com',
    rate: 0,
    pricesData: [],
    url: 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&outputsize=full&apikey=123',
  }),

  actions: {
    async fetchData () {
      this.loading = true
      try {
        const response = await fetch(this.url)
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        console.log(response)
        const data = await response.json()
        this.pricesData = data
        return data
      } catch (error) {
        this.error = error || 'An error occurred'
      } finally {
        this.loading = false
      }
    },

    async isAuthorizedAdmin (user?: string) {
      const normalizedUser = String(user || this.user).toLowerCase()
      const authorizedEmails = [
        'test1@gmail.com',
        'test2@gmail.com',
        'test3@gmail.com',
      ]
      return authorizedEmails.includes(normalizedUser)
    },

    async revokeAuthorization () {
      this.user = 'Guest@gmail.com'
    },

    setUser (user: string) {
      this.user = user
    },
  },

  getters: {
    loadedRates (state) {
      return state.rate
    },
    loadedUser (state) {
      return state.user
    },
    isLoading (state) {
      return state.loading
    },
    loadedPrices (state) {
      return state.pricesData
    },
    loadedRecords (state) {
      return state.pricesData.length
    },
  },
})
