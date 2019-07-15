// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import store from './store'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import App from './App'
import { router } from './router/index'
import api from './api/index.js'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/dist/css/swiper.css'
import layer from 'vue-layer'
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import VueSweetalert2 from 'vue-sweetalert2'
import math from 'mathjs'
import 'vue-tree-halower/dist/halower-tree.min.css'
import VTree from 'vue-tree-halower'
import uploader from 'vue-simple-uploader'

Vue.use(iView)
Vue.use(VueAwesomeSwiper)

Vue.prototype.$api = api
Vue.config.productionTip = false
Vue.config.devtools = true

Vue.prototype.$layer = layer(Vue)

Vue.use(VueCodemirror)
Vue.use(VueSweetalert2)

Vue.prototype.$math = math

Vue.use(VTree)
Vue.use(uploader)

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
