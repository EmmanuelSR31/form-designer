<template>
<div>
  <div v-if="!isView" class="button-con">
    <Upload multiple action="/apis/upload/file?fileType=file" :show-upload-list="false" :on-success="uploadSuccess">
      <Button type="primary" icon="ios-cloud-upload-outline">上传</Button>
    </Upload>
  </div>
  <ul class="fileList">
    <li v-for="(item, index) in files" :key="index">
      <Button v-if="!isView" @click="deleteFile(item)">删除</Button>
      <a :href="item" :download="pathToName(item)" target="_blank">{{pathToName(item)}}</a>
    </li>
  </ul>
  <div class="button-con">
    <Button type="primary" @click="close">关闭</Button>
  </div>
</div>
</template>
<script>
export default {
  props: {
    field: String, // 附件字段
    paths: String, // 附件数组字符串
    isView: Boolean // 是否查看
  },
  data () {
    return {
      files: [] // 附件数组
    }
  },
  methods: {
    init: function () {
      console.log(this.field)
      console.log(this.paths)
      if (this.paths !== undefined && this.paths !== '') {
        this.paths = this.paths.replace(/&quot;/g, '/')
        this.files = this.paths.split(',')
      }
    },
    pathToName: function (path) { // 截取文件名
      return path.split('/')[3].substring(36)
    },
    deleteFile: function (file) { // 删除文件
      this.$Modal.confirm({
        title: '',
        content: '确认删除此文件？',
        onOk: () => {
          this.files.splice(this.files.indexOf(file), 1)
        },
        onCancel: () => {
        }
      })
    },
    uploadSuccess: function (response, file, fileList) { // 上传成功
      console.log(response)
      console.log(typeof this.files)
      this.files.push(response.obj.filePath)
      console.log(this.files)
    },
    close: function () {
      this.$parent.formDataObj[this.field] = this.files.join(',')
      this.$parent.$layer.closeAll()
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style>
</style>
