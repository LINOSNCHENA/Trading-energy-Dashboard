<template>
  <div class="app-wrapper">
    <header>
      <a class="logo" href="#">
        TRADING
        <span>User: {{ loginUser }}</span>
      </a>
      <nav :class="{ opened: isMenuOpened }">
        <img alt="Close Menu" class="close" :src="closeSvgPath" @click="closeMenu">
        <ul>
          <li><a href="#/daily">1. Daily Summary</a></li>
          <li><a href="#/weekly">2. Weekly Overview</a></li>
          <li><a href="#/monthly">3. Monthly Trends</a></li>
          <li><a href="#/area">4. Area Trends</a></li>
        </ul>
      </nav>
      <img alt="Open Menu" class="menu" :src="menuSvgPath" @click="openMenu">
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
  import TradeArea from './components/DataMaximum.vue'
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

<style lang="scss">
:root {
  --bg-color: #f2f4f7;
  --bg-card-color: #ffffff;
  --border-radius: 8px;
  --divider: #e9e9f4;
  --color-primary: #27292f;
  --text-sm-2: 12px;
  --color-gray-3: #58667e;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

body {
  font-family: "Roboto", sans-serif;
  background: var(--bg-color);
  color: var(--color-primary);
  overflow: hidden;
}

a {
  text-decoration: none;
  font-size: 1.3rem;
}

h1, h2 {
  color: var(--color-primary);
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: red;
}

header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

nav {
  position: fixed;
  right: 0;
  top: 0;
  background: white;
  height: 100vh;
  width: 100%;
  z-index: 999;
  text-transform: uppercase;
  transform: translateX(100%);
  transition: transform 0.5s ease-in-out;

  ul {
    list-style-type: none;
    padding: 0;
    margin-top: 6em;

    a {
      color: black;
      padding: 0.75em 2em;
      display: block;
    }

    a:hover {
      background: gray;
    }
  }
}

.menu {
  width: 2em;
  cursor: pointer;
}

.close {
  float: right;
  margin: 2em;
  width: 2.5em;
  cursor: pointer;
}

.opened {
  transform: translateX(0);
}

.logo {
  color: var(--color-primary);

  span {
    color: var(--color-gray-3);
  }
}

@media only screen and (min-width: 680px) {
  body {
    margin: 0;
  }
}

@media only screen and (min-width: 920px) {
  .menu {
    display: none;
  }

  nav {
    transform: translateX(0);
    position: unset;
    display: block;
    width: auto;
    height: auto;
    background: none;

    ul {
      display: flex;
      margin: 0;

      a {
        color: black;
        padding: 0.5em 1.5em;
        font-size: 0.9rem;
      }

      a:hover {
        background: none;
        text-decoration: underline;
      }
    }

    .close {
      display: none;
    }
  }
}

@media only screen and (min-width: 1200px) {
  .app-wrapper {
    width: 1200px;
    margin: 0 auto;
  }

  h1 {
    font-size: 3em;
    margin-top: 2em;
    line-height: 3.3rem;
    text-align: center;
  }
}

</style>
