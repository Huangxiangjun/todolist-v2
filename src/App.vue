<template>
  <div id="app" class="todoListBox">
    <div class="header-box">
      <div class="header-left">
        <div class="header-addicon">+</div>
        <h2>愿望清单</h2>
      </div>
      <div class="header-right">
        <!-- 显示 全选 或 取消全选 按钮 -->
        <button v-if="isSelectAll" class="header-selectAll" @click="cancelSelectAll">取消全选</button>
        <button v-else class="header-selectAll" @click="handleSelectAll">全选</button>
        <button class="header-add" @click="handleAdd">添加</button>
      </div>
    </div>

    <div class="content">
      <div class="content-item" v-for="(item,index) in todoList" :key="item.id">
        <!-- checkBox -->
        <div class="content-left" @click="handleSelectItem(index,item.id)">
          <span v-show="item.isCheck"></span>
        </div>
        <!-- inputBox -->
        <input 
          type="text" 
          class="content-input" 
          v-model="item.text"
          :disabled="item.isCheck"
          :class="item.isCheck ? 'line-through':''"
          @blur="handleBlur(index, item.id)"
          ref="inputBox"
        >
        <!-- deleteButton -->
        <div class="content-right">
          <p>{{item.time}}</p>
          <button @click="handleDelItem(index,item.id)">删除</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import dayjs from "dayjs"

export default {
  name: 'App',
  data(){
    return {
      temp:[],
      isSelectAll:true,
      todoList:[
        // {id:"1", isCheck:false, text:"123", time:"21-12-01 22:37"},
        // {id:"2", isCheck:true, text:"456", time:"21-15-11 22:37"},
      ],
    }
  },

  created: async function() {
    // get initial todolist from *localStorage*,改从*database*获取初始数据
    // let getList = JSON.parse(window.localStorage.getItem('ListTodo'))

    // 改为获取数据库过来的数据
    let data = await this.getDataFromDB()
    let getList = data
    if(getList === null || !getList.length) {
       this.todoList = [{
         id:this.getRandomId(), 
         isCheck:false, 
         text:"点击上方添加按钮添加事件", 
         time:dayjs(new Date).format("YY-MM-DD HH:mm"),
        }]
    }else {
      this.todoList = getList
    }

    this.storage();
  },
  mounted: function() {
    // 如果不是所有项目都被选中，显示全选按钮
    if(!this.todoList.length) {
      this.isSelectAll = false;
    }
    this.todoList.forEach(item => {
      if(!item.isCheck) {
        this.isSelectAll = false;
      }
    })
  },
  beforeUpdate: function() {
    // 每次改变选择按钮状态之后都要判断一下，决定了显示全选按钮还是取消全选按钮
    this.isSelectAll = true;
    if(!this.todoList.length) {
      this.isSelectAll = false;
    }
    this.todoList.forEach(item => {
      if(!item.isCheck) {
        this.isSelectAll = false;
      }
    })
  },

  methods: {
    // -----------------主要功能------------------
    // 添加项目
    handleAdd: function() {
      // 新增的放到todoList
      let newItem = {
        id:this.getRandomId(),
        isCheck:false,
        text:"",
        time:dayjs(new Date).format("YYYY-MM-DD HH:mm:ss")
      }
      this.todoList.unshift(newItem)
      // -------------新增的放到数据库
      this.post('/add', newItem)

      
      // 自动获取焦点
      const inputLength = this.todoList.length - 1
      this.$nextTick(() => {
        this.$refs.inputBox[inputLength].focus()
      })
    },

    // 删除项目
    handleDelItem: function(index, id) {
      if(this.todoList[index].id === id) {
        this.todoList.splice(index,1)
      }
      this.storage();

      // ---------删掉的那条到数据库删掉
      this.post('/del', id)
    },

    // 选择或取消选择单个项目
    handleSelectItem: function(index, id) {
      if(this.todoList[index].id === id) {
        this.todoList[index].isCheck = !this.todoList[index].isCheck
      }
      this.storage();

      // --------状态改变的那条去数据库update
      this.post('/changeStatus', {'isCheck':this.todoList[index].isCheck, 'id':id})
    },

    // 全选情况下取消全选
    cancelSelectAll: function() {
      this.todoList.forEach(item => {
        item.isCheck = false;
      })
      this.storage();

      // ----------数据库里所有item的isCheck属性update成0
      this.post('/cancelAll', {'isCheck':false})
    },

    // 非全选情况下进行全选
    handleSelectAll: function() {
      this.todoList.forEach(item => {
        item.isCheck = true;
      })
      this.storage();

      // ----------数据库里所有item的isCheck属性update成1
      this.post('/selectAll', {'isCheck':true})
    },

    // 失焦输入完成，进行存储
    handleBlur: function(index, id) {
      // 如果输入内容为空，就不计入
      // if(this.todoList[index].text === "") {
      //   this.todoList.splice(index,1)
      // }
      // this.storage();

      // -----如果内容为空，去数据库删除这条，并且不计入todoList
      if(this.todoList[index].text === "") {
        this.post('/blurDel', id)
        this.todoList.splice(index,1)
      } else {
      // -----如果不为空，去数据库update text属性
        this.post('/blurUpdate', {'text':this.todoList[index].text, 'id':id})
      }

      this.storage();
    },

    // ------------------封装功能---------------
    // generate random ID
    getRandomId: function() {
      return Number(Math.random().toString().substr(2,0) + Date.now()).toString(10)
    },
    
    // localStorage
    storage: function() {
      window.localStorage.setItem('ListTodo', JSON.stringify(this.todoList))
    },

    // 从数据库获取初始数据
    getDataFromDB: async function() {
      const {data} = await this.$http.get("/");
      // data.forEach(item => {
      //   console.log(item);
      // })
      return data
    },

    // 封装axios post请求
    post: function(url, item) {
      console.log(JSON.stringify(item));
      this.$http.post(url, JSON.stringify(item), {emulateJSON:true,' Content-Type':'application/json'})
      .then(res => console.log("请求发送成功:" + res), err => console.log("请求发送失败:" + err))
    }

  }
}
</script>

<style lang="less">
// 修改windows自带滚动轴
::-webkit-scrollbar { 
  width: 6px; 
  height: 8px; 
  background:#ccc; 
  border-radius: 10px; 
} 
::-webkit-scrollbar-button { 
  display: none; 
} 
::-webkit-scrollbar-thumb { 
  border-radius: 10px; 
  background: rgb(121, 119, 119); 
} 
::-webkit-scrollbar-track { 
  border-radius: 10px; 
  background: #ccc; 
} 

button {
  padding: 7px 15px;
  color: #fff;
  border:none;
  border-radius: 3px;
  background-color: rgb(88, 86, 86);
}

.todoListBox{
  width: 800px;
  height: 600px;
  background-color: #3C3E4F;
  border-radius: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  padding: 20px;
  
  .header-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: #ccc 1px solid;

    .header-left {
      display: flex;
      align-items: center;
      color: #fff;

      .header-addicon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #9999E6;
        font-size: 30px;
        line-height: 46px;
        text-align: center;
        margin-right: 20px;
      }
    }
    .header-right {

      .header-selectAll{
        background-color: #C43F38;
        margin-right: 10px;
      }

      .header-add{
        background-color: #70B870;
      }
    }
  }

  .content {
    margin-top: 50px;
    height: 450px;
    overflow-y:scroll;
    padding-right: 10px;

    .content-item {
      display: flex;
      justify-content: space-between;
      background-color: #6B6F7D;
      align-items: center;
      padding: 5px 10px;
      border-radius: 8px;
      box-sizing: border-box;
      margin-bottom: 15px;

      .content-left {
        position: relative;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: #ccc 1px solid;
        span {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #ccc;
        }
      }

      .content-input {
        flex:1;
        margin: 0 20px;
        outline: none;
        background: transparent;
        border: none;
        border-bottom: #ccc 1px solid;
        padding: 2px 5px;
        color: #ccc;
      }

      // 完成之后横线划掉效果
      .line-through {
        color: rgba(255,255,255,0.2);
        text-decoration: line-through rgba(255,255,255,0.8);
      }

      .content-right {
        display: flex;
        align-items: center;
        
        p {
          color: #ccc;
        }

        button {
          margin-left: 20px;
          background-color: rgb(150, 31, 31);
        }
      }
    }
  }

}
</style>
