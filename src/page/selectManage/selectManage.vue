<template>
<div>
  <Row>
    <Col span="8">
      <div class="table-search-con">
        <Button type="primary" @click="addSelect">新增</Button>
        <Button type="error" @click="delSelect">删除</Button>
      </div>
      <div class="bg-white padding10 left-tree">
        <Tree :data="treeData" @on-select-change="initOptions"></Tree>
      </div>
    </Col>
    <Col span="15" offset="1">
      <div class="table-search-con">
        <Button type="primary" @click="addOption">新增</Button>
      </div>
      <Table border :loading="loading" :columns="columns" :data="data" stripe></Table>
    </Col>
  </Row>
  <Modal v-model="modalSelect" :title="modalSelectTitle" @on-ok="saveSelect">
    <div class="modal-field-con">
      <div>
        <Form ref="formSelect" :model="selectObj" :label-width="120">
          <FormItem label="数据库名" class="whole-line-703">
            <Input v-model="selectObj.tableName"></Input>
          </FormItem>
          <FormItem label="标题" class="whole-line-703">
            <Input v-model="selectObj.title"></Input>
          </FormItem>
          <FormItem label="类型" class="whole-line-703">
            <Input v-model="selectObj.type"></Input>
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
        </Form>
      </div>
    </div>
  </Modal>
</div>
</template>
<script>
export default {
  data () {
    return {
      modalSelect: false, // 下拉对话框是否显示
      modalOption: false, // 选项对话框是否显示
      modalSelectTitle: '新增下拉', // 下拉对话框标题
      modalOptionTitle: '新增选项', // 选项对话框标题
      loading: false, // 载入中
      treeData: [ // 下拉表数据
        {
          title: '下拉列表',
          expand: true,
          children: []
        }
      ],
      columns: [ // 表格表头
        {
          type: 'index',
          title: '序列',
          width: 64,
          align: 'center'
        },
        {
          title: '选项名称',
          key: 'text'
        },
        {
          title: '操作',
          key: 'action',
          width: 126,
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
                    this.editOption(params)
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
                    this.deleteOption(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      data: [], // 选项数据
      selectObj: {}, // 下拉对象
      optionObj: {}, // 选项对象
      currentSelect: '' // 选中下拉表
    }
  },
  methods: {
    /**
    * @desc 取左侧下拉列表
    */
    init: function () {
      this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: 'table_manage_select' }, r => {
        if (r.data) {
          this.treeData[0].children = r.data.rows
        }
      })
    },
    /**
    * @desc 取选中下拉的选项数据
    * @param {Object} row 选中的下拉
    */
    initOptions: function (row) {
      this.loading = true
      let tableName = row[0].table_name
      this.currentSelect = tableName
      this.data = []
      this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: tableName }, r => {
        if (r.data) {
          this.data = r.data.rows
          this.loading = false
        }
      })
    },
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
      this.selectObj.tableName = 'select_' + this.selectObj.tableName
      this.selectObj.valueField = 'id'
      this.selectObj.textField = 'text'
      this.selectObj.type = this.selectObj.type + ''
      let infoStr = JSON.stringify(this.selectObj)
      this.$api.post('/pages/crminterface/creatSelectTable.do', { jsonStr: infoStr }, r => {
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
    * @desc 删除下拉
    */
    delSelect: function () {
      this.$Modal.confirm({
        title: '',
        content: '确认删除此下拉？',
        onOk: () => {
          this.$api.post('/pages/crminterface/deleteSelectTable.do', { tableName: this.currentSelect, type: '0' }, r => {
            if (r.data === '删除失败') {
              this.$swal('删除下拉失败', '', 'error')
            } else {
              this.$Message.success('删除下拉成功')
              this.init()
            }
          })
        },
        onCancel: () => {
        }
      })
    },
    /**
    * @desc 新增选项
    */
    addOption: function () {
      if (this.currentSelect === '') {
        this.$Message.warning('请先选择一条下拉表')
      } else {
        this.optionObj = {}
        this.modalOption = true
        this.modalOptionTitle = '新增选项'
      }
    },
    /**
    * @desc 修改选项
    * @param {Object} row 要修改的选项
    */
    editOption: function (row) {
      let temp = row.row
      delete temp._index
      delete temp.rowKey
      this.optionObj = temp
      this.modalOption = true
      this.modalOptionTitle = '修改选项'
    },
    /**
    * @desc 保存选项
    */
    saveOption: function () {
      this.optionObj.title = this.currentSelect
      this.optionObj.text = '\'' + this.optionObj.text + '\''
      let infoStr = JSON.stringify(this.optionObj)
      if (this.optionObj.id === undefined) {
        this.$api.post('/crm/ActionFormSelectUtil/Select/insert.do', { jsonStr: infoStr }, r => {
          if (r.data === 1) {
            this.$Message.success('新建选项成功')
            this.modalOption = false
            this.loading = true
            this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: this.currentSelect }, r => {
              if (r.data) {
                this.data = r.data.rows
                this.loading = false
              }
            })
          } else {
            this.$swal('新建选项失败', '', 'error')
          }
        })
      } else {
        this.$api.post('/crm/ActionFormSelectUtil/Select/update.do', { jsonStr: infoStr, id: this.optionObj.id }, r => {
          if (r.data === 1) {
            this.$Message.success('修改选项成功')
            this.modalOption = false
            this.loading = true
            this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: this.currentSelect }, r => {
              if (r.data) {
                this.data = r.data.rows
                this.loading = false
              }
            })
          } else {
            this.$swal('修改选项失败', '', 'error')
          }
        })
      }
    },
    /**
    * @desc 删除选项
    * @param {Object} row 要删除的选项
    */
    deleteOption: function (row) {
      this.$Modal.confirm({
        title: '',
        content: '确认删除此选项？',
        onOk: () => {
          this.$api.post('/crm/ActionFormSelectUtil/Select/delete.do', { tableName: this.currentSelect, id: row.row.id }, r => {
            if (r.data === '0') {
              this.$swal('删除选项失败', '', 'error')
            } else {
              this.$Message.success('删除选项成功')
              this.loading = true
              this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: this.currentSelect }, r => {
                if (r.data) {
                  this.data = r.data.rows
                  this.loading = false
                }
              })
            }
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
<style>
</style>
