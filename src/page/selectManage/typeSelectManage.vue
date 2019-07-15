<template>
<div>
  <Row>
    <Col span="8">
      <div class="bg-white padding10">
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
      type: this.$route.params.type, // 分类
      modalOption: false, // 选项对话框是否显示
      modalOptionTitle: '新增选项', // 选项对话框标题
      loading: false, // 载入中
      treeData: [ // 下拉表数据
        {
          title: this.$route.params.type,
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
      optionObj: {}, // 选项对象
      currentSelect: '' // 选中下拉表
    }
  },
  methods: {
    /**
    * @desc 取左侧下拉列表
    */
    init: function () {
      this.treeData[0].title = this.type
      this.treeData[0].children = []
      this.$api.post('/pages/crminterface/getSelectList', { type: this.type }, r => {
        if (r.data) {
          this.treeData[0].children = r.data
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
  },
  watch: {
    '$route' (to, from) { // 强制初始化
      this.type = to.params.type
      this.init()
    }
  }
}
</script>
<style>
</style>
