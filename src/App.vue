<template>
  <div class="app-wrapper">
    <header>
      <a class="logo" href="#">
        <span class="logo-text">TRADING DASHBOARD</span>
        <span class="user-info">| User : {{ loginUser }}</span>
      </a>
      <nav aria-label="Main Navigation" :class="{ opened: isMenuOpened }">
        <img
          alt="Close Menu"
          aria-label="Close Menu"
          class="close"
          role="button"
          :src="closeSvgPath"
          @click="closeMenu"
        >
        <ul class="logo1">
          <li>
            <a :class="{ active: currentPath === '#/daily' }" href="#/daily">1. Daily Summary</a>
          </li>
          <li>
            <a :class="{ active: currentPath === '#/weekly' }" href="#/weekly">2. Weekly Overview</a>
          </li>
          <li>
            <a :class="{ active: currentPath === '#/monthly' }" href="#/monthly">3. Monthly Trends</a>
          </li>
          <li>
            <a :class="{ active: currentPath === '#/area' }" href="#/area">4. Area Analysis</a>
          </li>
          <li>
            <a :class="{ active: currentPath === '#/lined' }" href="#/lined">5. Area Lines</a>
          </li>
          <li>
            <a :class="{ active: currentPath === '#/tables' }" href="#/tables">6. Data Tables</a>
          </li>

        </ul>
      </nav>
      <img
        alt="Open Menu"
        aria-label="Open Menu"
        class="menu"
        role="button"
        :src="menuSvgPath"
        @click="openMenu"
      >
    </header>
    <component :is="currentView" />
  </div>
</template>

<script lang="ts" setup>

  import { computed, onMounted, ref } from 'vue'
  import closeSvgPath from '@/assets/close.svg'
  import menuSvgPath from '@/assets/menu.svg'
  import TradeDaily from '@/components/DataDaily.vue'
  import TradeWeekly from './components/DataWeekly.vue'
  import TradeMonthly from './components/DataMonthly.vue'
  import TradeArea from './components/DataXArea.vue'
  import TradeLined from './components/DataXLineX.vue'
  import TradeTabled from './components/DataXTabled.vue'
  import { useAuthStore } from './stores/AppsAuth'
  const storeAUT = useAuthStore()
  const loginUser = ref()

  interface Routes {
    [key: string]: any;
  }

  const routes: Routes = {
    '/daily': TradeDaily,
    '/monthly': TradeMonthly,
    '/weekly': TradeWeekly,
    '/area': TradeArea,
    '/lined': TradeLined,
    '/tables': TradeTabled,
    '/': TradeDaily,
    '*': { template: '<h1>Not Found</h1>' },
  }

  const currentPath = ref<string>(window.location.hash)
  const isMenuOpened = ref<boolean>(false)

  const currentView = computed(() => {
    const path = currentPath.value.slice(1) || '/'
    closeMenu()
    return routes[path] || routes['*']
  })

  const openMenu = (): void => {
    isMenuOpened.value = true
  }

  const closeMenu = (): void => {
    isMenuOpened.value = false
  }

  onMounted(async () => {
    window.addEventListener('hashchange', () => {
      currentPath.value = window.location.hash
    })
    const user = await storeAUT.user
    loginUser.value = user.slice(0, -10)
  })
</script>
