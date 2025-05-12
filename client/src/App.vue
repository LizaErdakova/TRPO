<template>
  <div id="app">
    <app-header />
    <router-view></router-view>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';

export default {
  name: 'App',
  components: {
    AppHeader
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('~@/assets/images/Фруктовая картинка.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* Затемнение фона для лучшей читабельности текста */
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

#app::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('~@/assets/images/Фруктовая картинка.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(3px);
  z-index: -1;
}

button {
  cursor: pointer;
}
</style> 