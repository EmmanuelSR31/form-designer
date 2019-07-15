<template>
<div>
  <Row>
    <Col span="5">
      <div class="table-search-con">
        <Button type="primary" @click="addDepartment">新增</Button>
        <Button type="primary" @click="editDepartment">修改</Button>
        <Button type="primary" @click="deleteDepartment">删除</Button>
      </div>
      <div class="bg-white padding10 left-tree">
        <Tree :data="departmentData" @on-select-change="initUsers"></Tree>
      </div>
    </Col>
    <Col span="18" offset="1">
      <div class="table-search-con">
        <Button type="primary" @click="addUser">新增</Button>
      </div>
      <Table border :loading="loading" :columns="columns" :data="data" stripe></Table>
    </Col>
  </Row>
  <Modal v-model="modalDepartment" :title="modalDepartmentTitle" :loading="departmentLoading" @on-ok="saveDepartment">
    <div class="modal-field-con">
      <div>
        <Form ref="departmentForm" :model="departmentObj" :rules="departmentValidate" :label-width="90">
          <FormItem label="部门名称" prop="text">
            <Input v-model="departmentObj.text"></Input>
          </FormItem>
          <!-- <FormItem label="部门类型">
            <Input v-model="departmentObj.type"></Input>
          </FormItem> -->
          <FormItem label="上级组织">
            <Input v-model="parentDepartment" readonly="true"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalUser" :title="modalUserTitle" :loading="userLoading" @on-ok="saveUser">
    <div class="modal-field-con">
      <div class="modal-field-2">
        <Form ref="userForm" :model="userObj" :rules="userValidate" :label-width="80">
          <FormItem label="用户名" prop="name">
            <Input v-model="userObj.name"></Input>
          </FormItem>
          <FormItem label="真实姓名">
            <Input v-model="userObj.actual_name"></Input>
          </FormItem>
          <FormItem label="密码" v-show="userObj.id === undefined" prop="password">
            <Input v-model="userObj.password"></Input>
          </FormItem>
          <FormItem label="电话">
            <Input v-model="userObj.phone_call"></Input>
          </FormItem>
          <FormItem label="邮件">
            <Input v-model="userObj.email"></Input>
          </FormItem>
          <FormItem label="部门">
            <Input v-model="selectDepartmentObj.text" readonly="true"></Input>
          </FormItem>
          <FormItem label="职位">
            <Select v-model="userObj.position_id">
              <Option v-for="item in positionList" :value="item.id" :key="item.id">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="状态">
            <Select v-model="userObj.status">
              <Option v-for="item in userStatusList" :value="item.id" :key="item.id">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="用户类型">
            <Select v-model="userObj.user_type">
              <Option value="0">请选择</Option>
              <Option value="1">销售</Option>
              <Option value="2">代理商</Option>
              <Option value="3">销售助理</Option>
            </Select>
          </FormItem>
          <FormItem v-show="userObj.user_type === '3'" label="所属销售">
            <Select v-model="userObj.sale_id">
              <Option value="">请选择</Option>
              <Option v-for="item in saleList" :value="item.id" :key="item.id">{{item.actual_name}}</Option>
            </Select>
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
      loading: false, // 载入中
      departmentData: [], // 部门数据
      selectDepartmentObj: {}, // 当前部门
      departmentObj: { type: '' }, // 部门对象
      data: [], // 用户数据
      userObj: {}, // 用户对象
      pid: '', // 所属部门
      parentDepartment: '', // 所属部门名称
      modalDepartment: false, // 部门对话框是否显示
      modalUser: false, // 用户对话框是否显示
      modalDepartmentTitle: '新增部门', // 部门对话框标题
      modalUserTitle: '新增用户', // 用户对话框标题
      positionList: [], // 用户职位列表
      userStatusList: [], // 用户状态列表
      columns: [ // 表格表头
        {
          type: 'index',
          title: '序列',
          width: 64,
          align: 'center'
        },
        {
          title: '用户名',
          key: 'name',
          align: 'center'
        },
        {
          title: '实际姓名',
          key: 'actual_name',
          align: 'center'
        },
        {
          title: '电话',
          key: 'phone_call',
          align: 'center'
        },
        {
          title: '邮箱',
          key: 'email',
          align: 'center'
        },
        {
          title: '注册时间',
          key: 'registration_date',
          align: 'center',
          render: (h, params) => {
            let temp = params.row.registration_date
            if (!Util.isEmpty(temp)) {
              temp = temp.substring(0, 10)
            }
            return h('div', temp)
          }
        },
        {
          title: '所在部门',
          key: 'dept',
          align: 'center'
        },
        {
          title: '职位',
          key: 'position',
          align: 'center'
        },
        {
          title: '状态',
          key: 'state',
          align: 'center'
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
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.editUser(params)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.resetPass(params)
                  }
                }
              }, '重置密码'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.deleteUser(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      departmentLoading: true, // 部门验证载入状态
      departmentValidate: { // 部门验证
        text: [
          { required: true, message: '请填写部门名称', trigger: 'blur' }
        ]
      },
      userLoading: true, // 用户验证载入状态
      userValidate: { // 用户验证
        name: [
          { required: true, message: '请填写用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请填写密码', trigger: 'blur' }
        ]
      },
      saleList: [] // 大唐销售下拉数据
    }
  },
  methods: {
    /**
    * @desc 取左侧部门列表
    */
    init: function () {
      this.$api.post('/system/user/department/getAll.do', {}, r => {
        console.log(r)
        if (r.data) {
          this.departmentData = Util.formatterTreeData(r.data)
        }
      })
      // 取销售下拉数据
      this.$api.post('/system/user/getSaleUser.do', {}, r => {
        this.saleList = r.data
      })
      this.data = []
    },
    /**
    * @desc 选择部门
    * @param {Array} row 选中的部门数组
    */
    initUsers: function (row) {
      this.selectDepartmentObj = row[0]
      this.pid = this.selectDepartmentObj.id
      this.initUsersData()
    },
    /**
    * @desc 取部门用户数据
    */
    initUsersData: function () {
      this.loading = true
      this.$api.post('/system/user/getUserByDepartment.do', { department: this.pid }, r => {
        if (r.data) {
          this.data = r.data.rows
        }
        this.loading = false
      })
    },
    /**
    * @desc 新增部门
    */
    addDepartment: function () {
      if (this.pid === '') {
        this.$Message.warning('请先选择一条数据')
      } else {
        this.modalDepartment = true
        this.modalDepartmentTitle = '新增部门'
        this.departmentObj = {}
        this.parentDepartment = this.selectDepartmentObj.text
      }
    },
    /**
    * @desc 修改部门
    */
    editDepartment: function () {
      if (this.pid === '') {
        this.$Message.warning('请先选择一条数据')
      } else {
        this.modalDepartment = true
        this.modalDepartmentTitle = '修改部门'
        this.departmentObj = this.selectDepartmentObj
        this.$api.post('/crm/ActionFormUtil/getDataById.do', { tableName: 'db_system_user_department', id: this.departmentObj.parent_id }, r => {
          if (r.data) {
            this.parentDepartment = r.data.rows[0].text
          }
        })
      }
    },
    /**
    * @desc 保存部门
    */
    saveDepartment: function () {
      this.$refs.departmentForm.validate((valid) => {
        if (valid) {
          if (this.departmentObj.id === undefined) {
            this.departmentObj.parent_id = this.pid
            let jsonStr = JSON.stringify(this.departmentObj)
            this.$api.post('/system/user/department/save.do', { data: jsonStr }, r => {
              if (r.data.result) {
                this.$Message.success('新增部门成功')
                this.modalDepartment = false
                this.init()
              } else {
                this.$swal('新增部门失败', '', 'error')
              }
              this.departmentLoading = false
            })
          } else {
            delete this.departmentObj.nodeKey
            delete this.departmentObj.selected
            delete this.departmentObj.title
            console.log(this.departmentObj)
            let jsonStr = JSON.stringify(this.departmentObj)
            this.$api.post('/system/user/department/save.do', { data: jsonStr }, r => {
              if (r.data.result) {
                this.$Message.success('修改部门成功')
                this.modalDepartment = false
                this.init()
              } else {
                this.$swal('修改部门失败', '', 'error')
              }
              this.departmentLoading = false
            })
          }
        } else {
          setTimeout(() => {
            this.departmentLoading = false
            this.$nextTick(() => {
              this.departmentLoading = true
            })
          }, 100)
        }
      })
    },
    /**
    * @desc 删除部门
    */
    deleteDepartment: function () {
      if (this.selectDepartmentObj.id !== undefined) {
        this.$Modal.confirm({
          title: '',
          content: '确认删除此部门？',
          onOk: () => {
            this.$api.post('/system/user/department/deleteById.do', { id: this.selectDepartmentObj.id }, r => {
              if (r.data.result) {
                this.$Message.success('删除部门成功')
                this.init()
              } else {
                this.$swal('删除部门失败', '', 'error')
              }
            })
          },
          onCancel: () => {
          }
        })
      }
    },
    /**
    * @desc 新增用户
    */
    addUser: function () {
      if (this.pid === '') {
        this.$Message.warning('请先选择部门')
      } else {
        this.userObj = {}
        this.modalUserTitle = '新增用户'
        this.userValidate.password = [
          { required: true, message: '请填写密码', trigger: 'blur' }
        ]
        this.modalUser = true
      }
    },
    /**
    * @desc 修改用户
    * @param {Object} row 要修改的用户对象
    */
    editUser: function (row) {
      this.userObj = row.row
      this.userObj.user_type = this.userObj.user_type + ''
      delete this.userObj._index
      delete this.userObj.orwKey
      this.modalUserTitle = '修改用户'
      delete this.userValidate.password
      this.modalUser = true
    },
    /**
    * @desc 保存用户
    */
    saveUser: function () {
      this.$refs.userForm.validate((valid) => {
        if (valid) {
          if (this.userObj.user_type !== '3') {
            delete this.userObj.sale_id
          } else {
            this.userObj.sale_id = Number(this.userObj.sale_id)
          }
          if (this.userObj.id === undefined) {
            this.userObj.department_id = this.selectDepartmentObj.id
            // this.userObj.registration_date = Util.getCurrentDate()
            let jsonStr = JSON.stringify(this.userObj)
            this.$api.post('/system/user/registe.do', { data: jsonStr }, r => {
              if (r.data.result) {
                this.$Message.success('新增用户成功')
                this.modalUser = false
                this.initUsersData()
                /* let u = r.data.describe.split(',')
                this.$api.post('/groups/asyncGroup', {}, r => {
                  this.$api.post('/groups/asyncUserForInt', {id: u[0], name: u[1], positionId: u[2]}, r => {
                    this.initUsersData()
                  })
                }) */
              } else {
                this.$swal('新增用户失败', '', 'error')
              }
              this.userLoading = false
            })
          } else {
            delete this.userObj._rowKey
            let jsonStr = JSON.stringify(this.userObj)
            this.$api.post('/system/user/update.do', { data: jsonStr }, r => {
              console.log(r)
              if (r.data.result) {
                this.$Message.success('修改用户成功')
                this.modalUser = false
                this.initUsersData()
              } else {
                this.$swal('修改用户失败', '', 'error')
              }
              this.userLoading = false
            })
          }
        } else {
          setTimeout(() => {
            this.userLoading = false
            this.$nextTick(() => {
              this.userLoading = true
            })
          }, 100)
        }
      })
    },
    /**
    * @desc 删除用户
    * @param {Object} row 要删除的用户对象
    */
    deleteUser: function (row) {
      this.$Modal.confirm({
          title: '',
          content: '确认删除此用户？',
          onOk: () => {
            this.$api.post('/system/user/deleteUserById.do', { id: row.row.id }, r => {
              if (r.data.result) {
                this.$Message.success('删除用户成功')
                this.initUsersData()
              } else {
                this.$swal('删除用户失败', '', 'error')
              }
            })
          },
          onCancel: () => {
          }
        })
    },
    /**
    * @desc 重置密码
    * @param {Object} row 要重置密码的用户对象
    */
    resetPass: function (row) {
      this.$api.post('/system/user/resetPassword.do', { id: row.row.id }, r => {
        if (r.data.result) {
          this.$Message.success('重置密码成功，密码为123456')
          this.initUsersData()
        } else {
          this.$swal('重置密码失败', '', 'error')
        }
      })
    }
  },
  mounted () {
    this.$api.post('/system/user/position/getAll.do', {}, r => {
      this.positionList = r.data
      console.log(this.positionList)
    })
    this.$api.post('/system/user/userStatus/getAll.do', {}, r => {
      this.userStatusList = r.data
    })
    this.$store.dispatch('setPositionList')
    this.$store.dispatch('setUserStatusList')
    this.init()
  }
}
</script>
