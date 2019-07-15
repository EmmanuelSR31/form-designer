<template>
<div>
  <div class="table-search-con">
    <Button type="primary" @click="addFormData">新增</Button>
    <!-- <Button type="primary" @click="editFormData">修改</Button>
    <Button type="primary" @click="deleteFormData">删除</Button> -->
  </div>
  <Row>
    <Col span="6">
      <Table :height="tableHeight" border :columns="treeColumns" :data="treeData" stripe highlight-row @on-row-click="initTable"></Table>
    </Col>
    <Col span="18">
      <!-- <Tree :data="data" @on-select-change="setPid" ref="treeTable"></Tree> -->
      <tree-grid :items="data" :columns="columns" @on-row-click="rowClick" @on-button-click="buttonClick"></tree-grid>
    </Col>
  </Row>
</div>
</template>
<script>
import Util from '@/utils/index'
import TreeGrid from '../../components/treeGrid2.0.vue'
export default {
  components: {
    TreeGrid
  },
  data () {
    return {
      tableName: '', // 表单名
      formObj: {}, // 表单对象
      columns: [], // 表格表头
      data: [], // 数据
      treeColumns: [ // 树形表格表头
        {
          title: '表单名',
          key: 'name',
          align: 'center'
        }
      ],
      treeData: [], // 树形表数据
      pid: 0, // 父ID
      CurrentEditData: {} // 选中数据
    }
  },
  computed: {
    tableHeight: function () { // 表格高度
      return document.body.clientHeight - 210
    }
  },
  methods: {
    /**
    * @desc 新增数据
    */
    addFormData: function () {
      if (this.tableName === '') {
        this.$Message.error('请先选择表单')
      } else {
        this.$store.dispatch('setCurrentEditForm', this.formObj)
        this.$router.push({
          name: 'addTreeFormData',
          params: { tableName: this.tableName, pid: this.pid }
        })
      }
    },
    /**
    * @desc 查看数据
    * @param {Object} data 要查看的数据
    */
    viewFormData: function (data) {
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$store.dispatch('setCurrentEditFormData', data)
      this.$router.push({
        name: 'viewTreeFormData',
        params: { tableName: this.tableName, id: data.id }
      })
    },
    /**
    * @desc 修改数据
    * @param {Object} data 要修改的数据
    */
    editFormData: function (data) {
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$store.dispatch('setCurrentEditFormData', data)
      this.$router.push({
        name: 'editTreeFormData',
        params: { tableName: this.tableName, id: data.id }
      })
    },
    /**
    * @desc 删除数据
    * @param {Object} data 要删除的数据
    */
    deleteFormData: function (data) {
      this.$Modal.confirm({
        title: '',
        content: '确认删除此数据？',
        onOk: () => {
          this.$api.post('/crm/ActionFormUtil/delete.do', { tableName: this.tableName, id: data.id }, r => {
            if (r.data === '0') {
              this.$Message.error('删除数据失败')
            } else {
              this.$swal('删除数据成功', '', 'error')
              this.init()
              this.data = []
            }
          })
        },
        onCancel: () => {
        }
      })
    },
    /**
    * @desc 获取树形表单
    */
    init: function () {
      this.$api.post('/crm/ActionFormUtil/getByType.do', { type: 2 }, r => {
        this.treeData = r.data
      })
    },
    /**
    * @desc 点击表单初始化表单数据
    * @param {Object} row 点击的表单
    */
    initTable: function (row, index) {
      this.formObj = JSON.parse(row.str_json)
      this.tableName = row.title
      this.columns = [
        {
          type: 'selection',
          width: '50',
          align: 'center'
        }
      ]
      this.initColumns(this.formObj.field)
      this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: this.tableName }, r => {
        this.data = Util.dataConvertForTreeGrid(r.data, this.formObj.treeField)
      })
    },
    /**
    * @desc 点击数据设置父ID
    * @param {Object} row 点击的数据
    */
    setPid: function (row) {
      this.pid = row[0].id
      this.CurrentEditData = row[0]
    },
    /**
    * @desc 点击按钮
    * @param {Object} data 数据对象
    * @param {String} text 按钮名
    */
    buttonClick: function (data, index, event, text) {
      if (text === '查看') {
        this.viewFormData(data)
      } else if (text === '修改') {
        this.editFormData(data)
      } else if (text === '删除') {
        this.deleteFormData(data)
      }
    },
    /**
    * @desc 点击数据设置父ID
    * @param {Object} data 点击的数据
    */
    rowClick: function (data, index, event) {
      this.pid = data.id
    },
    /* selectionClick: function (arr) { // 点击数据设置父ID
      this.pid = arr
    }, */
    /**
    * @desc 生成表格表头
    * @param {Array} fields 表单字段
    */
    initColumns: function (fields) {
      for (let variable of fields) {
        if (variable.listDisplay === 'true' || variable.listDisplay === true) {
          if (variable.fieldType === 'tablebox') {
            this.columns.push({
              title: variable.title,
              key: variable.text,
              width: 80,
              align: 'center',
              render: (h, params) => {
                return h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.childTableManage(params, variable.tableTitle)
                    }
                  }
                }, '查看详情')
              }
            })
          } else if (variable.fieldType === 'combobox') {
            this.columns.push(Util.comboboxColumns(variable, this.selectData))
          } else if (variable.fieldType === 'filebox') {
            this.columns.push(Util.fileColumns(variable))
          } else {
            this.columns.push({
              title: variable.title,
              key: variable.text
            })
          }
        }
      }
      this.columnsAddAction()
    },
    /**
    * @desc 表头加操作列
    */
    columnsAddAction: function () {
      this.columns.push({
        title: '操作',
        type: 'action',
        width: 150,
        align: 'center',
        actions: [{
          type: 'success',
          text: '查看'
        }, {
          type: 'primary',
          text: '修改'
        }, {
          type: 'error',
          text: '删除'
        }]
      })
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    '$route' (to, from) { // 强制初始化
      this.tableName = to.params.tableName
      this.init()
    }
  }
}
</script>
