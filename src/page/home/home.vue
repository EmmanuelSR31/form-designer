<template>
<div>
  home
</div>
</template>

<script>
import Util from '@/utils/index'
export default {
  data () {
    return {
      user: {} // 登录用户
    }
  },
  computed: {
    layerHeight: function () { // 模型高度
      return document.body.clientHeight - 80
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
    }
  },
  mounted () {
    if (!Util.isEmpty(Util.getCookie('user'))) {
      this.user = JSON.parse(Util.getCookie('user'))
    }
    this.init()
  }
}
</script>

<style lang="scss">

</style>
