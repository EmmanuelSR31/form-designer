<template>
  <div class="form-con">
    <Row>
      <Col span="22" offset="1">
        <Form :model="formAttrObj" :label-width="120">
          <FormItem label="数据库表名">
            <Input v-model="formObj.title" readonly></Input>
          </FormItem>
          <FormItem label="数据来源">
            <Select v-model="formAttrObj.data_url">
              <Option v-for="item in dataUrls" :value="item.name" :key="item.name">{{item.disc}}</Option>
            </Select>
          </FormItem>
          <FormItem label="表格表头">
            <div class="table-search-con">
              <Button type="primary" @click="columnsAdd">新增</Button>
            </div>
            <Table border :columns="columnsColumns" :data="formColumns" stripe></Table>
          </FormItem>
          <FormItem label="表格按钮">
            <div class="table-search-con">
              <Button type="primary" @click="buttonsAdd">新增</Button>
            </div>
            <Table border :columns="buttonsColumns" :data="formButtons" stripe></Table>
          </FormItem>
          <FormItem label="搜索栏">
            <div class="table-search-con">
              <Button type="primary" @click="searchsAdd">新增</Button>
            </div>
            <Table border :columns="searchsColumns" :data="formSearchs" stripe></Table>
          </FormItem>
          <FormItem label="搜索按钮">
            <div class="table-search-con">
              <Button type="primary" @click="searchButtonsAdd">新增</Button>
            </div>
            <Table border :columns="searchButtonsColumns" :data="formSearchButtons" stripe></Table>
          </FormItem>
          <FormItem label="JS代码">
            <codemirror v-model="jsCode" :options="cmOptions"></codemirror>
            <div class="tip-text">表格ID为“dg”,代码中请勿使用单引号。</div>
          </FormItem>
        </Form>
      </Col>
    </Row>
    <div class="text-center">
      <Button class="mr100" @click="cancel">取消</Button>
      <Button type="primary" @click="save">保存</Button>
    </div>
    <Modal v-model="modalColumnsAdd" title="新增表头">
      <div class="modal-field-con">
        <Form :model="columnsObj" :label-width="120">
          <FormItem label="表头名称" class="whole-line-703">
            <AutoComplete v-model="columnsObj.title" :data="formFieldsTitle"></AutoComplete>
          </FormItem>
          <FormItem label="表头id" class="whole-line-703">
            <AutoComplete v-model="columnsObj.field" :data="formFieldsText"></AutoComplete>
          </FormItem>
          <FormItem label="对齐方式" class="whole-line-703">
            <Select v-model="columnsObj.align">
              <Option v-for="item in columnAlign" :value="item.value" :key="item.value">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="formatter" class="whole-line-703">
            <Input v-model="columnsObj.formatter"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveColumnsAdd">保存</Button>
      </div>
    </Modal>
    <Modal v-model="modalColumnsEdit" title="修改表头">
      <div class="modal-field-con">
        <Form :model="columnsObj" :label-width="120">
          <FormItem label="表头名称" class="whole-line-703">
            <AutoComplete v-model="columnsObj.title" :data="formFieldsTitle"></AutoComplete>
          </FormItem>
          <FormItem label="表头id" class="whole-line-703">
            <AutoComplete v-model="columnsObj.field" :data="formFieldsText"></AutoComplete>
          </FormItem>
          <FormItem label="对齐方式" class="whole-line-703">
            <Select v-model="columnsObj.align">
              <Option v-for="item in columnAlign" :value="item.value" :key="item.value">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="formatter" class="whole-line-703">
            <Input v-model="columnsObj.formatter"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveColumnsEdit">保存</Button>
      </div>
    </Modal>
    <Modal v-model="modalButtonsAdd" title="新增按钮">
      <div class="modal-field-con">
        <Form :model="buttonsObj" :label-width="120">
          <FormItem label="按钮名称" class="whole-line-703">
            <Input v-model="buttonsObj.buttonName"></Input>
          </FormItem>
          <FormItem label="按钮id" class="whole-line-703">
            <Input v-model="buttonsObj.buttonId"></Input>
          </FormItem>
          <FormItem label="图标属性" class="whole-line-703">
            <Input v-model="buttonsObj.buttonAttr"></Input>
          </FormItem>
          <FormItem label="方法名" class="whole-line-703">
            <Input v-model="buttonsObj.buttonFunction"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveButtonsAdd">保存</Button>
      </div>
    </Modal>
    <Modal v-model="modalButtonsEdit" title="修改按钮">
      <div class="modal-field-con">
        <Form :model="buttonsObj" :label-width="120">
          <FormItem label="按钮名称" class="whole-line-703">
            <Input v-model="buttonsObj.buttonName"></Input>
          </FormItem>
          <FormItem label="按钮id" class="whole-line-703">
            <Input v-model="buttonsObj.buttonId"></Input>
          </FormItem>
          <FormItem label="图标属性" class="whole-line-703">
            <Input v-model="buttonsObj.buttonAttr"></Input>
          </FormItem>
          <FormItem label="方法名" class="whole-line-703">
            <Input v-model="buttonsObj.buttonFunction"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveButtonsEdit">保存</Button>
      </div>
    </Modal>
    <Modal v-model="modalSearchsAdd" title="新增搜索栏">
      <div class="modal-field-con">
        <Form :model="searchsObj" :label-width="120">
          <FormItem label="输入名" class="whole-line-703">
            <Input v-model="searchsObj.searchName"></Input>
          </FormItem>
          <FormItem label="输入id" class="whole-line-703">
            <AutoComplete v-model="searchsObj.searchId" :data="formFieldsText"></AutoComplete>
          </FormItem>
          <FormItem label="关联字段" class="whole-line-703">
            <AutoComplete v-model="searchsObj.searchField" :data="formFieldsText" @on-select="selectSearchField"></AutoComplete>
          </FormItem>
          <FormItem label="输入属性" class="whole-line-703">
            <Input v-model="searchsObj.searchAttr"></Input>
          </FormItem>
          <FormItem label="输入类型" class="whole-line-703">
            <Select v-model="searchsObj.searchType">
              <Option v-for="item in searchInputType" :value="item.type" :key="item.type">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="搜索条件" class="whole-line-703">
            <Select v-model="searchsObj.searchCondition">
              <Option v-for="item in searchCondition" :value="item.value" :key="item.value">{{item.text}}</Option>
            </Select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveSearchsAdd">保存</Button>
      </div>
    </Modal>
    <Modal v-model="modalSearchsEdit" title="修改搜索栏">
      <div class="modal-field-con">
        <Form :model="searchsObj" :label-width="120">
          <FormItem label="输入名" class="whole-line-703">
            <Input v-model="searchsObj.searchName"></Input>
          </FormItem>
          <FormItem label="输入id" class="whole-line-703">
            <AutoComplete v-model="searchsObj.searchId" :data="formFieldsText"></AutoComplete>
          </FormItem>
          <FormItem label="关联字段" class="whole-line-703">
            <AutoComplete v-model="searchsObj.searchField" :data="formFieldsText" @on-select="selectSearchField"></AutoComplete>
          </FormItem>
          <FormItem label="输入属性" class="whole-line-703">
            <Input v-model="searchsObj.searchAttr"></Input>
          </FormItem>
          <FormItem label="输入类型" class="whole-line-703">
            <Select v-model="searchsObj.searchType">
              <Option v-for="item in searchInputType" :value="item.type" :key="item.type">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem label="搜索条件" class="whole-line-703">
            <Select v-model="searchsObj.searchCondition">
              <Option v-for="item in searchCondition" :value="item.value" :key="item.value">{{item.text}}</Option>
            </Select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveSearchsEdit">保存</Button>
      </div>
    </Modal>
    <Modal v-model="modalSearchButtonsAdd" title="新增搜索按钮">
      <div class="modal-field-con">
        <Form :model="searchButtonsObj" :label-width="120">
          <FormItem label="按钮名称" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonName"></Input>
          </FormItem>
          <FormItem label="按钮id" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonId"></Input>
          </FormItem>
          <FormItem label="图标属性" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonAttr"></Input>
          </FormItem>
          <FormItem label="方法名" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonFunction"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveSearchButtonsAdd">保存</Button>
      </div>
    </Modal>
    <Modal v-model="modalSearchButtonsEdit" title="修改搜索按钮">
      <div class="modal-field-con">
        <Form :model="searchButtonsObj" :label-width="120">
          <FormItem label="按钮名称" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonName"></Input>
          </FormItem>
          <FormItem label="按钮id" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonId"></Input>
          </FormItem>
          <FormItem label="图标属性" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonAttr"></Input>
          </FormItem>
          <FormItem label="方法名" class="whole-line-703">
            <Input v-model="searchButtonsObj.buttonFunction"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="saveSearchButtonsEdit">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import Util from '@/utils/index'
export default {
  data () {
    return {
      formObj: this.$store.state.currentEditForm, // 表单对象
      formFields: [], // 表单字段
      formAttrObj: { listUrl: '' }, // 表单配置对象
      dataUrls: [], // 数据来源url
      columnAlign: this.$store.state.columnAlign, // 表头对齐方式
      searchInputType: this.$store.state.searchInputType, // 搜索输入框类型
      searchCondition: this.$store.state.searchCondition, // 搜索条件
      columnsColumns: [ // 表单表头的表格表头
        { title: '表头名称', key: 'title', align: 'center' },
        { title: '表头id', key: 'field', align: 'center' },
        {
          title: '对齐方式',
          key: 'align',
          align: 'center',
          render: (h, params) => {
            let temp = params.row.align
            for (let i = 0; i < this.columnAlign.length; i++) {
              if (temp === this.columnAlign[i].value) {
                temp = this.columnAlign[i].text
                break
              }
            }
            return h('div', temp)
          }
        },
        { title: 'formatter', key: 'formatter', align: 'center' },
        {
          title: '操作',
          key: 'action',
          width: 185,
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
                    this.columnsEdit(params)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.columnsDelete(params)
                  }
                }
              }, '删除'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: params.index > 0 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.columnsUp(params)
                  }
                }
              }, '上移'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  display: params.index < this.formColumns.length - 1 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.columnsDown(params)
                  }
                }
              }, '下移')
            ])
          }
        }
      ],
      formColumns: [], // 表单表头数据
      modalColumnsAdd: false, // 新增表单表头对话框是否显示
      modalColumnsEdit: false, // 修改表单表头对话框是否显示
      columnsObj: {}, // 正在编辑的表单表头
      buttonsColumns: [ // 表单按钮的表格表头
        { title: '按钮名称', key: 'buttonName', align: 'center' },
        { title: '按钮id', key: 'buttonId', align: 'center' },
        { title: '图标属性', key: 'buttonAttr', align: 'center' },
        { title: '方法名', key: 'buttonFunction', align: 'center' },
        {
          title: '操作',
          key: 'action',
          width: 185,
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
                    this.buttonsEdit(params)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.buttonsDelete(params)
                  }
                }
              }, '删除'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: params.index > 0 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.buttonsUp(params)
                  }
                }
              }, '上移'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  display: params.index < this.formButtons.length - 1 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.buttonsDown(params)
                  }
                }
              }, '下移')
            ])
          }
        }
      ],
      formButtons: [], // 表单按钮数据
      modalButtonsAdd: false, // 新增表单按钮对话框是否显示
      modalButtonsEdit: false, // 修改表单按钮对话框是否显示
      buttonsObj: {}, // 正在编辑的表单按钮
      searchsColumns: [ // 表单搜索的表格表头
        { title: '输入名', key: 'searchName', align: 'center' },
        { title: '输入id', key: 'searchId', align: 'center' },
        { title: '关联字段', key: 'searchField', align: 'center' },
        { title: '输入属性', key: 'searchAttr', align: 'center' },
        { title: '输入类型', key: 'searchType', align: 'center' },
        { title: '搜索条件', key: 'searchCondition', align: 'center' },
        {
          title: '操作',
          key: 'action',
          width: 185,
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
                    this.searchsEdit(params)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.searchsDelete(params)
                  }
                }
              }, '删除'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: params.index > 0 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.searchsUp(params)
                  }
                }
              }, '上移'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  display: params.index < this.formSearchs.length - 1 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.searchsDown(params)
                  }
                }
              }, '下移')
            ])
          }
        }
      ],
      modalSearchsAdd: false, // 新增表单搜索对话框是否显示
      modalSearchsEdit: false, // 修改表单搜索对话框是否显示
      searchsObj: {}, // 正在编辑的表单搜索
      formSearchs: [], // 表单搜索数据
      searchButtonsColumns: [ // 表单搜索按钮的表格表头
        { title: '按钮名称', key: 'buttonName', align: 'center' },
        { title: '按钮id', key: 'buttonId', align: 'center' },
        { title: '图标属性', key: 'buttonAttr', align: 'center' },
        { title: '方法名', key: 'buttonFunction', align: 'center' },
        {
          title: '操作',
          key: 'action',
          width: 185,
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
                    this.searchButtonsEdit(params)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.searchButtonsDelete(params)
                  }
                }
              }, '删除'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: params.index > 0 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.searchButtonsUp(params)
                  }
                }
              }, '上移'),
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  display: params.index < this.formSearchButtons.length - 1 ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.searchButtonsDown(params)
                  }
                }
              }, '下移')
            ])
          }
        }
      ],
      formSearchButtons: [], // 表单搜索按钮数据
      modalSearchButtonsAdd: false, // 新增表单搜索按钮对话框是否显示
      modalSearchButtonsEdit: false, // 修改表单搜索按钮对话框是否显示
      searchButtonsObj: {}, // 正在编辑的表单搜索按钮
      jsCode: '', // JS代码
      cmOptions: { // codemirror配置
        tabSize: 2,
        mode: 'text/javascript',
        theme: 'ambiance',
        lineNumbers: true
      }
    }
  },
  methods: {
    /* columnsEditDone: function (newValue, oldValue, rowIndex, rowData, field) { // 表格表头编辑完
      this.formColumns[rowIndex][field] = newValue
    }, */
    /**
    * @desc 新增表单表头
    */
    columnsAdd: function () {
      this.columnsObj = {}
      this.modalColumnsAdd = true
    },
    /**
    * @desc 保存新增表单表头
    */
    saveColumnsAdd: function () {
      this.formColumns.push(this.columnsObj)
      this.modalColumnsAdd = false
    },
    /**
    * @desc 修改表单表头
    * @param {Object} params 当前要修改的表单表头对象
    */
    columnsEdit: function (params) {
      this.columnsObj = params.row
      this.modalColumnsEdit = true
    },
    /**
    * @desc 保存修改表单表头
    */
    saveColumnsEdit: function () {
      this.modalColumnsEdit = false
      let i = this.columnsObj._index
      delete this.columnsObj._index
      delete this.columnsObj._rowKey
      this.formColumns[i] = this.columnsObj
    },
    /**
    * @desc 删除表单表头
    * @param {Object} params 当前要删除的表单表头对象
    */
    columnsDelete: function (params) {
      this.formColumns.splice(params.index, 1)
    },
    /**
    * @desc 表单表头上移
    * @param {Object} params 当前要上移的表单表头对象
    */
    columnsUp: function (params) {
      if (params.index > 0) {
        let temp = this.formColumns[params.index]
        this.formColumns.splice(params.index, 1)
        this.formColumns.splice(params.index - 1, 0, temp)
      }
    },
    /**
    * @desc 表单表头下移
    * @param {Object} params 当前要下移的表单表头对象
    */
    columnsDown: function (params) {
      if (params.index < this.formColumns.length - 1) {
        let temp = this.formColumns[params.index]
        this.formColumns.splice(params.index, 1)
        this.formColumns.splice(params.index + 1, 0, temp)
      }
    },
    /**
    * @desc 新增表单按钮
    */
    buttonsAdd: function () {
      this.buttonsObj = {}
      this.modalButtonsAdd = true
    },
    /**
    * @desc 保存新增表单按钮
    */
    saveButtonsAdd: function () {
      this.formButtons.push(this.buttonsObj)
      this.modalButtonsAdd = false
    },
    /**
    * @desc 修改表单按钮
    * @param {Object} params 当前要修改的表单按钮对象
    */
    buttonsEdit: function (params) {
      this.buttonsObj = params.row
      this.modalButtonsEdit = true
    },
    /**
    * @desc 保存修改表单按钮
    */
    saveButtonsEdit: function () {
      this.modalButtonsEdit = false
      let i = this.buttonsObj._index
      delete this.buttonsObj._index
      delete this.buttonsObj._rowKey
      this.formButtons[i] = this.buttonsObj
    },
    /**
    * @desc 删除表单按钮
    * @param {Object} params 当前要删除的表单按钮对象
    */
    buttonsDelete: function (params) {
      this.formButtons.splice(params.index, 1)
    },
    /**
    * @desc 表单按钮上移
    * @param {Object} params 当前要上移的表单按钮对象
    */
    buttonsUp: function (params) {
      if (params.index > 0) {
        let temp = this.formButtons[params.index]
        this.formButtons.splice(params.index, 1)
        this.formButtons.splice(params.index - 1, 0, temp)
      }
    },
    /**
    * @desc 表单按钮下移
    * @param {Object} params 当前要下移的表单按钮对象
    */
    buttonsDown: function (params) {
      if (params.index < this.formButtons.length - 1) {
        let temp = this.formButtons[params.index]
        this.formButtons.splice(params.index, 1)
        this.formButtons.splice(params.index + 1, 0, temp)
      }
    },
    /**
    * @desc 新增表单搜索
    */
    searchsAdd: function () {
      this.searchsObj = {}
      this.modalSearchsAdd = true
    },
    /**
    * @desc 保存新增表单搜索
    */
    saveSearchsAdd: function () {
      this.formSearchs.push(this.searchsObj)
      this.modalSearchsAdd = false
    },
    /**
    * @desc 修改表单搜索
    * @param {Object} params 当前要修改的表单搜索对象
    */
    searchsEdit: function (params) {
      this.searchsObj = params.row
      this.modalSearchsEdit = true
    },
    /**
    * @desc 选择搜索关联字段
    * @param {String} val 选择字段
    */
    selectSearchField: function (val) {
      let temp = this.formFields.find(ele => ele.text === val)
      if (!Util.isEmpty(temp)) {
        this.searchsObj.searchSelectId = temp.selectID
      }
    },
    /**
    * @desc 保存修改表单搜索
    */
    saveSearchsEdit: function () {
      this.modalSearchsEdit = false
      let i = this.searchsObj._index
      delete this.searchsObj._index
      delete this.searchsObj._rowKey
      this.formSearchs[i] = this.searchsObj
    },
    /**
    * @desc 删除表单搜索
    * @param {Object} params 当前要删除的表单搜索对象
    */
    searchsDelete: function (params) {
      this.formSearchs.splice(params.index, 1)
    },
    /**
    * @desc 表单搜索上移
    * @param {Object} params 当前要上移的表单搜索对象
    */
    searchsUp: function (params) {
      if (params.index > 0) {
        let temp = this.formSearchs[params.index]
        this.formSearchs.splice(params.index, 1)
        this.formSearchs.splice(params.index - 1, 0, temp)
      }
    },
    /**
    * @desc 表单搜索下移
    * @param {Object} params 当前要下移的表单搜索对象
    */
    searchsDown: function (params) {
      if (params.index < this.formSearchs.length - 1) {
        let temp = this.formSearchs[params.index]
        this.formSearchs.splice(params.index, 1)
        this.formSearchs.splice(params.index + 1, 0, temp)
      }
    },
    /**
    * @desc 新增表单搜索按钮
    */
    searchButtonsAdd: function () {
      this.searchButtonsObj = {}
      this.modalSearchButtonsAdd = true
    },
    /**
    * @desc 保存新增表单搜索按钮
    */
    saveSearchButtonsAdd: function () {
      this.formSearchButtons.push(this.searchButtonsObj)
      this.modalSearchButtonsAdd = false
    },
    /**
    * @desc 修改表单搜索按钮
    * @param {Object} params 当前要修改的表单搜索按钮对象
    */
    searchButtonsEdit: function (params) {
      this.searchButtonsObj = params.row
      this.modalSearchButtonsEdit = true
    },
    /**
    * @desc 保存修改表单搜索按钮
    */
    saveSearchButtonsEdit: function () {
      this.modalSearchButtonsEdit = false
      let i = this.searchButtonsObj._index
      delete this.searchButtonsObj._index
      delete this.searchButtonsObj._rowKey
      this.formSearchButtons[i] = this.searchButtonsObj
    },
    /**
    * @desc 删除表单搜索按钮
    * @param {Object} params 当前要删除的表单搜索按钮对象
    */
    searchButtonsDelete: function (params) {
      this.formSearchButtons.splice(params.index, 1)
    },
    /**
    * @desc 表单搜索按钮上移
    * @param {Object} params 当前要上移的表单搜索按钮对象
    */
    searchButtonsUp: function (params) {
      if (params.index > 0) {
        let temp = this.formSearchButtons[params.index]
        this.formSearchButtons.splice(params.index, 1)
        this.formSearchButtons.splice(params.index - 1, 0, temp)
      }
    },
    /**
    * @desc 表单搜索按钮下移
    * @param {Object} params 当前要下移的表单搜索按钮对象
    */
    searchButtonsDown: function (params) {
      if (params.index < this.formSearchButtons.length - 1) {
        let temp = this.formSearchButtons[params.index]
        this.formSearchButtons.splice(params.index, 1)
        this.formSearchButtons.splice(params.index + 1, 0, temp)
      }
    },
    /**
    * @desc 返回
    */
    cancel: function () {
      this.$router.go(-1)
    },
    /**
    * @desc 保存
    */
    save: function () {
      this.$Spin.show()
      this.formAttrObj.title = this.formObj.title
      this.formAttrObj.columns = this.formColumns
      this.formAttrObj.buttons = this.formButtons
      this.formAttrObj.searchs = this.formSearchs
      this.formAttrObj.search_buttons = this.formSearchButtons
      for (let iterator of this.formAttrObj.buttons) {
        iterator.buttonFunction = iterator.buttonFunction.replace(/'/g, '&acute;')
      }
      for (let iterator of this.formAttrObj.search_buttons) {
        iterator.buttonFunction = iterator.buttonFunction.replace(/'/g, '&acute;')
      }
      delete this.formAttrObj.js_code
      let infoStr = JSON.stringify(this.formAttrObj)
      console.log(infoStr)
      this.$api.post('/pages/button/framework/create.do', { jsonStr: infoStr, jsCode: this.jsCode.replace(/"/g, '&quot;').replace(/\n/g, '换行符').replace(/'/g, '&acute;') }, r => {
        console.log(r)
        this.$Spin.hide()
        if (r.data) {
          this.$Message.success('保存表单配置成功')
          this.$router.go(-1)
        } else {
          this.$swal('保存表单配置失败', '', 'error')
        }
      })
    },
    /**
    * @desc 初始化
    */
    init: function () {
      this.formFields = this.formObj.field
      this.$api.post('/develop/url/getAllUrl.do', {}, r => {
        this.dataUrls = r.data
        this.dataUrls.unshift({ name: '', disc: '请选择' })
      })
      this.$api.post('/pages/button/framework/get.do', { title: this.formObj.title }, r => {
        console.log(r.data)
        if (r.data.obj !== null) {
          this.formAttrObj = r.data.obj
          this.initAttr(true)
        } else {
          this.initAttr(false)
        }
      })
    },
    /**
    * @desc 初始化数据
    * @param {Boolean} flag 表单是否有配置数据
    */
    initAttr: function (flag) { // 初始化数据
      if (flag) { // 有数据时
        this.formColumns = JSON.parse(this.formAttrObj.columns)
        this.formButtons = JSON.parse(this.formAttrObj.buttons)
        this.formSearchs = JSON.parse(this.formAttrObj.searchs)
        this.formSearchButtons = JSON.parse(this.formAttrObj.search_buttons)
        for (let iterator of this.formButtons) {
          iterator.buttonFunction = iterator.buttonFunction.replace(/&acute;/g, '\'')
        }
        for (let iterator of this.formSearchButtons) {
          iterator.buttonFunction = iterator.buttonFunction.replace(/&acute;/g, '\'')
        }
        this.jsCode = this.formAttrObj.js_code.replace(/&quot;/g, '"').replace(/换行符/g, '\n').replace(/&acute;/g, '\'')
      } else { // 无数据时加默认值
        for (let iterator of this.formFields) {
          if (iterator.text !== 'pid') {
            this.formColumns.push({
              field: iterator.text,
              title: iterator.title
            })
          }
        }
        /* this.formButtons = [
          {
            buttonName: '新增',
            buttonAttr: 'fa fa-plus',
            buttonId: 'add',
            buttonFunction: 'functionAdd()'
          },
          {
            buttonName: '修改',
            buttonAttr: 'fa fa-pencil',
            buttonId: 'edit',
            buttonFunction: 'functionModify()'
          },
          {
            buttonName: '查看',
            buttonAttr: 'fa fa-info-circle',
            buttonId: 'view',
            buttonFunction: 'functionView()'
          },
          {
            buttonName: '删除',
            buttonAttr: 'fa fa-trash',
            buttonId: 'delete',
            buttonFunction: 'functionDelete()'
          }
        ] */
      }
    }
  },
  mounted () {
    this.init()
  },
  computed: {
    formFieldsTitle () { // 表单字段中文名
      let arrTemp = []
      for (let iterator of this.formFields) {
        arrTemp.push(iterator.title)
      }
      return arrTemp
    },
    formFieldsText () { // 表单字段英文名
      let arrTemp = []
      for (let iterator of this.formFields) {
        arrTemp.push(iterator.text)
      }
      return arrTemp
    }
  }
}
</script>
