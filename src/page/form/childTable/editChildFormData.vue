<template>
<div class="form-con edit-form-con">
  <Row>
    <Col span="24">
      <div :class="formClass">
        <Form :model="formDataObj" :label-width="120">
          <FormItem v-for="(item, index) in formControls" :key="index" :class="['whole-line-'+item.width, 'whole-line-'+item.fieldType]" :label="item.title">
            <template v-if="item.fieldType === 'textbox'">
              <Input v-model="formDataObj[item.text]" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :key="item.text"></Input>
            </template>
            <template v-else-if="item.fieldType === 'textboxMultiline'">
              <Input type="textarea" v-model="formDataObj[item.text]" :rows="item.rows" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></Input>
            </template>
            <template v-else-if="item.fieldType === 'numberbox'">
              <template v-if="item.needCalculate === 'true'">
                <template v-if="item.precision !== ''">
                  <InputNumber :value="numberCalculate(item)" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :precision="Number(item.precision)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :key="item.text"></InputNumber>
                </template>
                <template v-else>
                  <InputNumber :value="numberCalculate(item)" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :key="item.text"></InputNumber>
                </template>
              </template>
              <template v-else>
                <template v-if="item.precision !== ''">
                  <InputNumber v-model="formDataObj[item.text]" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :precision="Number(item.precision)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :key="item.text"></InputNumber>
                </template>
                <template v-else>
                  <InputNumber v-model="formDataObj[item.text]" :min="item.min !== '' ? Number(item.min) : -Infinity" :max="item.max !== '' ? Number(item.max) : Infinity" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" @on-change="writeOtherField(item)" :key="item.text"></InputNumber>
                </template>
              </template>
            </template>
            <template v-else-if="item.fieldType === 'combobox'">
              <Select v-model="formDataObj[item.text]" :multiple="item.multiple" :placeholder="item.prompt" :disabled="method === 'view' ? true : strToBool(item.disabled)" @on-change="changeQuoteSelectData(item)" :key="item.text">
                <Option v-for="tmp in selectData[item.selectID]" :value="tmp.id + ''" :key="tmp.id" :label="tmp.text"></Option>
              </Select>
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
                <DatePicker type="date" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
              <template v-else>
                <DatePicker type="date" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
            </template>
            <template v-else-if="item.fieldType === 'datetimebox'">
              <template v-if="item.currentDate === 'true' && method === 'add'">
                <DatePicker type="datetime" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
              <template v-else>
                <DatePicker type="datetime" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
            </template>
            <template v-else-if="item.fieldType === 'monthbox'">
              <template v-if="item.currentDate === 'true' && method === 'add'">
                <DatePicker type="month" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
              <template v-else>
                <DatePicker type="month" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
            </template>
            <template v-else-if="item.fieldType === 'yearbox'">
              <template v-if="item.currentDate === 'true' && method === 'add'">
                <DatePicker type="year" :value="currentDate" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
              <template v-else>
                <DatePicker type="year" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event;writeOtherField(item)" :placeholder="item.prompt" :disabled="strToBool(item.disabled)" :readonly="method === 'view' ? true : strToBool(item.readonly)" :key="item.text"></DatePicker>
              </template>
            </template>
            <template v-else-if="item.fieldType === 'filebox'">
              <form-file :is-view="method === 'view'" :field="item.text" :paths="formDataObj[item.text]" @change-field-files="changeFieldFiles"></form-file>
              <!-- <template v-if="method === 'view'">
                <Button type="ghost" @click="openUpload(item)">查看</Button>
              </template>
              <template v-else>
                <Input v-model="formDataObj[item.text]" :key="item.text"><Button slot="append" icon="md-cloud-upload" @click="openUpload(item)"></Button></Input>
              </template> -->
            </template>
          </FormItem>
        </Form>
      </div>
      <div class="text-center form-btn-con">
        <!-- <Button class="mr100" @click="cancel">取消</Button> -->
        <button type="button" v-if="method !== 'view'" @click="save">确认</button>
      </div>
    </Col>
  </Row>
</div>
</template>
<script>
import Util from '@/utils/index'
import formFile from '../fileManage/formFile.vue'
/* import filesManage from '../fileManage/filesManage.vue' */
export default {
  components: {
    formFile // 附件展示
  },
  props: {
    tableName: String, // 表单名
    recordID: String, // 主表数据ID
    id: String, // 数据ID
    method: String, // 方法
    layerid: String
  },
  data () {
    return {
      formControls: [], // 表单字段
      formObj: this.$store.state.currentEditChildForm, // 表单对象
      formDataObj: {}, // 表单数据对象
      selectData: this.$store.state.selectData // 下拉数据
    }
  },
  methods: {
    /**
    * @desc 返回
    */
    cancel: function () {
      this.$parent.$layer.closeAll()
    },
    /**
    * @desc 保存
    */
    save: function () {
      let obj = {}
      obj.title = this.tableName
      console.log(obj.title)
      console.log(this.tableName)
      obj.field = Util.getFormValues(this.formDataObj, this.formControls)
      if (this.method === 'add') {
        obj.field.push({ text: 'uuid', value: '\'' + this.recordID + '\'' })
        let jsonStr = JSON.stringify(obj)
        console.log(jsonStr)
        this.$api.post('/crm/ActionFormUtil/insert.do', { jsonStr: jsonStr }, r => {
          if (r.data === 1) {
            this.$Message.success('新增数据成功')
            this.$parent.editSuccess()
            this.$parent.$layer.close(this.layerid)
          } else {
            this.$swal('新增数据失败', '', 'error')
          }
        })
      } else if (this.method === 'edit') {
        let jsonStr = JSON.stringify(obj)
        console.log(jsonStr)
        this.$api.post('/crm/ActionFormUtil/update.do', { jsonStr: jsonStr, id: this.id }, r => {
          if (r.data === 1) {
            this.$Message.success('修改数据成功')
            this.$parent.editSuccess()
            this.$parent.$layer.close(this.layerid)
          } else {
            this.$swal('修改数据失败', '', 'error')
          }
        })
      }
    },
    /**
    * @desc 初始化
    */
    init: function () {
      this.formControls = Util.removeFieldTable(this.formObj.field)
      if (['edit', 'view'].includes(this.method)) {
        this.formDataObj = this.$store.state.currentEditChildFormData
        this.formDataObj = Util.formatFormData(this.formControls, this.formDataObj)
      } else if (this.method === 'add') {
        this.formDataObj = Util.fieldArrToObj(this.formControls)
      }
      console.log(this.formControls)
    },
    /**
    * @desc 引用下拉写入其他字段
    * @param {Object} field 引用下拉字段
    */
    changeQuoteSelectData: function (field) {
      if (field.selectType === '1' & field.selectFields !== '') {
        if (field.selectFields.length > 0) {
          let temp = this.selectData[field.selectID].find((element) => (element.id === this.formDataObj[field.text]))
          for (let variable of field.selectFields) {
            let tmp = variable.name
            this.formDataObj[variable.inputName] = temp[tmp]
          }
        }
      }
      if (field.cascade === 'true') {
        this.changeCascadeSelectData(field, this.formControls, this.formDataObj[field.text])
      }
      this.writeOtherField(field)
    },
    /**
    * @desc 初始化级联字段下拉数据
    * @param {Object} field 级联字段
    * @param {Array} fields 字段列表
    * @param {String} val 字段值
    */
    changeCascadeSelectData: function (field, fields, val) {
      let toField = fields.find(ele => ele.text === field.cascadeField)
      this.$api.post('/develop/url/getUrl.do', { name: toField.selectID, value: val }, r => {
        this.$store.state.selectData[toField.selectID] = r.data
        console.log('级联下拉')
        this.formDataObj[toField.text] = 1
        this.formDataObj[toField.text] = ''
        this.$store.state.selectData[toField.selectID] = []
        this.$store.state.selectData[toField.selectID] = r.data
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
          obj[iterator.name] = iterator.value
        }
        this.$api.post(field.writeOtherFieldInterface, obj, r => {
          this.formDataObj[field.writeOtherFieldName] = r.data
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
    strToBool: function (str) {
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
    }
  },
  mounted () {
    this.init()
  },
  beforeRouteLeave (to, from, next) {
    // 离开页面时确认
    if (this.method === 'view') {
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
