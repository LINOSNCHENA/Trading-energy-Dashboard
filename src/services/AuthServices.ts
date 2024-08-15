// import { useAuthStore } from '../stores/AppsAuth'

import { useAuthStore } from '../stores/AppsAuth'

class AuthService {
  private store: ReturnType<typeof useAuthStore> | null = null

  private getStore () {
    if (!this.store) {
      this.store = useAuthStore()
    }
    return this.store
  }

  async getUser (): Promise<string | null> {
    return this.getStore().user
  }
}

export default new AuthService()
