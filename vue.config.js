module.exports = {
  publicPath: './',
  assetsDir: 'static',
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  }
}
