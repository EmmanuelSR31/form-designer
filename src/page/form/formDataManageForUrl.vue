<template>
<div>
  <div class="table-search-con">
    <Button type="primary" @click="addFormData">新增</Button>
    <Button v-for="(item, index) in buttons" type="primary" :onclick="item.buttonFunction.replace(/&acute;/g, '\'')" :key="index">{{item.buttonName}}</Button>
    <span class="pull-right">
      <template v-for="(item, index) in searchs">
        <template v-if="item.searchCondition === 'isEmpty'">
          <Select v-model="searchObj[item.searchId]" :key="index">
            <Option value="is null">为空</Option>
            <Option value="is not null">不为空</Option>
          </Select>
        </template>
        <template v-else-if="item.searchType === 'textbox'">
          <Input v-model="searchObj[item.searchId]" style="width:100px;" :key="index"></Input>
        </template>
        <template v-else-if="item.searchType === 'combobox'">
          <Select v-model="searchObj[item.searchId]" :key="index">
            <Option v-for="tmp in selectData[item.searchField]" :value="tmp.id" :key="tmp.id">{{tmp.text}}</Option>
          </Select>
        </template>
        <template v-else-if="item.searchType === 'datebox'">
          <DatePicker type="date" v-model="searchObj[item.searchId]" style="width:100px" :key="index"></DatePicker>
        </template>
        <template v-else-if="item.searchType === 'monthbox'">
          <DatePicker type="month" v-model="searchObj[item.searchId]" style="width:100px" :key="index"></DatePicker>
        </template>
      </template>
      <Button v-for="(item, index) in searchButtons" type="primary" :onclick="item.buttonFunction.replace(/&acute;/g, '\'')" :key="index">{{item.buttonName}}</Button>
    </span>
  </div>
  <Table :height="tableHeight" border :loading="loading" :columns="columns" :data="data" stripe highlight-row @on-current-change="setCurrentData"></Table>
  <div class="page-con">
    <Page :total="totalRows" :current="currentPage" :page-size="pageSize" placement="top" @on-change="changePage" @on-page-size-change="changePageSize" show-elevator show-sizer></Page>
  </div>
</div>
</template>
<script>
import Util from '@/utils/index'
import processDetail from '../components/processDetail.vue'
export default {
  components: {
    processDetail
  },
  data () {
    return {
      tableName: this.$route.params.tableName, // 表单名
      formObj: {}, // 表单对象
      loading: false, // 加载中
      currentPage: 1, // 当前页码
      pageSize: 10, // 每页显示数
      totalRows: 0, // 数据总数
      columns: [],
      data: [],
      currentData: {}, // 选中数据
      selectData: this.$store.state.selectData, // 下拉数据
      isAct: 1, // 是否有流程
      formAttrObj: {}, // 表单配置对象
      buttons: [], // 表单配置按钮
      searchs: [], // 表单配置搜索栏
      searchButtons: [], // 表单配置搜索按钮
      searchObj: {} // 表单搜索对象
    }
  },
  computed: {
    tableHeight: function () { // 表格高度
      return document.body.clientHeight - 210
    }
  },
  methods: {
    changePage: function (current) { // 改变页码
      this.loading = true
      this.currentPage = current
      this.$api.post('/develop/url/getUrl.do', {rows: this.pageSize, page: this.currentPage, name: this.formAttrObj.data_url}, r => {
        this.totalRows = r.data.total
        this.data = r.data.rows
        console.log(this.columns)
        this.loading = false
      })
    },
    changePageSize: function (size) { // 改变每页显示数
      this.pageSize = size
      this.changePage(this.currentPage)
    },
    setCurrentData: function (currentRow, oldCurrentRow) { // 选中数据
      this.currentData = currentRow
    },
    addFormData: function () { // 新增数据
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$router.push({
        name: 'addFormData',
        params: {tableName: this.tableName, pid: pid}
      })
    },
    viewFormData: function (params) { // 查看数据
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$store.dispatch('setCurrentEditFormData', params.row)
      this.$router.push({
        name: 'viewFormData',
        params: {tableName: this.tableName, id: params.row.id}
      })
    },
    editFormData: function (params) { // 修改数据
      this.$store.dispatch('setCurrentEditForm', this.formObj)
      this.$store.dispatch('setCurrentEditFormData', params.row)
      this.$router.push({
        name: 'editFormData',
        params: {tableName: this.tableName, id: params.row.id}
      })
    },
    deleteFormData: function (params) { // 删除数据
      this.$Modal.confirm({
        title: '',
        content: '确认删除此数据？',
        onOk: () => {
          this.$api.post('/crm/ActionFormUtil/delete.do', {tableName: this.tableName, id: params.row.id}, r => {
            if (r.data === '0') {
              this.$Message.error('删除数据失败')
            } else {
              this.$Message.success('删除数据成功')
              this.changePage(this.currentPage)
            }
          })
        },
        onCancel: () => {
        }
      })
    },
    init: function () {
      this.data = []
      this.$api.post('/pages/crminterface/getDatagridForJson.do', {tableName: this.tableName}, r => {
        this.formObj = r.data
        this.$api.post('/profFormRel/isAct', {tableName: this.tableName}, r => {
          this.isAct = r.data
          this.$api.post('/pages/button/framework/get.do', {title: this.tableName}, r => {
            if (r.data.obj !== null) {
              this.formAttrObj = r.data.obj
              console.log(this.formAttrObj)
              this.columns = this.columns.concat(Util.columnsFormatter(JSON.parse(this.formAttrObj.columns)))
              this.buttons = JSON.parse(this.formAttrObj.buttons)
              this.searchs = JSON.parse(this.formAttrObj.searchs)
              this.searchButtons = JSON.parse(this.formAttrObj.search_buttons)
              eval(this.formAttrObj.js_code.replace(/&quot;/g, '"').replace(/换行符/g, '\n').replace(/&acute;/g, '\''))
            } else {
              this.columns = this.initColumns(this.formObj.field, true)
            }
            this.columns = this.columnsAddAction(this.columns)
            if (this.isAct === 0) {
              this.columns = this.columnsAddProcess(this.columns)
            }
            this.changePage(this.currentPage)
          })
        })
      })
    },
    initColumns: function (fields, flag) { // 生成表格列
      let columnsTemp = []
      if (flag) {
        columnsTemp.push({
          type: 'index',
          title: '序列',
          width: 50,
          align: 'center'
        })
      }
      for (let variable of fields) {
        if (variable.listDisplay === 'true' || variable.listDisplay === true) {
          if (variable.fieldType === 'tablebox') {
            columnsTemp.push({
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
            columnsTemp.push(Util.comboboxColumns(variable, this.selectData))
          } else if (variable.fieldType === 'filebox') {
            columnsTemp.push(Util.fileColumns(variable))
          } else {
            columnsTemp.push(Util.textColumns(variable))
          }
        }
      }
      return columnsTemp
    },
    columnsAddAction: function (columnsTemp) { // 表头加操作列
      columnsTemp.push({
        title: '操作',
        key: 'action',
        width: 150,
        align: 'center',
        render: (h, params) => {
          return h('div', [
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
                  this.viewFormData(params)
                }
              }
            }, '查看'),
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
                  this.editFormData(params)
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
                  this.deleteFormData(params)
                }
              }
            }, '删除')
          ])
        }
      })
      return columnsTemp
    },
    columnsAddProcess: function (columnsTemp) { // 表头加流程列
      columnsTemp.push({
        title: '流程进度',
        key: 'msg',
        width: 80,
        align: 'center'
      })
      columnsTemp.push({
        title: '流程详情',
        key: 'process',
        width: 80,
        align: 'center',
        render: (h, params) => {
          return h('Button', {
            props: {
              type: 'success',
              size: 'small'
            },
            on: {
              click: () => {
                this.viewProcessDetail(params)
              }
            }
          }, '流程详情')
        }
      })
      return columnsTemp
    },
    childTableManage: function (params, tableTitle) { // 管理子表数据
      this.$router.push({
        name: 'childTableManage',
        params: {tableName: tableTitle, recordID: params.row.uuid}
      })
    },
    viewProcessDetail: function (params) { // 查看流程详情
      this.$layer.open({
        type: 2,
        content: {
          content: processDetail, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            uuid: params.row.uuid
          }
        },
        shadeClose: false,
        shade: false,
        maxmin: true,
        area: ['600px', document.body.clientHeight - 20 + 'px'],
        title: '查看流程详情'
      })
    },
    search1: function () {
      let temp = ''
      for (let iterator of this.searchs) {
        if (!Util.isEmpty(this.searchObj[iterator.searchId])) {
          temp += ' and ' + iterator.searchField
          if (iterator.searchCondition === 'equal') {
            temp += ' =\' ' + this.searchObj[iterator.searchId] + '\''
          } else if (iterator.searchCondition === 'notEqual') {
            temp += ' <>\' ' + this.searchObj[iterator.searchId] + '\''
          } else if (iterator.searchCondition === 'contains') {
            temp += ' like \'' + this.searchObj[iterator.searchId] + '\''
          } else if (iterator.searchCondition === 'notContains') {
            temp += ' not like \'' + this.searchObj[iterator.searchId] + '\''
          } else if (iterator.searchCondition === 'isEmpty') {
            temp += ' ' + this.searchObj[iterator.searchId] + ' '
          } else if (iterator.searchCondition === 'greater') {
            temp += ' > \'' + this.searchObj[iterator.searchId] + '\''
          } else if (iterator.searchCondition === 'less') {
            temp += ' < \'' + this.searchObj[iterator.searchId] + '\''
          }
        }
      }
      return temp
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    '$route' (to, from) {
      this.tableName = to.params.tableName
      this.init()
    }
  }
}
</script>
