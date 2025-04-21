import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'

// Установка базового URL для всех запросов axios
axios.defaults.baseURL = 'http://localhost:3000'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app') 