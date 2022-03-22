import Vue from 'vue'
import axios from 'axios'

// axios配置
Vue.prototype.$http = axios.create({
    baseURL: "http://localhost:3000/" // 用 axios.creat ，在全局设置请求根路径
})