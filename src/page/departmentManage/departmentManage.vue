<template>
<div id="department">
    <div class="department-left">
        <div class="left-title">部门树形列表</div>
        <div class="left-center">
            <Tree :data="treeData"></Tree>
        </div>
    </div>
    <div class="department-right">
        <div class="right-title">
            <div class="department-name">
                <Input v-model="value11">
                    <span slot="prepend">部门名称</span>
                </Input>
            </div>
            <div class="department-query">
                <Button type="primary">查询</Button>
                {{departmentName}}
            </div>
        </div>
        <div class="right-center">
            <ul>
                <li><Button type="success">添加</Button></li>
                <li><Button type="success">修改</Button></li>
                <li><Button type="success">删除</Button></li>
            </ul>
            <div class="department-table">
                <Table border ref="selection" :columns="columns4" :data="data2"></Table>
                <Button @click="handleSelectAll(true)">Set all selected</Button>
                <Button @click="handleSelectAll(false)">Cancel all selected</Button>
            </div>
        </div>
    </div>
</div>
</template>
<script>
export default {
    data () {
        return {
            // departmentName: '山西鯤博',
            value11: '',
            treeData: [],
            columns4: [
                {
                    type: 'selection',
                    width: 60,
                    align: 'center'
                },
                {
                    title: 'Name',
                    key: 'name'
                },
                {
                    title: 'Age',
                    key: 'age'
                },
                {
                    title: 'Address',
                    key: 'address'
                }
            ],
            data2: [
                {
                    name: 'John Brown',
                    age: 18,
                    address: 'New York No. 1 Lake Park',
                    date: '2016-10-03'
                },
                {
                    name: 'Jim Green',
                    age: 24,
                    address: 'London No. 1 Lake Park',
                    date: '2016-10-01'
                },
                {
                    name: 'Joe Black',
                    age: 30,
                    address: 'Sydney No. 1 Lake Park',
                    date: '2016-10-02'
                },
                {
                    name: 'Jon Snow',
                    age: 26,
                    address: 'Ottawa No. 2 Lake Park',
                    date: '2016-10-04'
                }
            ]
        }
    },
    methods: {
        handleSelectAll (status) {
            this.$refs.selection.selectAll(status)
        },
        init: function () {
            this.$api.post('/depart/getTreeList', {}, r => {
                console.log(r.data)
                var str = JSON.stringify(r.data).replace(/name/g, 'title') // 把tree中 title转换为r.data中的name
                this.treeData = JSON.parse(str)
            })
        }
    },
    mounted () {
        this.init()
    }
}
</script>
<style lang="scss">
#department{
width: 100%;
height: auto;
.department-left{
    width: 20%;
    height: 500px;
    float: left;
    .left-title{
        width: 100%;
        height: 50px;
        background-color: #009efb;
        line-height: 50px;
        font-size: 20px;
        color: #ffffff;
        padding-left: 20px;
    }
    .left-center{
        background-color: #ffffff;
    }
}
.department-right{
    width: 79%;
    height: auto;
    float: right;
    .right-title{
        width: 100%;
        height: 100px;
        padding: 20px 0 0 20px;
        background: #ffffff;
        .department-name{
            float: left;
            display: inline-block;
            width: 300px;
            .ivu-input-group{
                height: 50px;
                .ivu-input{
                    height: 50px;
                }
            }
        }
        .department-query{
            display: inline-block;
            margin-left: 30px;
            .ivu-btn-primary{
                width: 100px;
                height: 50px;
                font-size: 20px;
            }
        }
    }
    .right-center{
        width: 100%;
        height: 660px;
        background: #ffffff;
        margin-top: 20px;
        ul{
            padding: 20px 0 0 20px;
            li{
                display: inline-block;
            }
        }
    }
}
}
</style>
