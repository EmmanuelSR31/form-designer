<template>
<div class="main-con">
  <div class="left-menu-con" :style="{width: leftMenuWidth + 'px'}">
    <div class="left-menu-top">
      <div class="left-menu-top-title">管理系统</div>
    </div>
    <Menu :theme="leftMenuTheme" active-name="menulist" :open-names="['1']" :width="leftMenuWidth + 'px'" :style="{paddingRight: '10px'}" accordion @on-select="routeTo">
      <template v-for="item in menuList">
        <template v-if="item.children !== null && item.children !== undefined && item.children.length > 0">
          <Submenu :name="JSON.stringify(item)" :key="item.url">
            <template slot="title">
              <Icon :type="item.iconCls !== null ? item.iconCls : 'ios-alert'"></Icon>
              {{item.text}}
            </template>
            <template v-for="tmp in item.children">
              <template v-if="tmp.children !== null && tmp.children !== undefined && tmp.children.length > 0">
                <Submenu :name="JSON.stringify(tmp)" :key="tmp.url">
                  <template slot="title">{{tmp.text}}</template>
                  <MenuItem v-for="tm in tmp.children" :name="JSON.stringify(tm)" :key="tm.url">{{tm.text}}</MenuItem>
                </Submenu>
              </template>
              <template v-else>
                <MenuItem :name="JSON.stringify(tmp)" :key="tmp.url">{{tmp.text}}</MenuItem>
              </template>
            </template>
          </Submenu>
        </template>
        <template v-else>
          <MenuItem :name="JSON.stringify(item)" :key="item.url">
            <Icon :type="item.iconCls !== null ? item.iconCls : 'ios-alert'"></Icon>
            {{item.text}}
          </MenuItem>
        </template>
      </template>
    </Menu>
  </div>
  <div class="right-top-con" :style="{left: leftMenuWidth + 'px'}">
    <div class="header">
      <div class="header-left" ref="headerLeft">
        <img src="assets/img/home.png" class="header-icon">
        <span class="header-title">{{menuName}}
          <template v-if="subMenuName !== ''">
            <span class="header-location-line">/</span>
            <span class="header-subtitle">{{subMenuName}}</span>
          </template>
        </span>
      </div>
      <div class="tags-con" :style="{width: tagsConWidth + 'px'}">
        <opened-page-tags :pageTagsList="pageTagsList"></opened-page-tags>
      </div>
      <div class="user-dropdown-menu-con">
        <ul>
          <li class="user-dropdown-li">
            <img src="assets/img/userTemp.jpg" class="user-icon">
            <Dropdown transfer placement="bottom-end" @on-click="handleClickUserDropdown">
              <a href="javascript:void(0)">
                {{userName}}
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <!--<DropdownItem name="ownSpace">个人中心</DropdownItem>-->
                <!-- <DropdownItem name="editPassword">修改密码</DropdownItem> -->
                <DropdownItem name="loginout" divided>退出登录</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="single-page-con" :style="{paddingLeft: leftMenuWidth + 10 + 'px'}">
    <keep-alive :include="cachePage">
        <router-view></router-view>
    </keep-alive>
  </div>
  <Modal v-model="modalPassword" title="修改密码" @on-ok="savePassword">
    <div class="modal-field-con">
      <div>
        <Form ref="formPosition" :model="passwordObj" :label-width="120">
          <FormItem label="旧密码" class="whole-line-703">
            <Input v-model="passwordObj.oldPass" type="password"></Input>
          </FormItem>
          <FormItem label="新密码" class="whole-line-703">
            <Input v-model="passwordObj.newPass" type="password"></Input>
          </FormItem>
          <FormItem label="确认新密码" class="whole-line-703">
            <Input v-model="passwordObj.newPass1" type="password"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
</div>
</template>
<script>
import Util from '@/utils/index'
import openedPageTags from './main-components/opened-page-tags.vue'
export default {
  components: {
    openedPageTags
  },
  data () {
    return {
      leftMenuTheme: this.$store.state.leftMenuTheme, // 左侧菜单样式
      leftMenuWidth: 280, // 左侧菜单宽度
      userName: '', // 用户名
      systemObj: { system_name: '' }, // 系统名称对象
      modalPassword: false, // 修改密码对话框是否显示
      passwordObj: {}, // 密码对象
      menuName: '', // 菜单名
      subMenuName: '', // 二级菜单名
      tagsConWidth: 200 // 标签栏宽度
    }
  },
  computed: {
    menuList: function () {
      return this.$store.state.menuList // 左侧菜单列表
    },
    cachePage: function () {
      return this.$store.state.cachePage // 缓存的页面
    },
    pageTagsList: function () {
      return this.$store.state.pageOpenedList // 打开的页面列表
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      this.$store.state.menuList = []
      this.$store.dispatch('setUser', JSON.parse(Util.getCookie('user')))
      this.userName = this.$store.state.user.name
      if (this.userName.length > 10) {
        this.userName = this.userName.substring(0, 10)
      }
      this.$api.post('/crm/ActionFormUtil/getDataById.do', { tableName: 'db_system_user_position', id: this.$store.state.user.position_id }, r => {
        let positionText = r.data.rows[0].text
        if (positionText === '系统管理员') {
          this.$store.dispatch('updateMenuList')
        } else {
          this.$api.post('/system/user/position/getMenuByPositionId.do', { id: this.$store.state.user.position_id }, r => {
            this.$store.state.menuList = r.data
          })
        }
      })
      this.$store.dispatch('setSelectData')
      this.$api.post('/crm/ActionFormUtil/getByTableName.do', { tableName: 'system_set' }, r => {
        if (r.data.rows.length > 0) {
          this.systemObj = r.data.rows[0]
        }
      })
      this.$Message.config({
        top: 300,
        duration: 3
      })
    },
    /**
    * @desc 用户菜单点击
    * @param {String} name 菜单名
    */
    handleClickUserDropdown (name) { // 用户菜单点击
      if (name === 'ownSpace') {
        this.$store.dispatch('increateTag', { text: '个人中心', path: '', name: 'ownspace', url: '/ownspace' })
        this.$router.push({
          name: 'ownspace'
        })
      } else if (name === 'editPassword') {
        this.modalPassword = true
      } else if (name === 'loginout') {
        this.$store.dispatch('logout')
        this.$router.push({
          name: 'login'
        })
      }
    },
    /**
    * @desc 保存密码
    */
    savePassword: function () { // 保存密码
    },
    /**
    * @desc 路由跳转
    * @param {String} e 链接对象
    */
    routeTo: function (e) {
      let obj = JSON.parse(e)
      this.$store.dispatch('increateTag', obj)
      this.$router.push({
        path: obj.url
      })
    },
    /**
    * @desc 取栏目名
    * @param {String} path 当前路径
    */
    setLocation: function (path) {
      this.menuName = ''
      this.subMenuName = ''
      if (path === '/home') {
        this.menuName = '首页'
        this.subMenuName = ''
        this.$nextTick(() => {
          this.setTagsConWidth(115)
        })
      } else {
        this.$api.post('/topJUI/index/getMenuNameByUrl', { url: path }, r => {
          if (r.data) {
            this.subMenuName = r.data
            this.$api.post('/topJUI/index/getParentMenuName', { menuName: this.subMenuName }, r => {
              if (r.data) {
                this.menuName = r.data
                this.$nextTick(() => {
                  this.setTagsConWidth('')
                })
              }
            })
          }
        })
      }
    },
    /**
    * @desc 设置标签栏宽度
    * @param {Num} w 当前栏目名的宽度
    */
    setTagsConWidth: function (w) {
      w = w === '' ? this.$refs.headerLeft.offsetWidth : w
      this.tagsConWidth = document.body.clientWidth - this.leftMenuWidth - 335 - w
    }
  },
  mounted () {
    this.init()
    this.setLocation(this.$route.path)
    let that = this
    window.onresize = function () {
      that.setTagsConWidth('')
    }
  },
  watch: {
    $route (to, from) {
      this.setLocation(this.$route.path)
    }
  }
}
</script>
<style lang="scss">
@import "../style/style";
</style>
