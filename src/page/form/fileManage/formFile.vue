<template>
<div>
  <div v-if="!isView">
    <Upload multiple :action="uploadIp + '/upload/file?fileType=file'" :show-upload-list="false" :on-success="uploadSuccess">
      <Button type="primary" icon="ios-cloud-upload-outline">上传</Button>
    </Upload>
  </div>
  <ul class="form-file-list">
    <li v-for="(item, index) in files" :key="index">
      <Button v-if="!isView" @click="deleteFile(item)">删除</Button>
      <a :href="item" :download="pathToName(item)" target="_blank">{{pathToName(item)}}</a>
    </li>
  </ul>
</div>
</template>
<script>
export default {
  name: 'formFile',
  props: {
    field: String, // 附件字段名
    paths: String, // 附件数组字符串
    isView: Boolean // 是否查看
  },
  data () {
    return {
      files: [], // 附件数组
      uploadIp: this.$store.state.uploadIp // 上传ip地址
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      console.log(this.field)
      console.log(this.paths)
      if (this.paths !== undefined && this.paths !== '') {
        this.paths = this.paths.replace(/&quot;/g, '/')
        this.files = this.paths.split(',')
      }
    },
    /**
    * @desc 截取文件名
    * @param {String} path 文件路径
    */
    pathToName: function (path) {
      return path.split('/')[3].substring(36)
    },
    /**
    * @desc 删除文件
    * @param {Object} file 文件对象
    */
    deleteFile: function (file) {
      this.$Modal.confirm({
        title: '',
        content: '确认删除此文件？',
        onOk: () => {
          this.files.splice(this.files.indexOf(file), 1)
          this.changeFiles()
        },
        onCancel: () => {
        }
      })
    },
    /**
    * @desc 上传成功
    * @param {Object} response 返回对象
    */
    uploadSuccess: function (response, file, fileList) {
      console.log(response)
      console.log(typeof this.files)
      this.files.push(response.obj.filePath)
      this.changeFiles()
      console.log(this.files)
    },
    /**
    * @desc 更改附件值
    */
    changeFiles: function () {
      this.$emit('change-field-files', this.field, this.files.join(','))
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style>
</style>
