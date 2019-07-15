<template>
<div class="form-con">
  <Row>
    <Col span="24">
      <div :class="formClass">
        <Form :model="formDataObj" :label-width="120">
          <FormItem v-for="(item, index) in formControls" :key="index" :class="['whole-line-'+item.width, 'whole-line-'+item.fieldType]" :label="item.title">
            <template v-if="item.fieldType === 'textbox'">
              <Input v-model="formDataObj[item.text]" :placeholder="item.prompt" readonly="true" :key="item.text"></Input>
            </template>
            <template v-else-if="item.fieldType === 'textboxMultiline'">
              <Input type="textarea" v-model="formDataObj[item.text]" :rows="item.rows" :placeholder="item.prompt" readonly="true" :key="item.text"></Input>
            </template>
            <template v-else-if="item.fieldType === 'numberbox'">
              <InputNumber v-model="formDataObj[item.text]" readonly="true" :key="item.text"></InputNumber>
            </template>
            <template v-else-if="item.fieldType === 'combobox'">
              <Select v-model="formDataObj[item.text]" :multiple="item.multiple" :placeholder="item.prompt" @on-change="changeQuoteSelectData(item)" disabled="true" :key="item.text">
                <Option v-for="tmp in selectData[item.selectID]" :value="tmp.id + ''" :key="tmp.id">{{tmp.text}}</Option>
              </Select>
            </template>
            <template v-else-if="item.fieldType === 'radio'">
              <RadioGroup v-model="formDataObj[item.text]">
                <Radio v-for="(radioItem, index) in item.radios" disabled="true" :key="index" :label="radioItem"></Radio>
              </RadioGroup>
            </template>
            <template v-else-if="item.fieldType === 'checkbox'">
              <CheckboxGroup v-model="formDataObj[item.text]">
                <Checkbox v-for="(checkboxItem, index) in item.checkboxs" disabled="true" :key="index" :label="checkboxItem"></Checkbox>
              </CheckboxGroup>
            </template>
            <template v-else-if="item.fieldType === 'switch'">
              <i-switch v-model="formDataObj[item.text]" disabled="true" :key="item.text"></i-switch>
            </template>
            <template v-else-if="item.fieldType === 'datebox'">
              <DatePicker type="date" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event" :placeholder="item.prompt" readonly="true" :key="item.text"></DatePicker>
            </template>
            <template v-else-if="item.fieldType === 'datetimebox'">
              <DatePicker type="datetime" :value="formDataObj[item.text]" @on-change="formDataObj[item.text]=$event" :placeholder="item.prompt" readonly="true" :key="item.text"></DatePicker>
            </template>
            <template v-else-if="item.fieldType === 'tablebox'">
              <childTable :childTableName="item.tableTitle" :recordID="formDataObj.uuid" :isView="true"></childTable>
            </template>
            <template v-else-if="item.fieldType === 'filebox'">
              <Button type="ghost" @click="openUpload(item)">查看</Button>
            </template>
          </FormItem>
          <FormItem  v-if="pid !== 0" label="上级">
            <Input v-model="pdata" readonly></Input>
          </FormItem>
        </Form>
      </div>
      <div class="text-center">
        <Button @click="cancel">关闭</Button>
      </div>
    </Col>
  </Row>
</div>
</template>
<script>
import Util from '@/utils/index'
import childTable from '../childTable/childTable.vue'
import filesManage from '../fileManage/filesManage.vue'
export default {
  components: {
    childTable
  },
  data () {
    return {
      tableName: this.$route.params.tableName, // 表单名
      id: this.$route.params.id, // 数据ID
      recordID: this.$route.params.recordID, // 主表数据ID
      formControls: [], // 表单字段
      formObj: this.$store.state.currentEditForm, // 表单对象
      formDataObj: this.$store.state.currentEditFormData, // 表单数据对象
      selectData: this.$store.state.selectData, // 下拉数据
      pdata: '' // 父数据
    }
  },
  methods: {
    cancel: function () {
      this.$router.go(-1)
    },
    init: function () {
      this.formControls = Util.removeFieldTable(this.formObj.field)
      this.formDataObj = Util.formatFormData(this.formControls, this.formDataObj)
      if (this.formDataObj.pid !== 0) { // 初始化上级数据
        this.$api.post('/crm/ActionFormUtil/getDataById.do', { tableName: this.tableName, id: this.formDataObj.pid }, r => {
          let temp = r.data.rows[0]
          this.pdata = temp[this.formObj.treeField]
        })
      }
    },
    changeQuoteSelectData: function (field) { // 引用下拉写入其他字段
      if (field.selectType === '1' & field.selectFields !== '') {
        if (field.selectFields.length > 0) {
          let temp = {}
          for (let variable of this.selectData[field.selectID]) {
            if (variable.id === this.formDataObj[field.text]) {
              temp = variable
              break
            }
          }
          for (let variable of field.selectFields) {
            let tmp = variable.name
            this.formDataObj[variable.inputName] = temp[tmp]
          }
        }
      }
    },
    openUpload: function (field) { // 打开附件上传
      this.$layer.open({
        type: 2,
        content: {
          content: filesManage, // 传递的组件对象
          parent: this, // 当前的vue对象
          data: {
            field: field.text,
            paths: this.formDataObj[field.text]
          }
        },
        shadeClose: false,
        shade: false,
        maxmin: true,
        area: ['800px', document.body.clientHeight - 20 + 'px'],
        title: '附件上传'
      })
    }
  },
  computed: {
    formClass () {
      if (Util.isEmpty(this.formObj.columnNumber)) {
        return 'form-column-1'
      } else {
        return 'form-column-' + this.formObj.columnNumber
      }
    }
  },
  mounted () {
    this.init()
  }
}
</script>
