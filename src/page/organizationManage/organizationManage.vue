<template>
<div>
  <Row>
    <Col span="8">
      <div class="table-search-con">
        <Button type="primary" @click="addOrg">新增</Button>
        <Button type="primary" @click="editOrg">修改</Button>
        <Button type="primary" @click="deleteOrg">删除</Button>
      </div>
      <div class="bg-white padding10">
        <Tree :data="data" @on-select-change="initOrg"></Tree>
      </div>
    </Col>
    <Col span="15" offset="1" class="form-column-2 org-form-con">
      <Form v-show="orgFormFlag" :model="orgObj" :label-width="80">
        <FormItem label="上级组织">
          <Input v-model="parentOrg" readonly></Input>
        </FormItem>
        <FormItem label="组织编码">
          <Input v-model="orgObj.orgCode" readonly></Input>
        </FormItem>
        <FormItem label="名称">
          <Input v-model="orgObj.title"></Input>
        </FormItem>
        <FormItem label="简称">
          <Input v-model="orgObj.sortName"></Input>
        </FormItem>
        <FormItem label="类型">
          <Select v-model="orgObj.type">
            <Option v-for="item in typeList" :value="item.id + ''" :key="item.id">{{item.text}}</Option>
          </Select>
        </FormItem>
        <FormItem label="法人">
          <Input v-model="orgObj.corporation"></Input>
        </FormItem>
        <FormItem label="电话">
          <Input v-model="orgObj.telephone"></Input>
        </FormItem>
        <FormItem label="委托代理人">
          <Input v-model="orgObj.agent"></Input>
        </FormItem>
        <FormItem label="传真">
          <Input v-model="orgObj.fax"></Input>
        </FormItem>
        <FormItem label="邮编">
          <Input v-model="orgObj.postCode"></Input>
        </FormItem>
        <FormItem label="地址">
          <Input v-model="orgObj.address"></Input>
        </FormItem>
        <FormItem label="网站">
          <Input v-model="orgObj.website"></Input>
        </FormItem>
        <FormItem label="备注" class="whole-line-703">
          <Input v-model="orgObj.note" type="textarea"></Input>
        </FormItem>
        <!-- <FormItem label="">
          <Checkbox v-model="orgObj.valid">有效性</Checkbox>
        </FormItem> -->
        <div class="clear"></div>
        <div class="text-center">
          <Button type="primary" @click="saveOrg">保 存</Button>
        </div>
      </Form>
    </Col>
  </Row>
</div>
</template>
<script>
export default {
  data () {
    return {
      loading: false, // 载入中
      data: [], // 组织数据
      orgObj: {}, // 当前组织
      pid: '', // 上级组织
      parentOrg: '', // 上级组织名称
      typeList: [], // 类型下拉数据
      orgFormFlag: false // 显示表单
    }
  },
  methods: {
    /**
    * @desc 取左侧组织列表
    */
    init: function () {
      this.data = []
      this.orgFormFlag = false
      this.$api.get('/Organization/getTreeList', {}, r => {
        // console.log(r)
        this.data = r.data
      })
      this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: 'select_organizationtype' }, r => {
        this.typeList = r.data.rows
      })
    },
    /**
    * @desc 选择组织
    * @param {Array} row 选中的组织数组
    */
    initOrg: function (row) {
      this.orgFormFlag = false
      this.orgObj = row[0]
      this.pid = this.orgObj.id
    },
    /**
    * @desc 新增组织
    */
    addOrg: function () {
      if (this.pid === '') {
        this.$swal('请先选择一条数据', '', 'error')
      } else {
        this.orgFormFlag = true
        this.parentOrg = this.orgObj.title
        this.orgObj = {}
        this.$api.get('/Organization/createCode', {}, r => {
          this.$set(this.orgObj, 'orgCode', r.data)
        })
      }
    },
    /**
    * @desc 修改组织
    */
    editOrg: function () {
      if (this.orgObj.id === undefined) {
        this.$swal('请先选择一条数据', '', 'error')
      } else {
        this.orgFormFlag = true
        if (this.orgObj.pid !== '0') {
          this.$api.get('/Organization/findById?id=' + this.orgObj.pid, {}, r => {
            if (r.data) {
              this.parentOrg = r.data.title
            }
          })
        }
      }
    },
    /**
    * @desc 保存组织
    */
    saveOrg: function () {
      if (this.orgObj.id === undefined) {
        let obj = JSON.parse(JSON.stringify(this.orgObj))
        obj.pid = this.pid
        obj.valid = ''
        this.$api.post('/Organization/add', obj, r => {
          if (r.data.code) {
            this.$Message.success('新增组织成功')
            this.init()
          } else {
            this.$swal('新增组织失败', '', 'error')
          }
        })
      } else {
        let obj = JSON.parse(JSON.stringify(this.orgObj))
        delete obj.children
        delete obj.createTime
        delete obj.expand
        delete obj.nodeKey
        delete obj.selected
        this.$api.put('/Organization/update', obj, r => {
          if (r.data.code) {
            this.$Message.success('修改组织成功')
            this.init()
          } else {
            this.$swal('修改组织失败', '', 'error')
          }
        })
      }
    },
    /**
    * @desc 删除组织
    */
    deleteOrg: function () {
      if (this.orgObj.id === undefined) {
        this.$swal('请先选择一条数据', '', 'error')
      } else {
        this.$Modal.confirm({
          title: '',
          content: '确认删除此组织？',
          onOk: () => {
            this.$api.delete('/Organization/delete?id=' + this.orgObj.id, {}, r => {
              if (r.data.code) {
                this.$Message.success('删除组织成功')
                this.init()
              } else {
                this.$swal('删除组织失败', '', 'error')
              }
            })
          },
          onCancel: () => {
          }
        })
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style lang="scss">
.org-form-con{
  padding: 30px 50px;
}
</style>
