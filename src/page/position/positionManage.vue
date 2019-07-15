<template>
<div>
  <div class="table-search-con">
    <Button type="primary" @click="add">新增</Button>
  </div>
  <Table :height="tableHeight" border :loading="loading" :columns="columns" :data="data" stripe highlight-row></Table>
  <Modal v-model="modalFlag" :title="modalTitle" @on-ok="save">
    <div class="modal-field-con">
      <div>
        <Form ref="formPosition" :model="positionObj" :label-width="120">
          <FormItem label="职位名称" class="whole-line-703">
            <Input v-model="positionObj.text"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalRole" title="设置权限" @on-ok="saveRole">
    <div class="modal-field-con">
      <Tree :data="checkMenuData" ref="menuTree" show-checkbox></Tree>
    </div>
  </Modal>
</div>
</template>
<script>
import Util from '@/utils/index'
export default {
  data () {
    return {
      loading: false, // 加载中
      columns: [ // 表格表头
        {
          type: 'index',
          title: '序列',
          width: 100,
          align: 'center'
        },
        {
          title: '职位名称',
          key: 'text'
        },
        {
          title: '操作',
          key: 'action',
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'success',
                  size: 'small'
                },
                style: {
                  marginRight: '20px'
                },
                on: {
                  click: () => {
                    this.edit(params)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.setRole(params)
                  }
                }
              }, '设置权限')
            ])
          }
        }
      ],
      data: [], // 职位数据
      modalFlag: false, // 职位对话框是否显示
      modalTitle: '新增职位', // 职位对话框标题
      positionObj: {}, // 职位对象
      modalRole: false, // 职位权限对话框是否显示
      menuData: [], // 菜单数据
      checkMenuData: [], // 权限菜单数据
      checkMenuIds: [], // 选中菜单id
      checkMenuUrls: [] // 选中菜单url
    }
  },
  computed: {
    tableHeight: function () { // 表格高度
      return document.body.clientHeight - 160
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      this.getData()
    },
    /**
    * @desc 取职位数据
    */
    getData: function () {
      this.loading = true
      this.$api.post('/system/user/position/getAll.do', {}, r => {
        this.data = r.data
        this.loading = false
      })
      // 取菜单数据
      this.$api.post('/topJUI/index/getMenuList.do', {}, r => {
        console.log(r)
        if (r.data) {
          this.menuData = Util.formatterTreeData(r.data)
          this.checkMenuData = JSON.parse(JSON.stringify(this.menuData))
        }
      })
    },
    /**
    * @desc 新增职位
    */
    add: function () { // 新增
      this.positionObj = {}
      this.modalFlag = true
      this.modalTitle = '新增职位'
    },
    /**
    * @desc 修改职位
    * @param {Object} params 当前要修改的职位
    */
    edit: function (params) {
      let temp = params.row
      delete temp._index
      delete temp.rowKey
      this.positionObj = temp
      this.modalFlag = true
      this.modalTitle = '修改职位'
    },
    /**
    * @desc 保存
    */
    save: function () {
      if (this.positionObj.id === undefined) {
        this.positionObj.id = 0
        this.positionObj.activiti_uuid = ''
        this.$api.post('/system/user/position/save.do', { data: JSON.stringify(this.positionObj) }, r => {
          if (r.data.result) {
            this.$Message.success('新建职位成功')
            this.modalFlag = false
            this.getData()
          } else {
            this.$swal('新建职位失败', '', 'error')
          }
        })
      } else {
        this.$api.post('/system/user/position/update.do', { data: JSON.stringify(this.positionObj) }, r => {
          if (r.data.result) {
            this.$Message.success('修改职位成功')
            this.modalFlag = false
            this.getData()
          } else {
            this.$swal('修改职位失败', '', 'error')
          }
        })
      }
    },
    /**
    * @desc 设置职位权限
    * @param {Object} params 当前要设置的职位
    */
    setRole: function (params) {
      this.positionObj = params.row
      this.checkMenuData = JSON.parse(JSON.stringify(this.menuData))
      this.$api.post('/crm/ActionFormUtil/getDataById.do', { tableName: 'db_system_user_position', id: this.positionObj.id }, r => {
        let arr = []
        if (r.data.rows[0].remark.length > 0) {
          arr = r.data.rows[0].remark.split(',')
        }
        if (arr.length > 0) {
          let temp = this.checkMenuData[0].children
          for (let i = 0; i < temp.length; i++) {
            if (arr.indexOf(temp[i].id + '') !== -1) {
              if (temp[i].children.length > 0) {
                for (let j = 0; j < temp[i].children.length; j++) {
                  if (arr.indexOf(temp[i].children[j].id + '') !== -1) {
                    if (temp[i].children[j].children.length > 0) {
                      for (let z = 0; z < temp[i].children[j].children.length; z++) {
                        if (arr.indexOf(temp[i].children[j].children[z].id + '') !== -1) {
                          this.$set(temp[i].children[j].children[z], 'checked', true)
                        }
                      }
                    } else {
                      this.$set(temp[i].children[j], 'checked', true)
                    }
                  }
                }
              } else {
                this.$set(temp[i], 'checked', true)
              }
            }
          }
          console.log(this.checkMenuData)
        }
      })
      this.modalRole = true
    },
    /**
    * @desc 保存职位权限
    */
    saveRole: function () {
      let temp = this.$refs.menuTree.getCheckedAndIndeterminateNodes()
      // console.log(JSON.stringify(temp))
      console.log(temp)
      this.checkMenuIds = []
      this.checkMenuUrls = []
      this.getCheckMenuIds(temp)
      console.log(this.checkMenuIds.join(','))
      let obj = { id: this.positionObj.id, authorityStr: this.checkMenuIds.join(','), all_path: this.checkMenuUrls.join(',') }
      this.$api.post('/system/user/position/authorityConfigure.do', { jsonStr: JSON.stringify(obj) }, r => {
        console.log(r)
        if (r.data.result) {
          this.$Message.success(r.data.describe)
          this.modalRole = false
        } else {
          this.$swal('保存失败', '', 'error')
        }
      })
    },
    /**
    * @desc 取选中菜单id
    * @param {Array} arr 菜单数组
    */
    getCheckMenuIds: function (arr) {
      for (let iterator of arr) {
        if (iterator.checked || iterator.indeterminate) {
          this.checkMenuIds.push(iterator.id)
          this.checkMenuUrls.push(iterator.url)
        }
      }
      console.log(this.checkMenuIds)
    }
  },
  mounted () {
    this.init()
  }
}
</script>
