// 1.引入express框架
const express = require('express')
// 2.初始化express实例app，用来创建web服务器 ，express() 是一个由 express 模块导出的顶层入口（top-level）函数。
const app = express()

/*****引入各种配置、挂载路由、业务代码、其它中间件等开始 *****/
/*全局相关的配置 */
// 引入端口配置
const { PORT } = require('./config/config')

/*全局的静态资源托管配置使用express内置中间件 */
// app.use(express.static('public'))
// 虚拟目录
app.use('/static',express.static('public'))

/*全局的跨域配置一般直接使用第三方中间件 */
// 跨域,自定义中间件
// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//     res.header('Access-Control-Allow-Methods', '*');
//     res.header('Content-Type', 'application/json;charset=utf-8');
//     next();
// })
// 使用第三方cors模块处理跨域，这是表示所有的请求都通过，但是是可以只针对某个http请求的。
// const cors = require('cors')
// app.use(cors())
// 简写
app.use(require('cors')())

/*数据库连接配置文件导入 */
require('./config/dbConnect')()

/*全局的路由配置一般不写而是抽离成路由文件 */
// 最初的函数形式
// app.get('/normalfn', function (req, res)  {
//   res.send('最初的函数形式')
// })
// // 箭头函数
// app.get('/arrowfn', (req, res) => {
//   res.send('箭头函数形式')
// })
// // 下一版本的异步函数
// app.get('/asyncfn', async (req, res) => {
//   res.send('异步函数形式')
// })

/*路由文件导入 */
// const restfulApiRouter = require('./routers/restfulApi')
// // 注册路由
// app.use('/api',restfulApiRouter)
// const productRouter = require('./routers/product')
// // 注册路由
// app.use('/api',productRouter)

/*批量导入路由文件导入 */
// 引入并执行
// const allRouter = require('./routers/index')
// allRouter(app)
// 简写
require('./routers/index')(app)







// error handler
app.use((err, req, res, next) => {
  res.status(400).send(err.message)
})

/*****引入各种配置、挂载路由、业务代码、其它中间件等结束 *****/

// 3.开启http服务，监听3000端口。
app.listen(PORT,() => {
  console.log(`server is running on http://localhost:${PORT}`)
})