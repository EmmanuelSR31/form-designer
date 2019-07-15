<template>
<div>
  <div v-if="!isView" class="table-search-con">
    <Button type="primary" @click="addFormData">新增</Button>
  </div>
  <Table :loading="loading" :columns="columns" :data="data"></Table>
</div>
</template>
<script>
import Util from '@/utils/index'
import editChildFormData from './editChildFormData.vue'
export default {
  name: 'childTable',
  props: {
    childTableName: String, // 表单名
    recordID: String, // 主表数据ID
    isView: Boolean // 是否查看
  },
  data () {
    return {
      formObj: {}, // 表单对象
      loading: true, // 加载中
      currentPage: 1, // 当前页码
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
      this.$api.post('/crm/ActionFormUtil/getDataByUuid.do', { tableName: this.childTableName, uuid: this.recordID }, r => {
        this.totalRows = r.data.total
        this.data = r.data.rows
        this.loading = false
      })
    },
    /**
    * @desc 新增数据
    */
    addFormData: function () {
      this.$store.dispatch('setCurrentEditChildForm', this.formObj)
      this.$layer.iframe({
        content: {
          content: editChildFormData, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            tableName: this.childTableName,
            recordID: this.recordID,
            id: '',
            method: 'add'
          }
        },
        area: ['750px', '700px'],
        title: '新增',
        shade: true,
        shadeClose: false
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
            tableName: this.childTableName,
            recordID: this.recordID,
            id: params.row.id + '',
            method: 'edit'
          }
        },
        area: ['750px', '700px'],
        title: '修改',
        shade: true,
        shadeClose: false
      })
    },
    /**
    * @desc 修改数据成功后触发主表页事件
    */
    editSuccess: function () {
      this.$emit('edit-success')
      this.changePage(1)
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
            tableName: this.childTableName,
            recordID: this.recordID,
            id: params.row.id + '',
            method: 'view'
          }
        },
        area: ['750px', '700px'],
        title: '查看',
        shade: true,
        shadeClose: false
      })
    },
    /**
    * @desc 初始化
    */
    init: function () {
      this.$api.post('/pages/crminterface/getDatagridForJson.do', { tableName: this.childTableName }, r => {
        this.formObj = r.data
        Util.getFormSelectData(this.formObj.field)
        this.columns = Util.initColumns(this.formObj.field, true)
        if (!this.isView) {
          this.columnsAddAction()
        }
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
                  Util.deleteFormData(this.childTableName, params, this.changePage, this.currentPage, 1)
                  this.editSuccess()
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
