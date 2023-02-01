import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

const app = new Vue({
    ...typeof App === 'function' ? App : Vue.extend(Object.assign({ mpType: 'app' }, App)),
    store
})
// const app = new (typeof App === 'function' ? App : Vue.extend(Object.assign({ mpType: 'app' }, App)))
app.$mount();

wx.cloud.init({
    env: 'echarger-7gak78km70d53193', //云开发环境id
    traceUser: true,
})

