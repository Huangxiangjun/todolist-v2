# todo-list

> todolist数据库版，在todo-list-v1的基础上增加了数据库的 增删改查

## MySQL Config
先保证启动了mysql
```
net start mysql
```
配置信息
```
database：todolist
table： todo_items.sql
```

## Vue Project setup

### Download dependent packages
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### After Compiled
```
  App running at:
  - Local:   http://localhost:8080/
  - Network: http://10.133.171.125:8080/
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

<hr>

### Node Setup

```
node src/server.js
```

### After Setup
```
服务器已启动，3000端口监听中
```