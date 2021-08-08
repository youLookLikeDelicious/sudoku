import { createApp } from 'vue'
import App from './App.vue'
import '@/style/base.css'
const app = createApp(App)

app.directive('visible', {
  updated(el, binding) {
    if (binding.value) {
      el.style.visibility = ''
    } else {
      el.style.visibility = 'hidden'
    }
  },
  beforeMount(el, binding) {
    if (binding.value) {
      el.style.visibility = ''
    } else {
      el.style.visibility = 'hidden'
    }
  }
})

app.mount('#app')