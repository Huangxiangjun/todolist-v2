import Vue from 'vue'
import App from './App.vue'

// 导入全局其他配置
import './globalConfig.js'

Vue.config.productionTip = false

new Vue({
    render: h => h(App),
}).$mount('#app')