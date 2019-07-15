<template>
<div class="form-con">
  <Form ref="formField" :model="urlObj" :label-width="120">
    <FormItem label="接口名(英文)">
      <Input v-model="urlObj.name"></Input>
    </FormItem>
    <FormItem label="汉语简称">
      <Input v-model="urlObj.descr"></Input>
    </FormItem>
    <FormItem label="返回类型">
      <Select v-model="urlObj.type">
        <Option value="easyui-combobox">easyui-combobox</Option>
        <Option value="easyui-datagrid">easyui-datagrid</Option>
        <Option value="Object">Object</Option>
        <Option value="List-Object">List-Object</Option>
      </Select>
    </FormItem>
    <FormItem label="数据来源">
      <Select v-model="urlObj.source">
        <Option value="本地">本地</Option>
        <Option value="ERP">ERP</Option>
      </Select>
    </FormItem>
    <FormItem label="SQL语句">
      <Input type="textarea" v-model="urlObj.sql_str" rows="5"></Input>
    </FormItem>
    <FormItem label="URL输入参数">
      <div class="table-search-con">
        <Button type="primary" @click="addIn">新增</Button>
      </div>
      <Table border :loading="inLoading" :columns="inColumns" :data="inData" stripe></Table>
    </FormItem>
    <FormItem label="URL输出参数">
      <div class="table-search-con">
        <Button type="primary" @click="addOut">新增</Button>
      </div>
      <Table border :loading="outLoading" :columns="outColumns" :data="outData" stripe></Table>
    </FormItem>
    <FormItem label="输出排序(SQL order by desc or inc)">
      <Input type="textarea" v-model="urlObj.arrange_str" rows="3"></Input>
    </FormItem>
  </Form>
  <div class="text-center">
    <Button class="mr100" @click="cancel">取消</Button>
    <Button type="primary" @click="save">保存</Button>
  </div>
  <Modal v-model="modalOut" :title="modalOutTitle" @on-ok="saveOut">
    <div class="modal-field-con">
      <div>
        <Form ref="formSelect" :model="outObj" :label-width="120">
          <FormItem label="名称" class="whole-line-703">
            <Input v-model="outObj.name"></Input>
          </FormItem>
          <FormItem label="类型" class="whole-line-703">
            <Input v-model="outObj.type"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalIn" :title="modalInTitle" @on-ok="saveIn">
    <div class="modal-field-con">
      <div>
        <Form ref="formSelect" :model="inObj" :label-width="120">
          <FormItem label="名称" class="whole-line-703">
            <Input v-model="inObj.name"></Input>
          </FormItem>
          <FormItem label="数据库字段" class="whole-line-703">
            <Input v-model="inObj.sql_para_name"></Input>
          </FormItem>
          <FormItem label="条件">
            <Select v-model="inObj.type">
              <Option v-for="(item, index) in urlInParaCondition" :value="item.value" :key="index">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="是否必须">
            <Select v-model="inObj.is_necessary">
              <Option value="false">否</Option>
              <Option value="true">是</Option>
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
  props: {
    pid: String, // 表单id
    urlObjStr: String, // url对象字符串
    method: String // 方法
  },
  data () {
    return {
      urlObj: {}, // url对象
      urlInParaCondition: this.$store.state.urlInParaCondition, // 链接输入参数条件列表
      modalOut: false, // 输出参数对话框是否显示
      modalOutTitle: '新增输出参数', // 输出参数对话框标题
      outMethod: '', // 输出参数方法名
      outLoading: false, // 输出参数载入中
      modalIn: false, // 输入参数对话框是否显示
      modalInTitle: '新增输入参数', // 输入参数对话框标题
      inMethod: '', // 输入参数方法名
      inLoading: false, // 输入参数载入中
      outColumns: [ // 输出参数表格表头
        {
          type: 'index',
          title: '序列',
          width: 64,
          align: 'center'
        },
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '类型',
          key: 'type'
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
                    this.editOut(params)
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
                    this.deleteOut(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      outData: [], // 输出参数数据
      outObj: {}, // 输出参数对象
      outIndex: '', // 输出参数对象位置
      inColumns: [ // 输入参数表格表头
        {
          type: 'index',
          title: '序列',
          width: 64,
          align: 'center'
        },
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '数据库字段',
          key: 'sql_para_name'
        },
        {
          title: '条件',
          key: 'type',
          render: (h, params) => {
            return h('div', Util.urlInParaTypeFormat(params.row.type))
          }
        },
        {
          title: '是否必须',
          key: 'is_necessary',
          render: (h, params) => {
            return h('div', Util.trueFalseFormat(params.row.is_necessary))
          }
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
                    this.editIn(params)
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
                    this.deleteIn(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      inData: [], // 输入参数数据
      inIndex: '', // 输出参数对象位置
      inObj: {} // 输入参数对象
    }
  },
  methods: {
    /**
    * @desc 保存
    */
    save: function () {
      let reg = /update|delete|exec|insert|drop/ig
      this.urlObj.sql_str = this.urlObj.sql_str.replace(reg, '')
      this.urlObj.arrange_str = this.urlObj.arrange_str.replace(reg, '')
      if (this.method === 'add') {
        this.urlObj.pid = this.pid
        this.urlObj.creater = ''
        this.urlObj.create_date = Util.getCurrentDate()
        let jsonStr = JSON.stringify(this.urlObj)
        let outStr = JSON.stringify(this.outData)
        let inStr = JSON.stringify(this.inData)
        this.$api.post('/develop/url/save.do', { url: jsonStr, UrlIutputPara: inStr, UrlOutputPara: outStr }, r => {
          if (r.data.result) {
            this.$Message.success('新增URL成功')
            this.$parent.initUrlsData()
            this.$parent.$layer.closeAll()
          } else {
            this.$Message.error('新增URL失败')
          }
        })
      } else {
        delete this.urlObj._rowKey
        delete this.urlObj.creater
        delete this.urlObj.create_date
        let jsonStr = JSON.stringify(this.urlObj)
        let outStr = JSON.stringify(this.outData)
        let inStr = JSON.stringify(this.inData)
        console.log(jsonStr)
        console.log(outStr)
        console.log(inStr)
        this.$api.post('/develop/url/update.do', { url: jsonStr, UrlIutputPara: inStr, UrlOutputPara: outStr }, r => {
          console.log(r.data)
          if (r.data.result) {
            this.$Message.success('修改URL成功')
            this.$parent.initUrlsData()
            this.$parent.$layer.closeAll()
          } else {
            this.$swal('修改URL失败', '', 'error')
          }
        })
      }
    },
    /**
    * @desc 关闭
    */
    cancel: function () {
      this.$parent.$layer.closeAll()
    },
    /**
    * @desc 新增输出参数
    */
    addOut: function () {
      this.outObj = {}
      this.modalOutTitle = '新增输出参数'
      this.outMethod = 'add'
      this.modalOut = true
    },
    /**
    * @desc 修改输出参数
    * @param {Object} row 要修改的输出参数
    */
    editOut: function (row) {
      this.outObj = row.row
      this.outIndex = row.index
      delete this.outObj._index
      delete this.outObj.rowKey
      this.modalOutTitle = '修改输出参数'
      this.outMethod = 'edit'
      this.modalOut = true
    },
    /**
    * @desc 保存输出参数
    */
    saveOut: function () {
      this.outObj.pid = this.urlObj.pid
      if (this.outMethod === 'add') {
        this.outData.push(this.outObj)
      } else if (this.outMethod === 'edit') {
        this.outData[this.outIndex] = this.outObj
        console.log(this.outData)
      }
    },
    /**
    * @desc 删除输出参数
    * @param {Object} row 要删除的输出参数
    */
    deleteOut: function (row) {
      let obj = row.row
      delete this.outObj._index
      delete this.outObj.rowKey
      this.outData.splice(this.outData.indexOf(obj), 1)
    },
    /**
    * @desc 新增输入参数
    */
    addIn: function () {
      this.inObj = {}
      this.modalInTitle = '新增输入参数'
      this.inMethod = 'add'
      this.modalIn = true
    },
    /**
    * @desc 修改输入参数
    * @param {Object} row 要修改的输入参数
    */
    editIn: function (row) {
      this.inObj = row.row
      this.inIndex = row.index
      delete this.inObj._index
      delete this.inObj.rowKey
      this.modalInTitle = '修改输入参数'
      this.inMethod = 'edit'
      this.modalIn = true
    },
    /**
    * @desc 保存输入参数
    */
    saveIn: function () { // 保存输入参数
      this.inObj.pid = this.urlObj.pid
      if (this.inMethod === 'add') {
        this.inData.push(this.inObj)
      } else if (this.inMethod === 'edit') {
        this.inData[this.inIndex] = this.inObj
      }
    },
    /**
    * @desc 删除输入参数
    * @param {Object} row 要删除的输入参数
    */
    deleteIn: function (row) {
      let obj = row.row
      delete this.inObj._index
      delete this.inObj.rowKey
      this.inData.splice(this.inData.indexOf(obj), 1)
    },
    /**
    * @desc 取输入输出参数
    */
    init: function () {
      this.urlObj = JSON.parse(this.urlObjStr)
      if (this.method === 'edit') {
        this.$api.post('/develop/url/findUrlIutputParaByPid.do', { pid: this.urlObj.id }, r => {
          this.inData = r.data
        })
        this.$api.post('/develop/url/findUrlOutputParaByPid.do', { pid: this.urlObj.id }, r => {
          this.outData = r.data
        })
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style>

</style>
