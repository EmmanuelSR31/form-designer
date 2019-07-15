<template>
<div class="form-con edit-form-con">
  <Row>
    <Col span="24">
      <div :class="formClass">
        <Form ref="dataForm" :model="formDataObj" :label-width="110">
          <template v-for="(item, index) in formControls">
            <template v-if="formObj.formLegendIndex !== undefined">
              <div v-if="formObj.formLegendIndex.indexOf(index) !== -1" class="form-legend" :key="index"><hr><span><i>{{formObj.formLegendIndex.indexOf(index) + 1}}</i>{{formObj.formLegendData[formObj.formLegendIndex.indexOf(index)].name}}</span></div>
            </template>
            <FormItem :key="index" :class="['whole-line-'+item.width, 'whole-line-'+item.fieldType]" :label="item.title">
              <template v-if="item.fieldType === 'textbox'">
                <template v-if="item.splitByOtherField === 'true'">
                  <Input :value="splitByOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" @on-blur="fieldValidate(item)" :key="item.text"></Input>
                </template>
                <template v-else>
                  <Input v-model="formDataObj[item.text]" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" @on-blur="fieldValidate(item)" :key="item.text"></Input>
                </template>
              </template>
              <template v-else-if="item.fieldType === 'textboxMultiline'">
                <Input type="textarea" v-model="formDataObj[item.text]" :rows="item.rows" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></Input>
              </template>
              <template v-else-if="item.fieldType === 'numberbox'">
                <template v-if="item.needCalculate === 'true'">
                  <template v-if="item.precision !== ''">
                    <InputNumber :value="numberCalculate(item)" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :precision="Number(item.precision)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :active-change="false" :key="item.text"></InputNumber>
                  </template>
                  <template v-else>
                    <InputNumber :value="numberCalculate(item)" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :active-change="false" :key="item.text"></InputNumber>
                  </template>
                </template>
                <template v-else>
                  <template v-if="item.precision !== ''">
                    <InputNumber v-model="formDataObj[item.text]" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :precision="Number(item.precision)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :active-change="false" :key="item.text"></InputNumber>
                  </template>
                  <template v-else>
                    <InputNumber v-model="formDataObj[item.text]" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :active-change="false" :key="item.text"></InputNumber>
                  </template>
                </template>
              </template>
              <template v-else-if="item.fieldType === 'combobox'">
                <template v-if="item.selectType === '2'">
                  <treeselect v-model="formDataObj[item.text]" :multiple="item.multiple" :options="selectData[item.selectID]" :placeholder="item.prompt" :disabled="method === 'view' ? true : strToBool(item.disabled)" @select="changeQuoteSelectData(item)" :key="item.text" />
                </template>
                <template v-else>
                  <Select v-model="formDataObj[item.text]" :multiple="item.multiple" :placeholder="item.prompt" :disabled="method === 'view' ? true : strToBool(item.disabled)" @on-change="changeQuoteSelectData(item)" filterable :key="item.text">
                    <Option v-for="tmp in selectData[item.selectID]" :value="tmp.id + ''" :key="tmp.id" :label="tmp.text"></Option>
                  </Select>
                </template>
              </template>
              <template v-else-if="item.fieldType === 'radio'">
                <RadioGroup v-model="formDataObj[item.text]">
                  <Radio v-for="(radioItem, index) in item.radios" :key="index" :label="radioItem" :disabled="method === 'view' ? true : strToBool(item.disabled)"></Radio>
                </RadioGroup>
              </template>
              <template v-else-if="item.fieldType === 'checkbox'">
                <CheckboxGroup v-model="formDataObj[item.text]">
                  <Checkbox v-for="(checkboxItem, index) in item.checkboxs" :key="index" :label="checkboxItem" :disabled="method === 'view' ? true : strToBool(item.disabled)"></Checkbox>
                </CheckboxGroup>
              </template>
              <template v-else-if="item.fieldType === 'switch'">
                <i-switch v-model="formDataObj[item.text]" :key="item.text" :disabled="method === 'view' ? true : strToBool(item.disabled)"></i-switch>
              </template>
              <template v-else-if="item.fieldType === 'datebox'">
                <template v-if="item.currentDate === 'true' && method === 'add'">
                  <DatePicker type="date" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
                <template v-else>
                  <DatePicker type="date" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
              </template>
              <template v-else-if="item.fieldType === 'datetimebox'">
                <template v-if="item.currentDate === 'true' && method === 'add'">
                  <DatePicker type="datetime" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
                <template v-else>
                  <DatePicker type="datetime" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
              </template>
              <template v-else-if="item.fieldType === 'monthbox'">
                <template v-if="item.currentDate === 'true' && method === 'add'">
                  <DatePicker type="month" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
                <template v-else>
                  <DatePicker type="month" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
              </template>
              <template v-else-if="item.fieldType === 'yearbox'">
                <template v-if="item.currentDate === 'true' && method === 'add'">
                  <DatePicker type="year" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
                <template v-else>
                  <DatePicker type="year" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" placement="top" :key="item.text"></DatePicker>
                </template>
              </template>
              <template v-else-if="item.fieldType === 'tablebox'">
                <template v-if="item.editChildTable === 'true'">
                  <editTable :tableName="item.tableTitle" :recordID="formDataObj.uuid" :viewFlag="method === 'view'" @edit-success="calculateToMain(item)"></editTable>
                </template>
                <template v-else>
                  <childTable :childTableName="item.tableTitle" :recordID="formDataObj.uuid" :is-view="method === 'view'" @edit-success="calculateToMain(item)"></childTable>
                </template>
                <div class="clear"></div>
              </template>
              <template v-else-if="item.fieldType === 'filebox'">
                <form-file :is-view="method === 'view'" :field="item.text" :paths="formDataObj[item.text]" @change-field-files="changeFieldFiles"></form-file>
                <!-- <template v-if="method === 'view'">
                  <Button type="ghost" @click="openUpload(item)">查看</Button>
                </template>
                <template v-else>
                  <Upload multiple action="/apis/upload/file?fileType=file" :show-upload-list="false" :before-upload="handleBeforeUpload(item.text)" :on-success="uploadSuccess">
                    <Button type="primary" icon="ios-cloud-upload-outline">上传</Button>
                  </Upload>
                  <ul class="form-file-list">
                    <li v-for="(file, index) in fileList[item.text]" :key="index">
                      <Button @click="deleteFile(item.text, file)">删除</Button><a href="file">{{file}}</a>
                    </li>
                  </ul>
                  <Input v-model="formDataObj[item.text]" :key="item.text"><Button slot="append" icon="md-cloud-upload" @click="openUpload(item)"></Button></Input>
                </template> -->
              </template>
              <template v-if="item.fieldType === 'passwordbox'">
                <Input type="password" v-model="formDataObj[item.text]" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :key="item.text"></Input>
              </template>
            </FormItem>
          </template>
        </Form>
      </div>
      <div class="clear"></div>
      <div class="text-center form-btn-con">
        <!-- <Button class="mr100" @click="cancel">取消</Button> -->
        <!-- <button type="button" v-if="method !== 'view'" @click="save(true)">提交并开启流程</button> -->
        <button type="button" v-if="method !== 'view'" @click="save(false)">确认</button>
      </div>
    </Col>
  </Row>
</div>
</template>
<script>
import Util from '@/utils/index'
import childTable from './childTable/childTable.vue'
import formFile from './fileManage/formFile.vue'
import editTable from '../components/editTable.vue'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.min.css'
// import filesManage from './fileManage/filesManage.vue'
export default {
  components: {
    childTable, // 子表组件
    formFile, // 附件展示
    editTable, // 可编辑表格
    Treeselect // 树形下拉
  },
  props: {
    tableName: String, // 表单名
    pid: String, // 父ID
    id: String, // 数据ID
    method: String, // 方法
    layerid: String
  },
  data () {
    return {
      formControls: [], // 表单字段
      formObj: this.$store.state.currentEditForm, // 表单对象
      formDataObj: this.$store.state.currentEditFormData, // 表单数据对象
      // selectData: this.$store.state.selectData, // 下拉数据
      fileList: {}, // 附件列表
      currentUploadField: '', // 正在上传附件的字段
      saveFlag: false, // 保存成功标志
      uuid: '', // 数据uuid
      key: '', // 流程key
      fieldValRepeatFlag: false // 字段重复标志
    }
  },
  methods: {
    /**
    * @desc 返回
    */
    cancel: function () {
      this.$router.go(-1)
    },
    /**
    * @desc 保存
    * @param {Boolean} flag 是否开启流程
    */
    save: function (flag) {
      if (!Util.formValidate(this.formControls, this.formDataObj)) {
        return false
      }
      if (this.fieldValRepeatFlag) {
        return false
      }
      this.$Spin.show()
      let obj = {}
      obj.title = this.tableName
      // delete this.formDataObj.uuid
      if (this.method === 'add') {
        obj.field = Util.getFormValuesForAdd(this.formDataObj)
        // this.uuid = Util.uuid()
        obj.field.push({ text: 'uuid', value: '\'' + this.formDataObj.uuid + '\'' })
        obj.field.push({ text: 'create_user_id', value: '\'' + this.$store.state.user.id + '\'' })
        obj.field.push({ text: 'taskid', value: '0' })
        if (this.formObj.needTree === 'true' && this.pid !== '' && this.pid !== null) {
          obj.field.push({ text: 'pid', value: '\'' + this.pid + '\'' })
        }
        let jsonStr = JSON.stringify(obj)
        console.log(jsonStr)
        this.$api.post('/crm/ActionFormUtil/insert.do', { jsonStr: jsonStr }, r => {
          this.$Spin.hide()
          if (r.data === 1) {
            this.saveSuccess(flag, '新增数据成功')
          } else {
            this.$swal('新增数据失败', '', 'error')
          }
        })
      } else if (this.method === 'edit') {
        console.log(this.formDataObj)
        obj.field = Util.getFormValues(this.formDataObj, this.formControls)
        let jsonStr = JSON.stringify(obj)
        console.log(jsonStr)
        this.$api.post('/crm/ActionFormUtil/update.do', { jsonStr: jsonStr, id: this.id }, r => {
          this.$Spin.hide()
          if (r.data === 1) {
            this.saveSuccess(flag, '修改数据成功')
          } else {
            this.$swal('修改数据失败', '', 'error')
          }
        })
      }
    },
    /**
    * @desc 保存成功
    * @param {Boolean} flag 是否开启流程
    * @param {String} text 提示
    */
    saveSuccess: async function (flag, text) {
      if (flag) {
        await this.startProcess()
      }
      this.$Message.success(text)
      this.saveFlag = true
      // this.$router.go(-1)
      this.$parent.changePage(1)
      this.$parent.$layer.close(this.layerid)
    },
    /**
    * @desc 开启流程
    */
    startProcess: async function () {
      return new Promise((resolve) => {
        this.$api.post('/flow/startProcessWithForm', { modelName: this.key, uuid: this.uuid, completeNow: true }, r => {
          console.log(r)
          resolve(r.data)
        })
      })
    },
    /**
    * @desc 初始化
    */
    init: function () {
      console.log(this.selectData)
      this.formControls = Util.removeFieldTable(this.formObj.field)
      console.log(this.formControls)
      if (['edit', 'view'].includes(this.method)) {
        this.formDataObj = Util.formatFormData(this.formControls, this.formDataObj)
        console.log(this.formDataObj)
        // 触发级联
        for (let iterator of this.formControls) {
          if (iterator.fieldType === 'combobox' && iterator.cascade === 'true') {
            this.changeCascadeSelectData(iterator, this.formControls, this.formDataObj[iterator.text], true)
          }
        }
        this.fileList = Util.formatFieldFile(this.formControls, this.formDataObj)
      } else if (this.method === 'add') {
        this.formDataObj = Util.fieldArrToObj(this.formControls)
        this.formDataObj.uuid = Util.uuid()
        for (let field of this.formControls) {
          if (field.autoFill === 'true') {
            if (field.autoFillType === 'userName') {

            } else if (field.autoFillType === 'department') {

            } else if (field.autoFillType === 'interface') {
              let obj = {}
              for (let iterator of field.autoFillParamData) {
                obj[iterator.name] = iterator.value
              }
              this.$api.post(field.autoFillInterface, obj, r => {
                console.log(r)
                if (r.data) {
                  this.formDataObj[field.text] = r.data
                }
              })
            } else if (field.autoFillType === 'value') {
              this.formDataObj[field.text] = field.autoFillValue
            }
          }
        }
      }
      this.$api.post('/profFormRel/getInfo', { tableName: this.tableName }, r => {
        console.log(r)
        if (r.data.success) {
          this.key = r.data.obj.proDefKey
        }
      })
      console.log(this.selectData)
    },
    /**
    * @desc 引用下拉写入其他字段
    * @param {Object} field 引用下拉字段
    */
    changeQuoteSelectData: function (field) {
      // console.log(JSON.stringify(this.formDataObj))
      if (field.selectType === '1' & field.selectFields !== '') {
        if (field.selectFields.length > 0) {
          console.log(field)
          console.log(this.formDataObj)
          let temp = this.selectData[field.selectID].find(element => element.id == this.formDataObj[field.text])
          for (let variable of field.selectFields) {
            let tmp = variable.name
            this.formDataObj[variable.inputName] = temp[tmp]
          }
        }
      }
      if (field.cascade === 'true') {
        this.changeCascadeSelectData(field, this.formControls, this.formDataObj[field.text], false)
      }
      this.writeOtherField(field)
    },
    /**
    * @desc 初始化级联字段下拉数据
    * @param {Object} field 级联字段
    * @param {Array} fields 字段列表
    * @param {String} val 字段值
    * @param {Boolean} isInit 是否初次载入
    */
    changeCascadeSelectData: function (field, fields, val, isInit) {
      let toField = fields.find(ele => ele.text === field.cascadeField)
      this.$api.post('/develop/url/getUrl.do', { name: toField.selectID, value: val }, r => {
        this.$store.state.selectData[toField.selectID] = r.data
        console.log('级联下拉')
        console.log(r)
        if (!isInit) {
          this.formDataObj[toField.text] = 1
          this.formDataObj[toField.text] = ''
          this.$store.state.selectData[toField.selectID] = []
          this.$store.state.selectData[toField.selectID] = r.data
        } else {
          this.$store.dispatch('setOneSelectData', { id: toField.selectID, data: r.data })
          let te = JSON.parse(JSON.stringify(this.formDataObj[field.text]))
          this.formDataObj[field.text] = ''
          this.formDataObj[field.text] = te
        }
      })
    },
    /**
    * @desc 写入其他字段
    * @param {Object} field 当前字段
    */
    writeOtherField: function (field) {
      if (field.writeOtherField === 'true' && field.writeOtherFieldInterface !== '') {
        let obj = {}
        if (field.writeOtherFieldInterfaceParam !== '') {
          obj[field.writeOtherFieldInterfaceParam] = this.formDataObj[field.text]
        }
        for (let iterator of field.writeOtherFieldParam) {
          obj[iterator.name] = iterator.value === undefined ? '' : iterator.value
        }
        console.log('写入其他字段参数')
        console.log(obj)
        this.$api.post(field.writeOtherFieldInterface, obj, r => {
          console.log(r)
          this.formDataObj[field.writeOtherFieldName] = r.data
          // 手动触发写入其他字段
          let temp = this.formControls.find(ele => ele.text === field.writeOtherFieldName)
          this.writeOtherField(temp)
        })
      }
    },
    /**
    * @desc 更改附件值
    * @param {String} field 附件字段
    * @param {String} paths 附件值
    */
    changeFieldFiles: function (field, paths) {
      this.formDataObj[field] = paths
    },
    /**
    * @desc string转为Boolean
    * @param {String} str 字符串
    * @return {Boolean} 布尔值
    */
    strToBool: function (str) { // string转为Boolean
      return Util.strToBool(str)
    },
    /**
    * @desc 数字字段值计算
    * @param {Object} field 数字字段
    */
    numberCalculate: function (field) {
      let count = Util.numberCalculate(field, this.formDataObj)
      this.formDataObj[field.text] = count
      return count
    },
    /**
    * @desc 字段值由其他字段拼接组成
    * @param {Object} field 字段
    */
    splitByOtherField: function (field) {
      let temp = Util.splitByOtherField(field, this.formDataObj, this.formControls)
      this.formDataObj[field.text] = temp
      return temp
    },
    /**
    * @desc 子表字段数据计算后写入主表字段
    * @param {Object} field 子表字段
    */
    calculateToMain: function (field) {
      if (field.calculateToMain === 'true') {
        let count = 0
        this.$api.post('/crm/ActionFormUtil/getDataByUuid.do', { tableName: field.tableTitle, uuid: this.formDataObj.uuid }, r => {
          let dataTemp = r.data.rows
          for (let i = 0; i < dataTemp.length - 1; i++) {
            if (field.calculateChildFieldType === 'multiply') {
              count += Util.FloatMul(Util.changePercentToPoint(dataTemp[i][field.calculateChildField]), Util.changePercentToPoint(dataTemp[i + 1][field.calculateChildField]))
            } else if (field.calculateChildFieldType === 'plus') {
              count += Util.FloatAdd(Util.changePercentToPoint(dataTemp[i][field.calculateChildField]), Util.changePercentToPoint(dataTemp[i + 1][field.calculateChildField]))
            }
          }
          this.formDataObj[field.calculateToMainField] = count
        })
      }
    },
    /**
    * @desc 字段通过接口验证
    * @param {Object} field 字段
    */
    fieldValidate: function (field) {
      if (field.isInterfaceValidate === 'true') {
        this.$api.post(field.validateInterface, { tableName: this.tableName, val: this.formDataObj[field.text] }, r => {
          console.log(r)
          if (!r.data) {
            this.fieldValRepeatFlag = true
            this.$swal(field.title + '值已存在，请重新填写', '', 'error')
          }
        })
      }
    }
  },
  computed: {
    formClass () { // 表单排列样式
      if (Util.isEmpty(this.formObj.columnNumber)) {
        return 'form-column-1'
      } else {
        return 'form-column-' + this.formObj.columnNumber
      }
    },
    currentDate () { // 当前日期
      return Util.getCurrentDate()
    },
    selectData () { // 下拉数据
      return this.$store.state.selectData
    }
  },
  mounted () {
    this.init()
  },
  beforeRouteLeave (to, from, next) {
    // 离开页面时确认
    if (this.method === 'view' || this.saveFlag) {
      next()
    } else {
      this.$Modal.confirm({
        title: '',
        content: '数据未保存，确认离开此页？',
        onOk: () => {
          next()
        },
        onCancel: () => {
        }
      })
    }
  }
}
</script>
