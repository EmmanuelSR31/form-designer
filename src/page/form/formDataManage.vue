<template>
<div>
  <div class="location-con">
    <div class="location-btn">
      <a href="javascript:void(0)" @click="addFormData"><img src="assets/img/add.png">新增</a>
      <a href="javascript:void(0)" v-show="isAct === 0" @click="startFlow"><img src="assets/img/add.png">开启</a>
      <a href="javascript:void(0)" @click="changePage(1)"><img src="assets/img/refresh.png">刷新</a>
      <a href="javascript:void(0)" v-for="(item, index) in buttons" @click="runMethod(item.buttonFunction)" :key="index"><img :src="item.buttonAttr">{{item.buttonName}}</a>
    </div>
  </div>
  <div class="search-con" v-show="searchs.length > 0">
    <template v-for="(item, index) in searchs">
      <template v-if="index < 4">
        <template v-if="item.searchType === 'textbox'">
          <Input v-model="searchObj[item.searchId]" :placeholder="item.searchName" :key="index"></Input>
        </template>
        <template v-else-if="item.searchType === 'combobox'">
          <Select v-model="searchObj[item.searchId]" :key="index" :placeholder="item.searchName">
            <Option v-for="tmp in selectData[item.searchSelectId]" :value="tmp.id" :key="tmp.id">{{tmp.text}}</Option>
          </Select>
        </template>
        <template v-else-if="item.searchType === 'datebox'">
          <DatePicker type="date" v-model="searchObj[item.searchId]" :placeholder="item.searchName" :key="index"></DatePicker>
        </template>
        <template v-else-if="item.searchType === 'yearbox'">
          <DatePicker type="year" v-model="searchObj[item.searchId]" :placeholder="item.searchName" :key="index"></DatePicker>
        </template>
        <template v-else-if="item.searchType === 'monthbox'">
          <DatePicker type="month" v-model="searchObj[item.searchId]" :placeholder="item.searchName" :key="index"></DatePicker>
        </template>
      </template>
    </template>
    <div class="search-btn">
      <a href="javascript:void(0)" @click="search"><img src="assets/img/search.png"><br>搜索</a>
      <a href="javascript:void(0)" v-show="searchs.length > 4" @click="openSearch"><img src="assets/img/funnel.png"><br>筛选</a>
    </div>
  </div>
  <Row>
    <Col v-if="formObj.needTree === 'true'" :span="formObj.needTree === 'true' ? 8 : 0">
      <!-- <Tree :data="treeData" @on-select-change="setPid" ref="treeTable"></Tree> -->
      <tree-grid :items="treeData" :columns="treeColumns" @on-row-click="rowClick"></tree-grid>
    </Col>
    <Col :span="formObj.needTree === 'true' ? 16 : 24">
      <Table id="tableCon" :height="tableHeight" :loading="loading" :columns="columns" :data="data" highlight-row @on-current-change="setCurrentData"></Table>
      <div class="page-con">
        <Page :total="totalRows" :current="currentPage" :page-size="pageSize" placement="top" @on-change="changePage" show-total show-elevator></Page>
      </div>
    </Col>
  </Row>
  <Modal v-model="modalSearch" class="edit-form-con" title="筛选" :footer-hide="true" @on-ok="search">
    <div class="modal-field-con">
      <div :class="formClass">
        <Form :model="searchObj" :label-width="100">
          <FormItem :label="item.searchName" v-for="(item, index) in searchs" :key="index">
            <template v-if="item.searchType === 'textbox'">
              <Input v-model="searchObj[item.searchId]"></Input>
            </template>
            <template v-else-if="item.searchType === 'combobox'">
              <Select v-model="searchObj[item.searchId]" :key="index">
                <Option v-for="tmp in selectData[item.searchSelectId]" :value="tmp.id" :key="tmp.id">{{tmp.text}}</Option>
              </Select>
            </template>
            <template v-else-if="item.searchType === 'datebox'">
              <DatePicker type="date" v-model="searchObj[item.searchId]" :key="index"></DatePicker>
            </template>
            <template v-else-if="item.searchType === 'yearbox'">
              <DatePicker type="year" v-model="searchObj[item.searchId]" :key="index"></DatePicker>
            </template>
            <template v-else-if="item.searchType === 'monthbox'">
              <DatePicker type="month" v-model="searchObj[item.searchId]" :key="index"></DatePicker>
            </template>
          </FormItem>
        </Form>
        <div class="text-center form-btn-con"><button type="button" @click="search">搜索</button></div>
      </div>
    </div>
  </Modal>
</div>
</template>
<script>
import Util from '@/utils/index'
import editFormData from './editFormData.vue'
export default {
  data () {
    return {
      userName: '', // 用户名
      tableName: this.$route.params.tableName, // 表单名
      formObj: {}, // 表单对象
      loading: false, // 加载中
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页显示数
      totalRows: 0, // 数据总数
      columns: [], // 表格表头
      data: [], // 数据
      currentData: {}, // 选中数据
      selectData: this.$store.state.selectData, // 下拉数据
      treeColumns: [], // 树形表表头
      treeData: [], // 树形表数据
      pid: '', // 父ID
      isAct: 1, // 是否有流程，0为有，1为无
      key: '', // 流程key
      formAttrObj: {}, // 表单配置对象
      buttons: [], // 表单配置按钮
      searchs: [], // 表单配置搜索栏
      searchButtons: [], // 表单配置搜索按钮
      searchObj: {}, // 表单搜索对象
      modalSearch: false, // 筛选对话框是否显示
      searchFlag: false, // 搜索标志
      searchJson: {} // 搜索json
    }
  },
  computed: {
    tableHeight: function () { // 表格高度
      return document.body.clientHeight - 280
    },
    formClass () { // 表单排列样式
      let temp = 1
      if (this.searchs.length > 6) {
        temp = 2
      }
      return 'form-column-' + temp
    }
  },
  methods: {
    /**
    * @desc 改变页码
    * @param {Num} current 页码
    */
    changePage: async function (current) {
      this.loading = true
      this.currentPage = current
      if (this.formObj.needTree === 'true' && this.formObj.treeForm !== '') {
        this.$api.post('/crm/ActionFormUtil/getByTableNameAndPid.do', { rows: this.pageSize, page: this.currentPage, tableName: this.tableName, pid: this.pid }, r => {
          this.totalRows = r.data.total
          this.data = r.data.rows
          this.loading = false
        })
      } else {
        // if (this.searchFlag) {
          this.$api.post('crm/ActionFormUtil/getDataByCondition.do', { rows: this.pageSize, page: this.currentPage, jsonStr: JSON.stringify(this.searchJson) }, r => {
            console.log(r)
            this.totalRows = r.data.total
            this.data = r.data.rows
            this.loading = false
          })
        /* } else {
          if (this.isAct === 0) {
            this.$api.post('/crm/ActionFormUtil/getProcessRelFormDataByTableName.do', {rows: this.pageSize, page: this.currentPage, tableName: this.tableName}, r => {
              // console.log(r)
              this.totalRows = r.data.total
              this.data = r.data.rows
              this.loading = false
            })
          } else {
            this.$api.post('/crm/ActionFormUtil/getByTableName.do', {rows: this.pageSize, page: this.currentPage, tableName: this.tableName}, r => {
              this.totalRows = r.data.total
              this.data = r.data.rows
              this.loading = false
            })
          }
        } */
      }
    },
    /**
    * @desc 取数据流程状态
    * @param {Array} rows 数据
    */
    getStats: async function (rows) {
      for (let i = 0; i < rows.length; i++) {
        rows[i].msg = await this.getStat(rows[i])
      }
      this.data = rows
    },
    /**
    * @desc 取单条数据流程状态
    * @param {Object} row 数据
    */
    getStat: async function (row) {
      return new Promise((resolve) => {
        this.$api.post('/flow/getStats', { uuid: row.uuid }, r => {
          resolve(r.data.msg)
        })
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
    * @desc 选中数据
    * @param {Object} currentRow 选中的数据
    */
    setCurrentData: function (currentRow, oldCurrentRow) {
      this.currentData = currentRow
    },
    startFlow: function () {
      if (this.currentData.id !== undefined) {
        this.$Spin.show()
        this.$api.post('/flow/startProcessWithForm', { modelName: this.key, uuid: this.currentData.uuid, completeNow: true }, r => {
          this.$Spin.hide()
          this.$Message.success(r.data.msg)
          this.changePage(1)
        })
      } else {
        this.$swal('请选择一条数据', '', 'error')
      }
    },
    /**
    * @desc 新增数据
    */
    addFormData: function () {
      Util.getFormSelectDataForEdit(this.formObj.field, 'add', {})
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$layer.iframe({
        content: {
          content: editFormData, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            tableName: this.tableName,
            pid: this.pid,
            id: '',
            method: 'add'
          }
        },
        area: ['750px', document.body.clientHeight - 40 + 'px'],
        title: '新增',
        shade: true,
        shadeClose: false
      })
    },
    /**
    * @desc 修改数据
    * @param {Object} params 修改的数据对象
    */
    editFormData: async function (params) {
      Util.getFormSelectDataForEdit(this.formObj.field, 'edit', params.row)
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$store.dispatch('setCurrentEditFormData', params.row)
      this.$layer.iframe({
        content: {
          content: editFormData, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            tableName: this.tableName,
            pid: this.pid,
            id: params.row.id + '',
            method: 'edit'
          }
        },
        area: ['750px', document.body.clientHeight - 40 + 'px'],
        title: '修改',
        shade: true,
        shadeClose: false
      })
    },
    /**
    * @desc 查看数据
    * @param {Object} params 修改的数据对象
    */
    viewFormData: function (params) {
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$store.dispatch('setCurrentEditFormData', params.row)
      this.$layer.iframe({
        content: {
          content: editFormData, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            tableName: this.tableName,
            pid: this.pid,
            id: params.row.id + '',
            method: 'view'
          }
        },
        area: ['750px', document.body.clientHeight - 40 + 'px'],
        title: '查看',
        shade: true,
        shadeClose: false
      })
    },
    /**
    * @desc 树点击一行
    * @param {Object} data 点击的数据
    */
    rowClick: function (data, index, event) {
      this.pid = data.id
      this.currentPage = 1
      this.changePage(this.currentPage)
    },
    /**
    * @desc 初始化
    */
    initApi: async function () {
      this.data = []
      this.columns = []
      this.searchs = []
      this.searchFlag = false
      this.searchJson.title = this.tableName
      this.searchJson.searchs = []
      this.formObj = await this.getFormJson()
      console.log(this.formObj)
      Util.getFormSelectData(this.formObj.field)
      this.isAct = await this.getAct()
      console.log(this.isAct)
      let frameworkObj = await this.getFramework()
      if (frameworkObj !== null) {
        this.formAttrObj = frameworkObj
        console.log(this.formAttrObj)
        this.buttons = JSON.parse(this.formAttrObj.buttons)
        this.columns = Util.initColumns(this.formObj.field, true)
        this.searchs = JSON.parse(this.formAttrObj.searchs)
      } else {
        this.columns = Util.initColumns(this.formObj.field, true)
      }
      this.columns = Util.columnsAddAction(this.columns, this.tableName, this.formObj, this.changePage, this.currentPage, this.editFormData, this.viewFormData, this.isAct)
      if (this.isAct === 0) {
        this.columns = Util.columnsAddProcess(this.columns, this.viewProcessDetail)
      }
      if (this.formObj.needTree === 'true' && this.formObj.treeForm !== '') {
        this.$api.post('/pages/crminterface/getDatagridForJson.do', { tableName: this.formObj.treeForm }, r => {
          let treeField = r.data.treeField
          this.treeColumns = Util.initColumns(r.data.field, false)
          this.$api.post('/crm/ActionFormUtil/getByTableName.do', { rows: this.pageSize, page: this.currentPage, tableName: this.formObj.treeForm }, r => {
            this.treeData = Util.dataConvertForTree(r.data, treeField)
          })
        })
      } else {
        this.changePage(this.currentPage)
      }
      this.$api.post('/profFormRel/getInfo', { tableName: this.tableName }, r => {
        console.log(r)
        if (r.data.success) {
          this.key = r.data.obj.proDefKey
        }
      })
    },
    /**
    * @desc 取表单json
    */
    getFormJson: async function () {
      return new Promise((resolve) => {
        this.$api.post('/pages/crminterface/getDatagridForJson.do', { tableName: this.tableName }, r => {
          resolve(r.data)
        })
      })
    },
    /**
    * @desc 取表单是否有流程
    */
    getAct: async function () {
      return new Promise((resolve) => {
        this.$api.post('/profFormRel/isAct', { tableName: this.tableName }, r => {
          resolve(r.data)
        })
      })
    },
    /**
    * @desc 取表单配置
    */
    getFramework: async function () {
      return new Promise((resolve) => {
        this.$api.post('/pages/button/framework/get.do', { title: this.tableName }, r => {
          console.log(r)
          resolve(r.data.obj)
        })
      })
    },
    /**
    * @desc 打开筛选
    */
    openSearch: function () {
      this.modalSearch = true
    },
    /**
    * @desc 筛选搜索
    */
    search: function () {
      this.searchJson.searchs = []
      for (let iterator of this.searchs) {
        if (!Util.isEmpty(this.searchObj[iterator.searchId])) {
          iterator.val = this.searchObj[iterator.searchId]
          this.searchJson.searchs.push(iterator)
        }
      }
      this.modalSearch = false
      this.searchFlag = true
      this.changePage(1)
    },
    /**
    * @desc 查看流程详情
    * @param {Object} params 数据对象
    */
    viewProcessDetail: function (params) {
      /* this.$layer.iframe({
        content: {
          content: processDetail, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            uuid: params.row.uuid
          }
        },
        area: ['800px', document.body.clientHeight - 20 + 'px'],
        title: '查看流程详情',
        shade: true,
        shadeClose: false
      }) */
    },
    /**
    * @desc 调用方法
    * @param {String} str 方法名
    */
    runMethod: function (str) {
    }
  },
  mounted () {
    this.userName = this.$store.state.user.name
    this.initApi()
  },
  watch: {
    '$route' (to, from) { // 强制初始化
      this.tableName = to.params.tableName
      this.initApi()
    }
  }
}
</script>
<style lang="scss">
</style>
