<template>
<div>
  <div class="form-step-con">
    <Steps :current="currentStep">
      <Step title="设置表单属性"></Step>
      <Step title="设置表单字段"></Step>
    </Steps>
  </div>
  <swiper :options="swiperOption" ref="mySwiper">
    <swiper-slide>
      <Row>
        <Col span="12" offset="6">
          <Form :model="formObj" :label-width="120">
            <FormItem label="数据库表名">
              <template v-if="method === 'edit'">
                <Input v-model="formObj.title" readonly></Input>
              </template>
              <template v-else>
                <Input v-model="formObj.title" @on-blur="checkTableName"></Input>
              </template>
            </FormItem>
            <FormItem label="表单标题">
              <Input v-model="formObj.name"></Input>
            </FormItem>
            <FormItem label="表类型">
              <Select v-model="formObj.type" :disabled="method === 'edit'">
                <Option value="0">主表</Option>
                <Option value="1">子表</Option>
                <Option value="2">树形表</Option>
              </Select>
            </FormItem>
            <FormItem label="表单列数">
              <Select v-model="formObj.columnNumber">
                <Option value="1">每行1列</Option>
                <Option value="2">每行2列</Option>
                <Option value="3">每行3列</Option>
                <Option value="4">每行4列</Option>
              </Select>
            </FormItem>
            <FormItem label="表单数据列表地址" v-if="formObj.type === '0'">
              <Select v-model="formObj.formListUrl">
                <Option v-for="item in formListUrl" :value="item.value" :key="item.value">{{item.text}}</Option>
              </Select>
            </FormItem>
            <FormItem label="树节点字段" v-if="formObj.type === '2'">
              <Select v-model="formObj.treeField">
                <Option v-for="item in formControls" :value="item.text" :key="item.text">{{item.title}}</Option>
              </Select>
            </FormItem>
            <FormItem label="是否需要树结构" v-if="formObj.type !== '2'">
              <Select v-model="formObj.needTree">
                <Option value="false">否</Option>
                <Option value="true">是</Option>
              </Select>
            </FormItem>
            <FormItem label="树结构表单" v-if="formObj.needTree === 'true' && formObj.type !== '2'">
              <Select v-model="formObj.treeForm">
                <Option v-for="item in treeForms" :value="item.title" :key="item.title">{{item.name}}</Option>
              </Select>
            </FormItem>
            <FormItem label="输入框分组标签">
              <div class="table-search-con">
                <Button type="primary" @click="addLegend">新增</Button>
              </div>
              <Table :columns="legendColumns" :data="formLegendData"></Table>
            </FormItem>
          </Form>
        </Col>
      </Row>
      <div class="text-center">
        <Button class="mr100" @click="cancel">取消</Button>
        <Button type="primary" @click="nextStep">下一步</Button>
      </div>
    </swiper-slide>
    <swiper-slide>
      <Row>
        <Col span="12">
          <Form :label-width="150">
            <draggable class="add-field-con" v-model="formControls" :options="dragToOptions">
              <FormItem v-for="(item, index) in formControls" :key="index" :label="item.title">
                <Row>
                  <Col span="14">
                    <template v-if="item.fieldType === 'textbox' || item.fieldType === 'filebox'">
                      <Input :placeholder="item.prompt"></Input>
                    </template>
                    <template v-else-if="item.fieldType === 'textboxMultiline'">
                      <Input type="textarea" :rows="item.height/32" :placeholder="item.prompt"></Input>
                    </template>
                    <template v-else-if="item.fieldType === 'numberbox'">
                      <InputNumber :min="item.min" :max="item.max" :precision="item.precision" :placeholder="item.prompt"></InputNumber>
                    </template>
                    <template v-else-if="item.fieldType === 'combobox'">
                      <Select :multiple="item.multiple" :placeholder="item.prompt">
                        <Option value="1">请选择</Option>
                      </Select>
                    </template>
                    <template v-else-if="item.fieldType === 'radio'">
                      <RadioGroup v-model="radioTemp">
                        <Radio v-for="(radioItem, index) in item.radios" :key="index" :label="radioItem"></Radio>
                      </RadioGroup>
                    </template>
                    <template v-else-if="item.fieldType === 'checkbox'">
                      <CheckboxGroup v-model="checkboxTemp">
                      <Checkbox v-for="(checkboxItem, index) in item.checkboxs" :key="index" :label="checkboxItem"></Checkbox>
                      </CheckboxGroup>
                    </template>
                    <template v-else-if="item.fieldType === 'switch'">
                      <i-switch></i-switch>
                    </template>
                    <template v-else-if="item.fieldType === 'datebox'">
                      <DatePicker type="date" :placeholder="item.prompt"></DatePicker>
                    </template>
                    <template v-else-if="item.fieldType === 'datetimebox'">
                      <DatePicker type="datetime" :placeholder="item.prompt"></DatePicker>
                    </template>
                    <template v-else-if="item.fieldType === 'monthbox'">
                      <DatePicker type="month" :placeholder="item.prompt"></DatePicker>
                    </template>
                    <template v-else-if="item.fieldType === 'yearbox'">
                      <DatePicker type="year" :placeholder="item.prompt"></DatePicker>
                    </template>
                    <template v-else-if="item.fieldType === 'tablebox'">
                      <Table></Table>
                    </template>
                    <template v-if="item.fieldType === 'passwordbox'">
                      <Input type="password" :placeholder="item.prompt"></Input>
                    </template>
                  </Col>
                  <Col span="10" class="text-center">
                    <Button @click="showSet(item)">设置</Button>
                    <Button type="error" @click="deleteField(item)">删除</Button>
                    <template v-if="item.flag">
                      已设置
                    </template>
                    <template v-else>
                      <span style="color:red;">未设置</span>
                    </template>
                  </Col>
                </Row>
              </FormItem>
            </draggable>
          </Form>
          <Modal v-model="modalField" title="设置字段属性" width="900" :loading="loading" @on-ok="saveField">
            <div class="modal-field-con">
              <div class="modal-field-2">
                <Form ref="formField" :model="field" :rules="ruleValidate" :label-width="120">
                  <FormItem label="数据库字段名" prop="text">
                    <Input v-model="field.text"></Input>
                  </FormItem>
                  <FormItem label="字段标题" prop="title">
                    <Input v-model="field.title"></Input>
                  </FormItem>
                  <template v-if="field.fieldType !== 'tablebox'">
                    <FormItem label="字段宽度">
                      <Select v-model="field.width">
                        <Option v-if="field.fieldType !== 'textboxMultiline'" value="278">普通</Option>
                        <Option value="703">整行</Option>
                      </Select>
                    </FormItem>
                    <template v-if="field.fieldType === 'textboxMultiline'">
                      <FormItem label="字段高度">
                        <Select v-model="field.height">
                          <Option value="32">一行</Option>
                          <Option value="64">两行</Option>
                          <Option value="96">三行</Option>
                          <Option value="128">四行</Option>
                          <Option value="160">五行</Option>
                        </Select>
                      </FormItem>
                    </template>
                    <FormItem label="是否禁用">
                      <Select v-model="field.disabled">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <FormItem label="是否只读">
                      <Select v-model="field.readonly">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <FormItem label="是否必填">
                      <Select v-model="field.required">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <FormItem label="是否列表显示">
                      <Select v-model="field.listDisplay">
                        <Option value="true">是</Option>
                        <Option value="false">否</Option>
                      </Select>
                    </FormItem>
                    <FormItem label="列表字段宽度">
                      <InputNumber min="0" v-model="field.trWidth"></InputNumber><span class="modal-field-tips">0为自适应</span>
                    </FormItem>
                    <FormItem label="列表对齐方式">
                      <Select v-model="field.trAlign">
                        <Option value="left">左对齐</Option>
                        <Option value="center">居中对齐</Option>
                        <Option value="right">右对齐</Option>
                      </Select>
                    </FormItem>
                    <template v-if="['radio', 'checkbox', 'switch'].indexOf(field.fieldType) === -1">
                      <FormItem label="提示信息">
                        <Input v-model="field.prompt"></Input>
                      </FormItem>
                    </template>
                  </template>
                  <!-- <template v-if="field.fieldType === 'textboxMultiline'">
                    <FormItem label="文本域行数">
                      <Slider v-model="field.rows" :min="1" :max="5"></Slider>
                    </FormItem>
                  </template> -->
                  <template v-if="field.fieldType === 'numberbox'">
                    <FormItem label="最小值">
                      <Input v-model="field.min"></Input>
                    </FormItem>
                    <FormItem label="最大值">
                      <Input v-model="field.max"></Input>
                    </FormItem>
                    <FormItem label="数值精度">
                      <InputNumber v-model="field.precision" :min="0" :step="1"></InputNumber>
                    </FormItem>
                    <FormItem label="是否需要计算">
                      <Select v-model="field.needCalculate">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <template v-show="field.needCalculate === 'true'">
                      <FormItem label="计算方式">
                        <Select v-model="field.calculateType">
                          <Option value="multiply">乘</Option>
                          <Option value="plus">加</Option>
                          <option value="divide">除</option>
                          <option value="minus">减</option>
                        </Select>
                      </FormItem>
                      <FormItem v-show="field.calculateType === 'multiply' || field.calculateType === 'plus'" label="从哪些字段计算">
                        <Select v-model="field.calculateFields" multiple>
                          <Option v-for="item in fieldsForSelect" :value="item.text" :key="item.text">{{item.title}}</Option>
                        </Select>
                      </FormItem>
                      <template v-show="field.calculateType === 'divide' || field.calculateType === 'minus'">
                        <FormItem label="前数">
                          <Select v-model="field.calculateFirstField">
                            <Option v-for="item in fieldsForSelect" :value="item.text" :key="item.text">{{item.title}}</Option>
                          </Select>
                        </FormItem>
                        <FormItem label="后数">
                          <Select v-model="field.calculateLastField">
                            <Option v-for="item in fieldsForSelect" :value="item.text" :key="item.text">{{item.title}}</Option>
                          </Select>
                        </FormItem>
                      </template>
                    </template>
                  </template>
                  <template v-if="field.fieldType === 'combobox'">
                    <FormItem label="是否支持多选">
                      <i-switch v-model="field.multiple"></i-switch>
                    </FormItem>
                    <FormItem label="选项来源">
                      <Select v-model="field.selectType">
                        <Option value="0">普通</Option>
                        <Option value="1">引用</Option>
                        <Option value="2">树形</Option>
                      </Select>
                    </FormItem>
                    <FormItem v-show="field.selectType === '0'" label="关联选项">
                      <Select v-model="field.selectID">
                        <Option v-for="(item, index) in normalSelect" :key="index" :value="item.table_name">
                          {{item.title}}
                        </Option>
                      </Select>
                    </FormItem>
                    <FormItem v-show="field.selectType === '1'" label="关联选项">
                      <Select v-model="field.selectID" @on-change="changeQuoteSelect">
                        <Option v-for="(item, index) in quoteSelect" :key="index" :value="item.name">
                          {{item.disc}}
                        </Option>
                      </Select>
                    </FormItem>
                    <FormItem v-show="field.selectType === '2'" label="关联选项">
                      <Select v-model="field.selectID">
                        <Option v-for="(item, index) in treeSelect" :key="index" :value="item.table_name">
                          {{item.title}}
                        </Option>
                      </Select>
                    </FormItem>
                    <template v-if="field.selectType === '1' && field.selectID !== ''">
                      <FormItem class="whole-line-tablebox" label="输入参数">
                        <Table border :columns="quoteSelectInColumns" :data="quoteSelectInTableData" stripe></Table>
                      </FormItem>
                      <FormItem class="whole-line-tablebox" label="输出参数">
                        <Table border :columns="quoteSelectColumns" :data="quoteSelectTableData" stripe></Table>
                      </FormItem>
                    </template>
                    <FormItem label="是否级联下拉">
                      <Select v-model="field.cascade">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <FormItem v-show="field.cascade === 'true'" label="级联字段">
                      <Select v-model="field.cascadeField">
                        <Option v-for="(item, index) in cascadeFields" :key="index" :value="item.text">
                          {{item.title}}
                        </Option>
                      </Select>
                    </FormItem>
                  </template>
                  <template v-if="field.fieldType === 'radio'">
                    <FormItem label="选项">
                      <Input v-model="radiosText" type="textarea" :rows="5"></Input>
                      一行一个选项
                    </FormItem>
                  </template>
                  <template v-if="field.fieldType === 'checkbox'">
                    <FormItem label="选项">
                      <Input v-model="checkboxsText" type="textarea" :rows="5"></Input>
                       一行一个选项
                    </FormItem>
                  </template>
                  <template v-if="['datebox', 'datetimebox', 'monthbox', 'yearbox'].indexOf(field.fieldType) !== -1">
                    <FormItem label="是否取当前时间">
                      <Select v-model="field.currentDate">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                  </template>
                  <template v-if="['tablebox', 'filebox'].indexOf(field.fieldType) === -1">
                    <template v-if="['datebox', 'datetimebox', 'monthbox', 'yearbox'].indexOf(field.fieldType) === -1">
                      <FormItem label="新增时是否自动填写">
                        <Select v-model="field.autoFill">
                          <Option value="false">否</Option>
                          <Option value="true">是</Option>
                        </Select>
                      </FormItem>
                      <FormItem v-show="field.autoFill === 'true'" label="自动填写类型">
                        <Select v-model="field.autoFillType">
                          <Option v-for="(item, index) in autoFillType" :key="index" :value="item.value">
                            {{item.text}}
                          </Option>
                        </Select>
                      </FormItem>
                      <template v-if="field.autoFillType === 'interface'">
                        <FormItem label="写入数据接口地址">
                          <Input v-model="field.autoFillInterface"></Input>
                        </FormItem>
                        <FormItem class="whole-line-tablebox" label="接口参数">
                          <div class="table-search-con">
                            <Button type="primary" @click="addAutoFillParam">新增</Button>
                          </div>
                          <Table border :columns="autoFillParamColumns" :data="autoFillParamData" stripe></Table>
                        </FormItem>
                      </template>
                      <template v-if="field.autoFillType === 'value'">
                        <FormItem label="写入数据值">
                          <Input v-model="field.autoFillValue"></Input>
                        </FormItem>
                      </template>
                    </template>
                    <FormItem label="是否写入其他字段">
                      <Select v-model="field.writeOtherField">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <template v-if="field.writeOtherField === 'true'">
                      <FormItem label="写入字段">
                        <Select v-model="field.writeOtherFieldName">
                          <Option v-for="(item, index) in formControls" :key="index" :value="item.text">
                            {{item.title}}
                          </Option>
                        </Select>
                      </FormItem>
                      <FormItem label="写入数据接口地址">
                        <Input v-model="field.writeOtherFieldInterface"></Input>
                      </FormItem>
                      <FormItem label="接口参数名">
                        <Input v-model="field.writeOtherFieldInterfaceParam"></Input>
                      </FormItem>
                      <FormItem class="whole-line-tablebox" label="接口其他参数">
                        <div class="table-search-con">
                          <Button type="primary" @click="addWriteOtherFieldParam">新增</Button>
                        </div>
                        <Table border :columns="writeOtherFieldParamColumns" :data="writeOtherFieldParamData" stripe></Table>
                      </FormItem>
                    </template>
                    <template v-if="field.fieldType === 'textbox'">
                      <FormItem label="是否由其他字段值拼接组成">
                        <Select v-model="field.splitByOtherField">
                          <Option value="false">否</Option>
                          <Option value="true">是</Option>
                        </Select>
                      </FormItem>
                      <template v-if="field.splitByOtherField === 'true'">
                        <FormItem label="拼接的其他字段">
                          <Select v-model="field.splitFields" multiple>
                            <Option v-for="(item, index) in formControls" :key="index" :value="item.text">
                              {{item.title}}
                            </Option>
                          </Select>
                        </FormItem>
                      </template>
                      <FormItem label="是否通过接口验证">
                        <Select v-model="field.isInterfaceValidate">
                          <Option value="false">否</Option>
                          <Option value="true">是</Option>
                        </Select>
                      </FormItem>
                      <FormItem v-show="field.isInterfaceValidate === 'true'" label="验证数据接口地址">
                        <Input v-model="field.validateInterface"></Input>
                      </FormItem>
                    </template>
                  </template>
                  <template v-if="field.fieldType === 'tablebox'">
                    <FormItem label="子表">
                      <Select v-model="field.tableTitle" @on-change="initChildFormFields">
                        <Option v-for="item in childTables" :value="item.title" :key="item.title">{{item.name}}</Option>
                      </Select>
                    </FormItem>
                    <FormItem label="是否表格内编辑">
                      <Select v-model="field.editChildTable">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <FormItem label="是否字段数据计算后写入主表字段">
                      <Select v-model="field.calculateToMain">
                        <Option value="false">否</Option>
                        <Option value="true">是</Option>
                      </Select>
                    </FormItem>
                    <FormItem v-show="field.calculateToMain === 'true'" label="要计算的字段">
                      <Select v-model="field.calculateChildField">
                        <Option v-for="item in childFormFields" :value="item.text" :key="item.text">{{item.title}}</Option>
                      </Select>
                    </FormItem>
                    <FormItem v-show="field.calculateToMain === 'true'" label="计算方式">
                      <Select v-model="field.calculateChildFieldType">
                        <Option value="multiply">乘</Option>
                        <Option value="plus">加</Option>
                      </Select>
                    </FormItem>
                    <FormItem v-show="field.calculateToMain === 'true'" label="写入主表字段">
                      <Select v-model="field.calculateToMainField">
                        <Option v-for="item in formControls" :value="item.text" :key="item.text">{{item.title}}</Option>
                      </Select>
                    </FormItem>
                  </template>
                </Form>
                <div class="clear"></div>
              </div>
            </div>
          </Modal>
        </Col>
        <Col span="10" offset="2">
          <div class="controls-con">
            <Form :label-width="120">
              <draggable v-model="controlArray" @end="dragEnd" :options="dragOptions">
                <FormItem v-for="(item, index) in controlArray" :key="index" :label="item.title">
                  <template v-if="item.fieldType === 'textbox' || item.fieldType === 'filebox'">
                    <Input></Input>
                  </template>
                  <template v-else-if="item.fieldType === 'textboxMultiline'">
                    <Input type="textarea" :rows="2"></Input>
                  </template>
                  <template v-else-if="item.fieldType === 'numberbox'">
                    <InputNumber></InputNumber>
                  </template>
                  <template v-else-if="item.fieldType === 'combobox'">
                    <Select>
                      <Option value="1">请选择</Option>
                    </Select>
                  </template>
                  <template v-else-if="item.fieldType === 'radio'">
                    <Radio>单选框</Radio>
                  </template>
                  <template v-else-if="item.fieldType === 'checkbox'">
                    <Checkbox>多选框</Checkbox>
                  </template>
                  <template v-else-if="item.fieldType === 'switch'">
                    <i-switch></i-switch>
                  </template>
                  <template v-else-if="item.fieldType === 'datebox'">
                    <DatePicker type="date"></DatePicker>
                  </template>
                  <template v-else-if="item.fieldType === 'datetimebox'">
                    <DatePicker type="datetime"></DatePicker>
                  </template>
                  <template v-else-if="item.fieldType === 'monthbox'">
                    <DatePicker type="month"></DatePicker>
                  </template>
                  <template v-else-if="item.fieldType === 'yearbox'">
                    <DatePicker type="year"></DatePicker>
                  </template>
                  <template v-else-if="item.fieldType === 'tablebox'">
                    <Table></Table>
                  </template>
                  <template v-if="item.fieldType === 'passwordbox'">
                    <Input type="password"></Input>
                  </template>
                </FormItem>
              </draggable>
            </Form>
          </div>
        </Col>
      </Row>
      <div class="text-center">
        <Button class="mr100" @click="cancel">取消</Button>
        <Button type="primary" class="mr100" @click="prevStep">上一步</Button>
        <Button type="primary" @click="saveForm">保 存</Button>
      </div>
    </swiper-slide>
  </swiper>
  <Modal v-model="modalQuoteSelect" title="修改输出字段" @on-ok="saveQuoteSelectData">
    <div class="modal-field-con">
      <div>
        <Form :model="quoteSelectObj" :label-width="120">
          <FormItem label="字段名">
            <Input v-model="quoteSelectObj.name"></Input>
          </FormItem>
          <FormItem label="类型">
            <Input v-model="quoteSelectObj.type"></Input>
          </FormItem>
          <FormItem label="组件名">
            <Select v-model="quoteSelectObj.inputName">
              <Option v-for="item in formControls" :value="item.text" :key="item.text">{{item.title}}</Option>
            </Select>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalQuoteSelectIn" title="修改输入字段" @on-ok="saveQuoteSelectInData">
    <div class="modal-field-con">
      <div>
        <Form :model="quoteSelectInObj" :label-width="120">
          <FormItem label="名称">
            <Input :value="quoteSelectInObj.name"></Input>
          </FormItem>
          <FormItem label="数据库字段">
            <Input :value="quoteSelectInObj.sql_para_name"></Input>
          </FormItem>
          <FormItem label="条件">
            <Input :value="urlInParaTypeFormat(quoteSelectInObj.type)"></Input>
          </FormItem>
          <FormItem label="是否必须">
            <Input :value="trueFalseFormat(quoteSelectInObj.is_necessary)"></Input>
          </FormItem>
          <FormItem label="输入类型">
            <Select v-model="quoteSelectInObj.option">
              <Option v-for="item in urlInParaOption" :value="item.value" :key="item.value">{{item.text}}</Option>
            </Select>
          </FormItem>
          <FormItem v-show="quoteSelectInObj.option === 'write'" label="输入值">
            <Input v-model="quoteSelectInObj.value"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalWriteOtherFieldParam" :title="modalWriteOtherFieldParamTitle" @on-ok="saveWriteOtherFieldParam">
    <div class="modal-field-con">
      <div>
        <Form :model="writeOtherFieldParamObj" :label-width="120">
          <FormItem label="参数名">
            <Input v-model="writeOtherFieldParamObj.name"></Input>
          </FormItem>
          <FormItem label="数值">
            <Input v-model="writeOtherFieldParamObj.value"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalAutoFillParam" :title="modalAutoFillParamTitle" @on-ok="saveAutoFillParam">
    <div class="modal-field-con">
      <div>
        <Form :model="autoFillParamObj" :label-width="120">
          <FormItem label="参数名">
            <Input v-model="autoFillParamObj.name"></Input>
          </FormItem>
          <FormItem label="数值">
            <Input v-model="autoFillParamObj.value"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
  <Modal v-model="modalLegend" :title="modalLegendTitle" @on-ok="saveLegend">
    <div class="modal-field-con">
      <div>
        <Form :model="legendObj" :label-width="120">
          <FormItem label="名称">
            <Input v-model="legendObj.name"></Input>
          </FormItem>
          <FormItem label="前一字段">
            <Select v-model="legendObj.field">
              <Option v-for="item in formControls" :value="item.text" :key="item.text">{{item.title}}</Option>
            </Select>
          </FormItem>
        </Form>
      </div>
    </div>
  </Modal>
</div>
</template>
<script>
import draggable from 'vuedraggable'
import Util from '@/utils/index'
export default {
  components: {
    draggable // 拖拽插件
  },
  data () {
    return {
      method: this.$route.params.method, // 新增或修改方法
      urlInParaCondition: this.$store.state.urlInParaCondition, // 链接输入参数条件列表
      modalField: false, // 设置字段属性对话框是否显示
      currentStep: 0, // 步骤
      field: {}, // 当前字段
      formObj: {}, // 表单对象
      controlArray: this.$store.state.controlArray, // 字段类型列表
      formControls: [], // 表单字段
      normalSelect: this.$store.state.normalSelect, // 普通下拉选项
      quoteSelect: this.$store.state.quoteSelect, // 引用下拉选项
      treeSelect: this.$store.state.treeSelect, // 树形下拉选项
      urlInParaOption: this.$store.state.urlInParaOption, // 引用下拉输入参数类型列表
      radiosText: '', // 单选框文本
      radioTemp: '', // 单选框临时数据
      checkboxsText: '', // 多选框文本
      checkboxTemp: '', // 多选框临时数据
      swiperOption: { // 滑动配置
        allowTouchMove: false
      },
      childTables: [], // 子表数组
      quoteSelectColumns: [ // 引用下拉输出字段表格表头
        { key: 'name', title: '字段名' },
        { key: 'type', title: '类型' },
        { key: 'inputName', title: '组件名' },
        {
          title: '操作',
          key: 'action',
          width: 80,
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
                    this.editQuoteSelectData(params)
                  }
                }
              }, '修改')
            ])
          }
        }
      ],
      quoteSelectTableData: [], // 引用下拉输出字段表格数据
      modalQuoteSelect: false, // 修改输出字段对话框是否显示
      quoteSelectObj: {}, // 引用下拉输出字段对象
      quoteSelectInColumns: [ // 引用下拉输入字段表格表头
        { key: 'name', title: '名称' },
        { key: 'sql_para_name', title: '数据库字段' },
        {
          key: 'type',
          title: '条件',
          render: (h, params) => {
            return h('div', Util.urlInParaTypeFormat(params.row.type))
          }
        },
        {
          key: 'is_necessary',
          title: '是否必须',
          render: (h, params) => {
            return h('div', Util.trueFalseFormat(params.row.is_necessary))
          }
        },
        {
          key: 'option',
          title: '输入选项',
          render: (h, params) => {
            return h('div', Util.urlInParaOptionFormat(params.row.option))
          }
        },
        {
          key: 'value',
          title: '输入值'
        },
        {
          title: '操作',
          key: 'action',
          width: 80,
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
                    this.editQuoteSelectInData(params)
                  }
                }
              }, '修改')
            ])
          }
        }
      ],
      quoteSelectInTableData: [], // 引用下拉输入字段表格数据
      modalQuoteSelectIn: false, // 修改输入字段对话框是否显示
      quoteSelectInObj: {}, // 引用下拉输入字段对象
      writeOtherFieldParamColumns: [ // 写入数据接口其他参数表头
        { key: 'name', title: '名称' },
        { key: 'value', title: '输入值' },
        {
          title: '操作',
          key: 'action',
          width: 120,
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
                    this.editWriteOtherFieldParam(params)
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
                    this.deleteWriteOtherFieldParam(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      writeOtherFieldParamData: [], // 写入数据接口其他参数数据
      modalWriteOtherFieldParam: false, // 修改写入数据接口其他参数对话框是否显示
      modalWriteOtherFieldParamTitle: '', // 写入数据接口其他参数对话框标题
      writeOtherFieldParamObj: {}, // 写入数据接口其他参数对象
      writeOtherFieldParamIndex: {}, // 写入数据接口其他参数对象位置
      autoFillType: this.$store.state.autoFillType, // 新增时自动填写类型
      autoFillParamColumns: [ // 自动填写接口参数表头
        { key: 'name', title: '名称' },
        { key: 'value', title: '输入值' },
        {
          title: '操作',
          key: 'action',
          width: 120,
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
                    this.editAutoFillParam(params)
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
                    this.deleteAutoFillParam(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      autoFillParamData: [], // 自动填写接口参数数据
      modalAutoFillParam: false, // 修改自动填写接口参数对话框是否显示
      modalAutoFillParamTitle: '', // 自动填写接口参数对话框标题
      autoFillParamObj: {}, // 自动填写接口参数对象
      autoFillParamIndex: {}, // 自动填写接口参数位置
      childFormFields: [], // 子表字段组
      treeForms: [], // 树结构表单数据
      formListUrl: this.$store.state.formListUrl, // 表单数据列表地址
      legendColumns: [ // 字段分组标签表头
        { key: 'name', title: '名称' },
        { key: 'field', title: '位置前一字段' },
        {
          title: '操作',
          key: 'action',
          width: 120,
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
                    this.editLegend(params, params.index)
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
                    this.deleteLegend(params, params.index)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      formLegendData: [], // 字段分组标签数据
      modalLegend: false, // 字段分组标签对话框是否显示
      modalLegendTitle: '', // 字段分组标签对话框标题
      legendObj: {}, // 字段分组标签对象
      currentLegendIndex: 0, // 当前字段分组标签位置
      ruleValidate: { // 字段设置表单验证
        text: [
          { required: true, message: '请填写数据库字段名', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请填写字段标题', trigger: 'blur' }
        ]
      },
      loading: true // 字段设置弹框载入状态
    }
  },
  methods: {
    /**
    * @desc 初始化
    */
    init: function () {
      if (this.method === 'edit') {
        this.formObj = this.$store.state.currentEditForm
        this.formControls = Util.removeFieldTable(this.formObj.field)
        this.formLegendData = this.formObj.formLegendData === undefined ? [] : this.formObj.formLegendData
        console.log(this.formControls)
      }
      this.$api.post('/crm/ActionFormUtil/getChildTableByType.do', {}, r => { // 取所有子表
        if (r.data) {
          this.childTables = r.data.rows
        }
      })
      this.$api.post('/crm/ActionFormUtil/getByType.do', { type: 2 }, r => { // 取树结构表单
        if (r.data) {
          this.treeForms = r.data
        }
      })
    },
    /**
    * @desc 前一步
    */
    prevStep: function () {
      this.currentStep = 0
      this.swiper.slidePrev()
    },
    /**
    * @desc 下一步
    */
    nextStep: function () {
      this.currentStep = 1
      this.swiper.slideNext()
    },
    /**
    * @desc 拖拽字段完成
    */
    dragEnd: function (evt) {
      let type = evt.item.innerText
      let arr = Util.copyArr(this.controlArray)
      if (type.indexOf('多行文本输入框') !== -1) {
        this.formControls.push(arr[1])
      } else if (type.indexOf('文本输入框') !== -1) {
        this.formControls.push(arr[0])
      } else if (type.indexOf('数字输入框') !== -1) {
        this.formControls.push(arr[2])
      } else if (type.indexOf('下拉选择器') !== -1) {
        this.formControls.push(arr[3])
      } else if (type.indexOf('单选框') !== -1) {
        this.formControls.push(arr[4])
      } else if (type.indexOf('多选框') !== -1) {
        this.formControls.push(arr[5])
      } else if (type.indexOf('开关选择器') !== -1) {
        this.formControls.push(arr[6])
      } else if (type.indexOf('日期选择器') !== -1) {
        this.formControls.push(arr[7])
      } else if (type.indexOf('日期时间选择器') !== -1) {
        this.formControls.push(arr[8])
      } else if (type.indexOf('月份选择器') !== -1) {
        this.formControls.push(arr[9])
      } else if (type.indexOf('年份选择器') !== -1) {
        this.formControls.push(arr[10])
      } else if (type.indexOf('子表') !== -1) {
        this.formControls.push(arr[11])
      } else if (type.indexOf('附件上传') !== -1) {
        this.formControls.push(arr[12])
      } else if (type.indexOf('密码输入框') !== -1) {
        this.formControls.push(arr[13])
      }
    },
    /**
    * @desc 开始设置字段属性
    * @param {Object} item 当前要设置的字段
    */
    showSet: function (item) {
      this.field = item
      this.field.trWidth = this.field.trWidth === undefined ? 0 : this.field.trWidth
      this.field.trAlign = this.field.trAlign === undefined ? 'left' : this.field.trAlign
      this.radiosText = item.radios ? item.radios.join('\n') : ''
      this.checkboxsText = item.checkboxs ? item.checkboxs.join('\n') : ''
      if (this.field.fieldType === 'numberbox' && this.field.precision === undefined) {
        this.field.precision = 0
      }
      if (this.field.fieldType === 'numberbox' && this.field.calculateFields === undefined) {
        this.field.calculateFields = []
      }
      if (this.field.fieldType === 'combobox' && this.field.selectType === '1') {
        if (this.field.selectFields !== undefined) {
          this.quoteSelectTableData = this.field.selectFields
        }
        if (this.field.inParas !== undefined) {
          this.quoteSelectInTableData = this.field.inParas
        }
      }
      if (this.field.writeOtherField === 'true') {
        this.writeOtherFieldParamData = this.field.writeOtherFieldParam
      }
      if (this.field.autoFill === 'true' && this.field.autoFillType === 'interface') {
        this.autoFillParamData = this.field.autoFillParamData
      }
      console.log(this.field)
      this.modalField = true
    },
    /**
    * @desc 删除字段
    * @param {Object} item 当前要删除的字段
    */
    deleteField: function (item) {
      this.$Modal.confirm({
        title: '',
        content: '确认删除此字段？',
        onOk: () => {
          this.formControls.splice(this.formControls.indexOf(item), 1)
        },
        onCancel: () => {
        }
      })
    },
    /**
    * @desc 保存字段属性
    */
    saveField: function () {
      this.$refs['formField'].validate((valid) => {
        if (valid) {
          this.field.text = Util.myTrim(this.field.text)
          this.field.radios = this.radiosText.split('\n')
          this.field.checkboxs = this.checkboxsText.split('\n')
          if (this.field.fieldType === 'combobox' && this.field.selectType === '1') {
            this.field.selectFields = this.quoteSelectTableData
            this.field.inParas = this.quoteSelectInTableData
          }
          if (this.field.writeOtherField === 'true') {
            this.field.writeOtherFieldParam = this.writeOtherFieldParamData
          }
          if (this.field.autoFill === 'true' && this.field.autoFillType === 'interface') {
            this.field.autoFillParamData = this.autoFillParamData
          }
          this.field.flag = true
          this.loading = false
          this.modalField = false
        } else {
          setTimeout(() => {
            this.loading = false
            this.$nextTick(() => {
              this.loading = true
            })
          }, 100)
        }
      })
    },
    /**
    * @desc 选择引用
    * @param {String} value 选中的引用下拉名
    */
    changeQuoteSelect: function (value) {
      let temp = this.quoteSelect.find((element) => (element.name === value))
      this.$api.post('/develop/url/getUrlById.do', { id: temp.id }, r => {
        this.quoteSelectTableData = r.data.urlOutputPara
        this.quoteSelectInTableData = r.data.urlIutputPara
      })
    },
    /**
    * @desc 链接输入参数条件格式化
    * @param {String} value 条件值
    * @return {String} 条件名
    */
    urlInParaTypeFormat: function (value) {
      return Util.urlInParaTypeFormat(value)
    },
    /**
    * @desc 是否条件格式化
    * @param {String} value 是否值
    * @return {String} 是否
    */
    trueFalseFormat: function (value) {
      return Util.trueFalseFormat(value)
    },
    /**
    * @desc 修改引用下拉的输入字段
    * @param {Object} params 输入字段对象
    */
    editQuoteSelectInData: function (params) {
      this.quoteSelectInObj = params.row
      this.modalQuoteSelectIn = true
    },
    /**
    * @desc 保存引用下拉的输入字段
    */
    saveQuoteSelectInData: function () {
      this.quoteSelectInTableData[this.quoteSelectInObj._index] = this.quoteSelectInObj
      console.log(this.quoteSelectInTableData)
    },
    /**
    * @desc 修改引用下拉的输出字段
    * @param {Object} params 输出字段对象
    */
    editQuoteSelectData: function (params) {
      this.quoteSelectObj = params.row
      this.modalQuoteSelect = true
    },
    /**
    * @desc 保存引用下拉的输出字段
    */
    saveQuoteSelectData: function () {
      this.quoteSelectTableData[this.quoteSelectObj._index] = this.quoteSelectObj
    },
    /**
    * @desc 新增写入数据接口其他参数
    */
    addWriteOtherFieldParam: function () {
      this.modalWriteOtherFieldParamTitle = '新增其他参数'
      this.writeOtherFieldParamObj = {}
      this.modalWriteOtherFieldParam = true
    },
    /**
    * @desc 修改写入数据接口其他参数
    * @param {Object} params 参数对象
    */
    editWriteOtherFieldParam: function (params) {
      this.modalWriteOtherFieldParamTitle = '修改其他参数'
      this.writeOtherFieldParamObj = params.row
      this.writeOtherFieldParamIndex = params.index
      this.modalWriteOtherFieldParam = true
    },
    /**
    * @desc 保存写入数据接口其他参数
    */
    saveWriteOtherFieldParam: function () {
      if (this.modalWriteOtherFieldParamTitle === '新增其他参数') {
        this.writeOtherFieldParamData.push(this.writeOtherFieldParamObj)
      } else {
        this.writeOtherFieldParamData[this.writeOtherFieldParamIndex] = this.writeOtherFieldParamObj
      }
      this.modalWriteOtherFieldParam = false
    },
    /**
    * @desc 删除写入数据接口其他参数
    * @param {Object} params 参数对象
    */
    deleteWriteOtherFieldParam: function (params) {
      this.writeOtherFieldParamData.splice(this.writeOtherFieldParamData.indexOf(params.row), 1)
    },
    /**
    * @desc 新增自动填写接口参数
    */
    addAutoFillParam: function () {
      this.modalAutoFillParamTitle = '新增参数'
      this.autoFillParamObj = {}
      this.modalAutoFillParam = true
    },
    /**
    * @desc 修改自动填写接口参数
    * @param {Object} params 参数对象
    */
    editAutoFillParam: function (params) {
      this.modalAutoFillParamTitle = '修改参数'
      this.autoFillParamObj = params.row
      this.autoFillParamIndex = params.index
      this.modalAutoFillParam = true
    },
    /**
    * @desc 保存自动填写接口参数
    */
    saveAutoFillParam: function () {
      if (this.modalAutoFillParamTitle === '新增参数') {
        this.autoFillParamData.push(this.autoFillParamObj)
      } else {
        this.autoFillParamData[this.autoFillParamIndex] = this.autoFillParamObj
      }
      console.log(this.autoFillParamData)
      this.modalAutoFillParam = false
    },
    /**
    * @desc 删除自动填写接口参数
    * @param {Object} params 参数对象
    */
    deleteAutoFillParam: function (params) {
      this.autoFillParamData.splice(this.autoFillParamData.indexOf(params.row), 1)
    },
    /**
    * @desc 新增字段分组标签
    */
    addLegend: function () {
      this.modalLegendTitle = '新增标签'
      this.legendObj = {}
      this.modalLegend = true
    },
    /**
    * @desc 修改字段分组标签
    * @param {Object} params 标签对象
    */
    editLegend: function (params, index) {
      this.modalLegendTitle = '修改标签'
      this.legendObj = params.row
      this.currentLegendIndex = index
      this.modalLegend = true
    },
    /**
    * @desc 保存字段分组标签
    */
    saveLegend: function () {
      if (this.modalLegendTitle === '新增标签') {
        this.formLegendData.push(this.legendObj)
      } else {
        this.formLegendData[this.currentLegendIndex] = this.legendObj
      }
      console.log(this.legendObj)
      console.log(this.formLegendData)
      this.modalLegend = false
    },
    /**
    * @desc 删除字段分组标签
    * @param {Object} params 标签对象
    */
    deleteLegend: function (params, index) {
      this.formLegendData.splice(index, 1)
    },
    /**
    * @desc 去子表字段组
    * @param {Object} params 输出字段对象
    */
    initChildFormFields: function (value) {
      this.$api.post('/pages/crminterface/getDatagridForJson.do', { tableName: value }, r => {
        this.childFormFields = r.data.field
      })
    },
    /**
    * @desc 判断表名重复
    */
    checkTableName: function () {
      this.$api.post('/pages/crminterface/IsExistenceForTableName.do', { tableName: this.formObj.title }, r => {
        if (r.data) {
          this.$Message.warning('数据库表单名已存在，请更改')
        }
      })
    },
    /**
    * @desc 返回
    */
    cancel: function () {
      this.$router.go(-1)
    },
    /**
    * @desc 保存表单
    */
    saveForm: function () {
      this.$Spin.show()
      delete this.formObj.str_json
      delete this.formObj.id
      delete this.formObj._index
      delete this.formObj._rowKey
      let temp = this.method === 'add' ? '新建' : '修改'
      if (this.formObj.type === '2' || this.formObj.needTree === 'true') {
        this.formControls.push({ fieldType: 'textbox', text: 'pid', title: '父ID', listDisplay: false, type: 'int' })
      }
      this.formObj.field = Util.fieldsAddType(this.formControls)
      let formLegendIndex = []
      for (let iterator of this.formLegendData) {
        formLegendIndex.push(this.formControls.findIndex(ele => ele.text === iterator.field))
      }
      this.formObj.formLegendData = this.formLegendData
      this.formObj.formLegendIndex = formLegendIndex
      let infoStr = JSON.stringify(this.formObj)
      console.log(infoStr)
      this.$api.post('/pages/crminterface/creatTable.do', { jsonStr: infoStr }, r => {
        console.log(r)
        this.$Spin.hide()
        if (r.data) {
          this.$Message.success(temp + '表单成功')
          this.$router.go(-1)
        } else {
          this.$swal(temp + '表单失败', '', 'error')
        }
      })
    }
  },
  computed: {
    dragOptions () { // 拖拽源配置
      return {
        group: {
          name: 'controlTo',
          pull: 'clone'
        },
        sort: false
      }
    },
    dragToOptions () { // 拖拽目标配置
      return {
        group: 'control'
      }
    },
    swiper () { // 滑动插件
      return this.$refs.mySwiper.swiper
    },
    fieldsForSelect () { // 表单字段转为下拉选项
      return Util.fieldsForSelect(this.formControls)
    },
    cascadeFields () { // 级联可选字段
      let temp = []
      for (let i = 0; i < this.formControls.length; i++) {
        if (this.formControls[i].fieldType === 'combobox') {
          temp.push(this.formControls[i])
        }
      }
      return temp
    }
  },
  mounted () {
    this.init()
  }
}
</script>
<style>
</style>
