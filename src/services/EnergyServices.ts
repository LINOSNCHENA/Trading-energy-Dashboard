const url = 'data/data.json'

class EnergyServices {
  async getDailyData (): Promise<any[] | undefined> {
    try {
      const response = await fetch(url)
      const tradingData = await response.json()
      const processedData = tradingData
      return processedData
    } catch (e) {
      console.error('An error occurred retrieving the new Daily from ' + url, e)
    }
  }

  async getWeeklyData (): Promise<any[] | undefined> {
    try {
      const response = await fetch(url)
      const tradingData = await response.json()
      const processedData = tradingData
      return processedData
    } catch (e) {
      console.error('An error occurred retrieving the new Weekly from ' + url, e)
    }
  }

  async getMonthlyData (): Promise<any[] | undefined> {
    try {
      const response = await fetch(url)
      const tradingData = await response.json()
      const processedData = tradingData
      return processedData
    } catch (e) {
      console.error('An error occurred retrieving the new Monthly from ' + url, e)
    }
  }

  async getMaxMinData (): Promise<any[] | undefined> {
    try {
      const response = await fetch(url)
      const tradingData = await response.json()
      const processedData = tradingData
      return processedData
    } catch (e) {
      console.error('An error occurred retrieving the new MaxMin from ' + url, e)
    }
  }
}

export default new EnergyServices()
