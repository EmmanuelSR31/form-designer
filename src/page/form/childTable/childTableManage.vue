<template>
<div>
  <div class="table-search-con">
    <Button class="mr20" @click="cancel">后退</Button>
    <Button type="primary" @click="addFormData">新增</Button>
  </div>
  <Table :height="tableHeight" border :loading="loading" :columns="columns" :data="data" stripe></Table>
  <div class="page-con">
    <Page :total="totalRows" :current="currentPage" :page-size="pageSize" placement="top" @on-change="changePage" @on-page-size-change="changePageSize" show-elevator show-sizer></Page>
  </div>
</div>
</template>
<script>
import Util from '@/utils/index'
import editChildFormData from './editChildFormData.vue'
export default {
  data () {
    return {
      tableName: this.$route.params.tableName, // 表单名
      recordID: this.$route.params.recordID, // 主表数据ID
      formObj: {}, // 表单对象
      loading: true, // 加载中
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页显示数
      totalRows: 0, // 数据总数
      columns: [], // 表格表头
      data: [], // 数据
      selectData: this.$store.state.selectData // 下拉数据
    }
  },
  computed: {
    tableHeight: function () { // 表格高度
      return document.body.clientHeight - 210
    }
  },
  methods: {
    /**
    * @desc 改变页码
    * @param {Num} current 页码
    */
    changePage: function (current) {
      this.currentPage = current
      this.$api.post('/crm/ActionFormUtil/getDataByUuid.do', { rows: this.pageSize, page: this.currentPage, tableName: this.tableName, uuid: this.recordID }, r => {
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
    * @desc 新增数据
    */
    addFormData: function () {
      this.$store.dispatch('setCurrentEditChildForm', this.formObj)
      this.$layer.iframe({
        type: 2,
        content: {
          content: editChildFormData, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            tableName: this.tableName,
            recordID: this.recordID,
            id: '',
            method: 'add'
          }
        },
        shadeClose: false,
        shade: true,
        btn: '保存',
        area: [document.body.clientWidth - 100 + 'px', document.body.clientHeight - 20 + 'px'],
        title: '新增数据',
        yes: function (index) {
          var ifname = 'layui-layer-iframe' + index
          var Ifame = window.frames[ifname]
          Ifame.save()
        }
      })
    },
    /**
    * @desc 修改数据
    * @param {Object} params 要修改的数据
    */
    editFormData: function (params) {
      this.$store.dispatch('setCurrentEditChildForm', this.formObj)
      this.$store.dispatch('setCurrentEditChildFormData', params.row)
      this.$layer.iframe({
        content: {
          content: editChildFormData, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            tableName: this.tableName,
            recordID: this.recordID,
            id: params.row.id,
            method: 'edit'
          }
        },
        shadeClose: false,
        shade: true,
        area: [document.body.clientWidth - 100 + 'px', document.body.clientHeight - 20 + 'px'],
        title: '修改数据'
      })
    },
    /**
    * @desc 查看数据
    * @param {Object} params 要查看的数据
    */
    viewFormData: function (params) {
      this.$store.dispatch('setCurrentEditChildForm', this.formObj)
      this.$store.dispatch('setCurrentEditChildFormData', params.row)
      this.$layer.iframe({
        content: {
          content: editChildFormData, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            tableName: this.tableName,
            recordID: this.recordID,
            id: params.row.id,
            method: 'view'
          }
        },
        shadeClose: false,
        shade: true,
        area: [document.body.clientWidth - 100 + 'px', document.body.clientHeight - 20 + 'px'],
        title: '查看数据'
      })
    },
    /**
    * @desc 初始化
    */
    init: function () {
      this.columns = []
      this.$api.post('/pages/crminterface/getDatagridForJson.do', { tableName: this.tableName }, r => {
        this.formObj = r.data
        Util.getFormSelectData(this.formObj.field)
        this.columns = Util.initColumns(this.formObj.field, true)
        this.columnsAddAction()
      })
      this.changePage(this.currentPage)
    },
    /**
    * @desc 表头加操作列
    */
    columnsAddAction: function () {
      this.columns.push({
        title: '操作',
        key: 'action',
        width: 150,
        align: 'center',
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'success',
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.viewFormData(params)
                }
              }
            }, '查看'),
            h('Button', {
              props: {
                type: 'primary',
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.editFormData(params)
                }
              }
            }, '修改'),
            h('Button', {
              props: {
                type: 'error',
                size: 'small'
              },
              on: {
                click: () => {
                  Util.deleteFormData(this.tableName, params, this.changePage, this.currentPage, 1)
                }
              }
            }, '删除')
          ])
        }
      })
    },
    cancel: function () {
      this.$router.go(-1)
    }
  },
  mounted () {
    this.init()
  }
}
</script>
