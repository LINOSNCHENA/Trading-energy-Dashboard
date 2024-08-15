<template>
  <div class="app-wrapper">
    <header>
      <a class="logo" href="#">Trading<span> Data</span></a>
      <nav :class="{ opened: isMenuOpened }">
        <img class="close" :src="closeSvgPath" @click="closeMenu">
        <ul>
          <li><a href="#/daily">1.Daily</a></li>
          <li><a href="#/weekly">2. Weekly</a></li>
          <li><a href="#/monthly">3. Monthly</a></li>
          <li><a href="#/maximum">4. Maximum</a></li>
          <li><a href="#/balance">5. Balance</a></li>
          <li><a href="#/whole">6. Whole</a></li>
        </ul>
      </nav>
      <img class="menu" :src="menuSvgPath" @click="openMenu">
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
  import TradeMaximum from './components/DataMaximum.vue'
  import TradeBalance from '@/components/DataBalance.vue'
  import TradeWhole from './components/DataWhole.vue'

  import { useAuthStore } from './stores/AppsAuth'
  const storeAUT = useAuthStore()

  interface Routes {
    [key: string]: any;
  }

  const routes: Routes = {
    '/daily': TradeDaily,
    '/monthly': TradeMonthly,
    '/balance': TradeBalance,
    '/weekly': TradeWeekly,
    '/maximum': TradeMaximum,
    '/whole': TradeWhole,
    '/': TradeDaily,
  }

  const currentPath = ref<string>(window.location.hash)
  const isMenuOpened = ref<boolean>(false)

  const currentView = computed(() => {
    return routes[currentPath.value.slice(1) || '/'] || { template: '<h1>Not Found</h1>' }
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
    await storeAUT.user
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
  overflow: hidden; /* Prevent scrolling if not needed */
}

a {
  text-decoration: none;
  font-size: 1.3rem;
}

h1,
h2 {
  color: var(--color-primary);
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
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
    margin: 0; /* Adjust as needed */
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
