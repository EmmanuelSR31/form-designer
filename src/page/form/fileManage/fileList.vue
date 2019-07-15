<template>
<div>
  <div class="table-search-con">
    <Button type="primary" @click="search">查询</Button>
  </div>
  <Table :height="tableHeight" border :loading="loading" :columns="columns" :data="data" stripe highlight-row></Table>
  <div class="page-con">
    <Page :total="totalRows" :current="currentPage" :page-size="pageSize" placement="top" @on-change="changePage" @on-page-size-change="changePageSize" show-elevator show-sizer></Page>
  </div>
  <div class="img-view-con" v-show="viewFlag">
    <a href="javascript:void(0)" @click="closeView">X</a>
    <img :src="imgSrc">
    <pdf :src="pdfSrc"></pdf>
  </div>
</div>
</template>
<script>
import pdf from 'vue-pdf'
export default {
  components: {
    pdf // pdf插件
  },
  data () {
    return {
      loading: false, // 加载中
      currentPage: 1, // 当前页码
      pageSize: 30, // 每页显示数
      totalRows: 0, // 数据总数
      columns: [ // 表格表头
        {
          type: 'index',
          title: '序列',
          width: 64,
          align: 'center'
        },
        {
          title: '文件编号',
          key: 'id'
        },
        {
          title: '文件名称',
          key: 'fileName'
        },
        {
          title: '文件类型',
          key: 'fileType'
        },
        {
          title: '文件路径',
          key: 'filePath'
        },
        {
          title: '上传时间',
          key: 'uploadTime'
        },
        {
          title: '上传者',
          key: 'uploadBy'
        },
        {
          title: '操作',
          key: 'action',
          width: 120,
          align: 'center',
          render: (h, params) => {
            let temp = 'none'
            if (params.row.fileType === '.jpg' || params.row.fileType === '.png' || params.row.fileType === '.jpeg' || params.row.fileType === '.bmp' || params.row.fileType === '.pdf') {
              temp = 'inline-block'
            }
            return h('div', [
              h('Button', {
                props: {
                  type: 'success',
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: temp
                },
                on: {
                  click: () => {
                    this.viewFile(params)
                  }
                }
              }, '预览'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.delFile(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      data: [], // 附件数据
      viewFlag: false, // 打开预览
      imgSrc: '', // 预览图片地址
      pdfSrc: '' // 预览pdf地址
    }
  },
  computed: {
    tableHeight: function () { // 表格高度
      return document.body.clientHeight - 210
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      this.changePage(this.currentPage)
    },
    /**
    * @desc 改变页码
    * @param {Num} current 页码
    */
    changePage: function (current) {
      this.loading = true
      this.currentPage = current
      this.$api.post('/upload/getFilelist', { rows: this.pageSize, page: this.currentPage }, r => {
        console.log(r)
        this.totalRows = r.data.total
        this.data = r.data.rows
        this.loading = false
      })
    },
    /**
    * @desc 改变每页显示数
    * @param {Num} size 每页显示数
    */
    changePageSize: function (size) {
      this.pageSize = size
      this.changePage(this.currentPage)
    },
    /**
    * @desc 预览图片
    * @param {Object} params 附件对象
    */
    viewFile: function (params) {
      this.viewFlag = true
      if (params.row.fileType === '.pdf') {
        this.pdfSrc = 'http://27.221.114.82:9003' + params.row.filePath
      } else {
        this.imgSrc = 'http://27.221.114.82:9003' + params.row.filePath
      }
    },
    /**
    * @desc 关闭预览
    */
    closeView: function () {
      this.viewFlag = false
    },
    /**
    * @desc 删除附件
    * @param {Object} params 要删除的附件对象
    */
    delFile: function (params) {
      this.$Modal.confirm({
        title: '',
        content: '确认删除此附件？',
        onOk: () => {
          this.$api.post('/upload/deleteFile', { filePath: params.row.filePath, id: params.row.id }, r => {
            this.$Message.info(r.data.msg)
            this.changePage(this.currentPage)
          })
        },
        onCancel: () => {
        }
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>
