import Vue from 'vue'
import Vuex from 'vuex'
import * as getters from './getters'
import * as actions from './actions'
import mutations from './mutations'

Vue.use(Vuex)

const state = {
  user: {}, // 用户
  menuList: [], // 左侧菜单列表
  cachePage: [], // 缓存页面
  leftMenuTheme: 'dark', // 左侧菜单主题
  openedSubmenu: '', // 左侧菜单打开项
  pageOpenedList: [{ // 打开页面列表
    text: '首页',
    path: '/home',
    name: 'home',
    url: '/home'
  }],
  currentPageName: '首页', // 当前页面名
  currentPath: [ // 当前页面路径
    {
      text: '首页',
      path: '/home',
      name: 'home',
      url: '/home'
    }
  ],
  dontCache: [], // 在这里定义你不想要缓存的页面的name属性值
  contextMenuList: [ // 标签右键菜单
    {
      name: 'close',
      title: '关闭当前'
    },
    {
      name: 'closeOther',
      title: '关闭其他'
    },
    {
      name: 'closeAll',
      title: '关闭所有'
    }
  ],
  contextMenuOpenedTag: '', // 打开右键菜单的标签
  controlArray: [ // 字段类型列表
    {
      title: '文本输入框',
      fieldType: 'textbox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '多行文本输入框',
      fieldType: 'textboxMultiline',
      height: '64',
      width: '703',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '数字输入框',
      fieldType: 'numberbox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '下拉选择器',
      fieldType: 'combobox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '单选框',
      fieldType: 'radio',
      radios: ['单选框'],
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '多选框',
      fieldType: 'checkbox',
      checkboxs: ['多选框'],
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '开关选择器',
      fieldType: 'switch',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '日期选择器',
      fieldType: 'datebox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '日期时间选择器',
      fieldType: 'datetimebox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '月份选择器',
      fieldType: 'monthbox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '年份选择器',
      fieldType: 'yearbox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '子表',
      fieldType: 'tablebox'
    },
    {
      title: '附件上传',
      fieldType: 'filebox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'true',
      trWidth: '0'
    },
    {
      title: '密码输入框',
      fieldType: 'passwordbox',
      width: '278',
      disabled: 'false',
      readonly: 'false',
      required: 'false',
      listDisplay: 'false',
      trWidth: '0'
    }
  ],
  currentEditForm: {}, // 当前修改表单
  currentEditFormData: {}, // 当前修改数据
  currentEditChildForm: {}, // 当前修改子表表单
  currentEditChildFormData: {}, // 当前修改子表数据
  selectData: {}, // 下拉数据
  normalSelect: [], // 普通下拉
  quoteSelect: [], // 引用下拉
  treeSelect: [], // 树形下拉
  columnAlign: [ // 表头对齐方式
    {
      text: '左对齐',
      value: 'left'
    },
    {
      text: '居中',
      value: 'center'
    },
    {
      text: '右对齐',
      value: 'right'
    }
  ],
  searchManner: [ // 搜索方式
    {
      text: '并且',
      value: 'and'
    },
    {
      text: '或者',
      value: 'or'
    }
  ],
  searchInputType: [ // 搜索输入框类型
    {
      type: 'textbox',
      text: '文本框'
    },
    {
      type: 'combobox',
      text: '下拉框'
    },
    {
      type: 'datebox',
      text: '日期框'
    },
    {
      type: 'yearbox',
      text: '年份框'
    },
    {
      type: 'monthbox',
      text: '月份框'
    }
  ],
  searchCondition: [ // 搜索条件
    {
      text: '包含',
      value: 'like'
    },
    {
      text: '不包含',
      value: 'not like'
    },
    {
      text: '等于',
      value: '='
    },
    {
      text: '不等于',
      value: '<>'
    },
    {
      text: '大于',
      value: '>'
    },
    {
      text: '大于等于',
      value: '>='
    },
    {
      text: '小于',
      value: '<'
    },
    {
      text: '小于等于',
      value: '<='
    },
    {
      text: '是否为空',
      value: 'isEmpty'
    }
  ],
  positionList: [], // 用户职位列表
  userStatusList: [], // 用户状态列表
  urlInParaCondition: [ // 链接输入参数条件列表
    {
      text: '包含',
      value: 'like'
    },
    {
      text: '等于',
      value: '='
    },
    {
      text: '大于',
      value: '>'
    },
    {
      text: '小于',
      value: '<'
    },
    {
      text: '日期大于等于',
      value: 'date>='
    },
    {
      text: '日期小于等于',
      value: 'date<='
    }
  ],
  urlInParaOption: [ // 引用下拉输入参数类型列表
    {
      text: '用户ID',
      value: 'userId'
    },
    {
      text: '手填',
      value: 'write'
    }
  ],
  autoFillType: [ // 新增时自动填写类型
    {
      text: '用户名',
      value: 'userName'
    },
    {
      text: '用户部门',
      value: 'department'
    },
    {
      text: '接口类',
      value: 'interface'
    },
    {
      text: '固定值',
      value: 'value'
    }
  ],
  formListUrl: [ // 表单数据列表地址
    {
      text: '普通',
      value: 'formDataManage'
    },
    {
      text: '自定义数据来源',
      value: 'formDataManageForUrl'
    }
  ],
  headerHeight: 100, // 头部高度
  uploadIp: 'http://liudashi2006.eicp.net:8866/bk' // 上传ip地址
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
