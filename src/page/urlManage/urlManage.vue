<template>
<div>
  <Row>
    <Col span="8">
      <div class="bg-white padding10 left-tree">
        <Tree :data="treeData" @on-select-change="initUrls"></Tree>
      </div>
    </Col>
    <Col span="15" offset="1">
      <div class="table-search-con">
        <Button type="primary" @click="addUrl">新增</Button>
      </div>
      <Table border :loading="loading" :columns="columns" :data="data" stripe></Table>
    </Col>
  </Row>
</div>
</template>
<script>
import Util from '@/utils/index'
import editUrl from './editUrl.vue'
export default {
  data () {
    return {
      loading: false, // 载入中
      treeData: [], // 栏目数据
      columns: [ // 表格表头
        {
          type: 'index',
          title: '序列',
          width: 64,
          align: 'center'
        },
        {
          title: 'pid',
          key: 'pid'
        },
        {
          title: '名称',
          key: 'name'
        },
        {
          title: '描述',
          key: 'descr'
        },
        {
          title: 'URL类型',
          key: 'type'
        },
        {
          title: '创建人',
          key: 'creater'
        },
        {
          title: '创建时间',
          key: 'create_date'
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
                    this.editUrl(params)
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
                    this.deleteUrl(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      data: [], // url数据
      urlObj: {}, // url对象
      currentForm: '' // 选中栏目
    }
  },
  methods: {
    /**
    * @desc 取左侧栏目列表
    */
    init: function () {
      this.$api.post('/topJUI/index/getMenuList.do', {}, r => {
        if (r.data) {
          this.treeData = Util.formatterTreeData(r.data)
        }
      })
    },
    /**
    * @desc 选择栏目
    * @param {Array} row 选中的栏目数组
    */
    initUrls: function (row) {
      this.currentForm = row[0].id
      this.data = []
      this.initUrlsData()
    },
    /**
    * @desc 取链接数据
    */
    initUrlsData: function () {
      this.loading = true
      this.$api.post('/develop/url/getByPid.do', { pid: this.currentForm }, r => {
        console.log(r.data)
        this.data = r.data
        this.loading = false
      })
    },
    /**
    * @desc 新增URL
    */
    addUrl: function () {
      if (this.currentForm === '') {
        this.$Message.warning('请先选择一条目录')
      } else {
        let temp = {}
        this.$layer.iframe({
          content: {
            content: editUrl, // 传递的组件对象
            parent: this, // 当前的vue对象
            data: {
              pid: this.currentForm,
              urlObjStr: JSON.stringify(temp),
              method: 'add'
            }
          },
          shadeClose: false,
          shade: true,
          area: ['800px', document.body.clientHeight - 20 + 'px'],
          title: '新增URL'
        })
      }
    },
    /**
    * @desc 修改URL
    * @param {Object} row 要修改的URL
    */
    editUrl: function (row) {
      console.log(row)
      let temp = row.row
      delete temp._index
      delete temp._rowKey
      this.$layer.iframe({
        content: {
          content: editUrl, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            pid: '',
            urlObjStr: JSON.stringify(temp),
            method: 'edit'
          }
        },
        shadeClose: false,
        shade: true,
        area: ['800px', document.body.clientHeight - 20 + 'px'],
        title: '修改URL'
      })
    },
    /**
    * @desc 删除URL
    * @param {Object} row 要删除的URL
    */
    deleteUrl: function (row) {
      /* this.$Modal.confirm({
        title: '',
        content: '确认删除此URL？',
        onOk: () => {
          this.$api.post('', { id: row.row.id }, r => {
            if (r.data === '0') {
              this.$swal('删除URL失败', '', 'error')
            } else {
              this.$Message.success('删除URL成功')
              this.initUrlsData()
            }
          })
        },
        onCancel: () => {
        }
      }) */
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style>
</style>
