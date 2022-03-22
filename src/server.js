const Koa = require('koa');
const cors = require('koa2-cors')
const bodyParser = require('koa-bodyparser') // 用来解析post请求的formData
const router = require('./router')


const app = new Koa();

// ----------------中间件----------------
app.use(cors())
app.use(bodyParser());
app.use(router.routes())


// const main = async(ctx) => {
//     // 首屏响应数据库数据
//     let getData = await sql.selectAll(selectAllSQL);
//     ctx.response.body = getData;
// };

// // 跨域
// // app.use(async(ctx, next) => {
// //     ctx.set('Access-Control-Allow-Origin', '*');
// //     ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
// //     ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
// //     if (ctx.method == 'OPTIONS') {
// //         ctx.body = 200;
// //     } else {
// //         await next();
// //     }
// // });
// // 改用cors跨域中间件
// app.use(cors())
// app.use(main);

app.listen(3000, () => {
    console.log("服务器已启动，3000端口监听中");
});