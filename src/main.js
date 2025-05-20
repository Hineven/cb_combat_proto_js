import { createApp } from 'vue'
import App from './App.vue'
import initEventHandlers from './models/Events.js'

import './assets/main.css'

// 初始化事件监听器
initEventHandlers();

const app = createApp(App)
app.mount('#app')