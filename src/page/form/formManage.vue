<template>
<div>
  <div class="table-search-con">
    <Button type="primary" @click="addForm">新增</Button>
  </div>
  <Table :height="tableHeight" border :loading="loading" :columns="columns" :data="data" stripe></Table>
  <div class="page-con">
    <Page :total="totalRows" :current="currentPage" :page-size="pageSize" placement="top" @on-change="changePage" @on-page-size-change="changePageSize" show-elevator show-sizer></Page>
  </div>
</div>
</template>
<script>
import Util from '@/utils/index'
export default {
  data () {
    return {
      loading: true, // 加载中
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页显示数
      totalRows: 0, // 数据总数
      columns: [ // 表格表头
        {
          type: 'index',
          title: '序列',
          width: 64,
          align: 'center'
        },
        {
          title: '数据库表名',
          key: 'title'
        },
        {
          title: '表单标题',
          key: 'name'
        },
        {
          title: '表类型',
          key: 'type',
          width: 76,
          align: 'center',
          render: (h, params) => {
            if (params.row.type === '0') {
              return h('div', '主表')
            } else if (params.row.type === '1') {
              return h('div', '子表')
            } else if (params.row.type === '2') {
              return h('div', '树形表')
            }
          }
        },
        {
          title: '字段',
          key: 'str_json',
          render: (h, params) => {
            let temp = ''
            let obj = JSON.parse(params.row.str_json)
            let fields = obj.field
            for (let value of fields) {
              if (value.text !== 'recordID') {
                temp += value.title + ','
              }
            }
            temp = Util.removeLastComma(temp)
            return h('div', temp)
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
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
                    this.editForm(params)
                  }
                }
              }, '修改'),
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
                    this.editFormAttr(params)
                  }
                }
              }, '配置'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.deleteForm(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      data: []
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
      this.$api.post('/crm/ActionFormUtil/getAllTable.do', { rows: this.pageSize, page: this.currentPage }, r => {
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
    * @desc 新增表单
    */
    addForm: function () {
      this.$router.push({
        name: 'editForm',
        params: { method: 'add' }
      })
    },
    /**
    * @desc 修改表单
    * @param {Object} params 表单对象
    */
    editForm: function (params) {
      let strJson = params.row.str_json
      this.$store.dispatch('setCurrentEditForm', JSON.parse(strJson))
      this.$router.push({
        name: 'editForm',
        params: { method: 'edit' }
      })
    },
    /**
    * @desc 配置表单
    * @param {Object} params 表单对象
    */
    editFormAttr: function (params) {
      let strJson = params.row.str_json
      this.$store.dispatch('setCurrentEditForm', JSON.parse(strJson))
      this.$router.push({
        name: 'editFormAttr'
      })
    },
    /**
    * @desc 删除表单
    * @param {Object} params 表单对象
    */
    deleteForm: function (params) {
      this.$Modal.confirm({
        title: '',
        content: '确认删除此表单？',
        onOk: () => {
          this.$api.post('/crm/ActionFormUtil/deleteByTableName.do', { tableName: params.row.title }, r => {
            if (r.data === '0') {
              this.$swal('删除表单失败', '', 'error')
            } else {
              this.$Message.success('删除表单成功')
              this.changePage(this.currentPage)
            }
          })
        },
        onCancel: () => {
        }
      })
    }
  },
  mounted () {
    this.changePage(this.currentPage)
  }
}
</script>
