<template>
<div>
  <Row>
    <Col span="6">
      <div class="table-search-con">
        <Button type="primary" @click="addSelect">新增</Button>
        <!-- <Button type="primary" @click="editFormData">修改</Button>
        <Button type="primary" @click="deleteFormData">删除</Button> -->
      </div>
      <Table :height="tableHeight" border :columns="treeColumns" :data="treeData" stripe highlight-row @on-row-click="initTable"></Table>
    </Col>
    <Col span="18">
      <div v-if="tableName !== ''" class="table-search-con">
        <Button type="primary" @click="addFormData">新增</Button>
        <Button type="primary" @click="editFormData">修改</Button>
        <Button type="primary" @click="deleteFormData">删除</Button>
      </div>
      <Tree :data="data" @on-select-change="setPid" ref="treeTable"></Tree>
    </Col>
  </Row>
  <Modal v-model="modalSelect" title="新增树形下拉" @on-ok="saveSelect">
    <div class="modal-field-con">
      <div>
        <Form ref="formSelect" :model="selectObj" :label-width="120">
          <FormItem label="数据库名" class="whole-line-703">
            <Input v-model="selectObj.tableName"></Input>
          </FormItem>
          <FormItem label="标题" class="whole-line-703">
            <Input v-model="selectObj.title"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalOption" :title="modalOptionTitle" @on-ok="saveOption">
    <div class="modal-field-con">
      <div>
        <Form ref="formOption" :model="optionObj" :label-width="120">
          <FormItem label="选项名" class="whole-line-703">
            <Input v-model="optionObj.text"></Input>
          </FormItem>
          <FormItem label="父级" class="whole-line-703">
            <Input v-model="pText" readonly></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
</div>
</template>
<script>
import Util from '@/utils/index'
export default {
  data () {
    return {
      modalSelect: false, // 下拉对话框是否显示
      modalOption: false, // 选项对话框是否显示
      modalOptionTitle: '新增选项', // 选项对话框标题
      selectObj: {}, // 下拉对象
      optionObj: {}, // 选项对象
      tableName: '', // 表单名
      formObj: {}, // 表单对象
      columns: [], // 表格表头
      data: [], // 数据
      treeColumns: [ // 树形表格表头
        {
          title: '表单名',
          key: 'title',
          align: 'center'
        }
      ],
      treeData: [], // 树形表数据
      treeListData: [], // 树形表列表数据
      pid: 0, // 父ID
      pText: '', // 父名称
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
    * @desc 新增下拉
    */
    addSelect: function () {
      this.selectObj = {}
      this.modalSelect = true
    },
    /**
    * @desc 保存下拉
    */
    saveSelect: function () {
      this.selectObj.tableName = 'select_tree_' + this.selectObj.tableName
      let infoStr = JSON.stringify(this.selectObj)
      this.$api.post('/pages/crminterface/creatTreeSelectTable.do', { jsonStr: infoStr }, r => {
        if (r.data === '创建成功') {
          this.$Message.success('新建下拉成功')
          this.modalSelect = false
          this.init()
        } else if (r.data === '表名已存在') {
          this.$swal('表名已存在，请更改', '', 'error')
        } else {
          this.$swal('新建下拉失败', '', 'error')
        }
      })
    },
    /**
    * @desc 新增数据
    */
    addFormData: function () {
      this.optionObj = {}
      if (this.pid === 0) {
        this.pText = ''
      } else {
        this.pText = this.treeListData.find(ele => ele.id === this.pid).title
      }
      this.modalOption = true
    },
    /**
    * @desc 修改数据
    */
    editFormData: function (data) {
      if (this.CurrentEditData.id !== undefined) {
        this.optionObj = this.CurrentEditData
        if (this.optionObj.pid === 0) {
          this.pText = ''
        } else {
          this.pText = this.treeListData.find(ele => ele.id === this.optionObj.pid).title
        }
        this.modalOption = true
      }
    },
    /**
    * @desc 保存选项
    */
    saveOption: function () {
      let obj = {}
      obj.title = this.tableName
      obj.field = []
      obj.field.push({ text: 'label', value: '\'' + this.optionObj.text + '\'' })
      if (this.optionObj.id === undefined) {
        obj.field.push({ text: 'pid', value: '\'' + this.pid + '\'' })
        this.$api.post('/crm/ActionFormUtil/insert.do', { jsonStr: JSON.stringify(obj) }, r => {
          if (r.data === 1) {
            this.$Message.success('新建选项成功')
            this.modalOption = false
            this.getTableData()
          } else {
            this.$swal('新建选项失败', '', 'error')
          }
        })
      } else {
        this.$api.post('/crm/ActionFormUtil/update.do', { jsonStr: JSON.stringify(obj), id: this.optionObj.id }, r => {
          if (r.data === 1) {
            this.$Message.success('修改选项成功')
            this.modalOption = false
            this.getTableData()
          } else {
            this.$swal('修改选项失败', '', 'error')
          }
        })
      }
    },
    /**
    * @desc 删除数据
    */
    deleteFormData: function (data) {
      if (this.CurrentEditData.id !== undefined) {
        this.$Modal.confirm({
          title: '',
          content: '确认删除此数据？',
          onOk: () => {
            this.$api.post('/crm/ActionFormUtil/delete.do', { tableName: this.tableName, id: this.CurrentEditData.id }, r => {
              if (r.data === '0') {
                this.$swal('删除数据失败', '', 'error')
              } else {
                this.$Message.success('删除数据成功')
                this.getTableData()
              }
            })
          },
          onCancel: () => {
          }
        })
      }
    },
    /**
    * @desc 获取树形表单
    */
    init: function () {
      this.treeData = []
      this.treeListData = []
      this.data = []
      this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: 'sys_tree_select_manage' }, r => {
        this.treeData = r.data.rows
      })
    },
    /**
    * @desc 点击表单
    * @param {Object} row 点击的表单
    */
    initTable: function (row, index) {
      this.tableName = row.table_name
      this.pid = 0
      this.getTableData()
    },
    /**
    * @desc 取表单数据
    * @param {Object} row 点击的表单
    */
    getTableData: function () {
      this.$api.post('/pages/crminterface/getTreeSelectTable', { tableName: this.tableName }, r => {
        let obj = {}
        this.treeListData = r.data
        obj.rows = r.data
        this.data = Util.dataConvertForTree(obj, '')
      })
    },
    /**
    * @desc 点击数据设置父ID
    * @param {Object} row 点击的数据
    */
    setPid: function (row) {
      this.pid = row[0].id
      this.CurrentEditData = row[0]
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
