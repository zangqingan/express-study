# express-study
对基于 Node.js 平台，快速、开放、极简的 Web 开发框架express的学习记录

#  一、express概述
&emsp;&emsp;express是一个基于 Node.js 平台的，快速的、开放的、极简的 Web 开发框架，本质上是对原生nodejs的二次封装，并提供api方便开发者加快项目开发，便于团队开发。它是nodejs最常用的web server框架。我们主要也是学习express框架作为web server提供api使用。
#  二、express安装
安装方法一：
1.和原生nodejs一样也先初始化node项目的包管理文件: package.json ,命令: npm init -y , -y选项会忽略命令行的询问，直接采用默认配置。
2.安装express框架(包): npm install express, 安装下一版本npm install express@next 
注意:在npm 5.0+以上的版本，默认情况下会将安装的模块添加到 package.json 文件中的 dependencies 列表中。而对于较老的 npm 版本，你就必须指定 --save 参数。这样在执行 npm install 命令时即可自动安装依赖列表中所列出的所有依赖模块。

使用方法二：使用 express-generator 脚手架快速创建一个express项目框架，之后就可以使用express关键字创建项目了。不过这个创建的项目前后端是不分离的，所以用的不多了解即可。
npm install express-generator -g
$ express --view= view engine projectName
如：express --view=ejs sobooks
# 三、express入门
## 3.1 express项目目录结构
&emsp;&emsp;这是人为定义的结构，事实上你可以所有代码都写在一个文件上如index.js。但是这样阅读不友好，也不利于开发和维护，所以人为的定义这种目录结构。
项目名/
  node_modules，安装的各种包存放目录
  public/，公共资源存放位置，如上传图片文件等资源
    upload，上传资源目录
  src/，项目源码存放位置
    config，各种配置的存放目录
    middleware，自定义或第三方中间件存放目录
    models，mongodb数据库集合存放目录
    controllers，具体业务处理代码存放目录
    routers，路由存放目录
    index.js，项目的入口启动文件，你也可以命名为app.js等等随你喜欢
  .gitignore，提交github等远程仓库时规定的忽略内容文件
  LICENSE，开源协议
  package.json，node项目的包管理文件
  README.md，读我文件用来记录项目的信息

##  3.2 express框架创建http服务器
&emsp;&emsp;在入口文件index.js里书写代码，引入各种配置、挂载路由、业务代码、其它中间件等具体代码会抽离书写在对应的项目结构目录中，以js文件存在。
1.引入express框架
const express = require('express')
2.初始化express实例app，用来创建web服务器 ，express() 是一个由 express 模块导出的顶层入口（top-level）函数。
const app = express()
/*****引入各种配置、挂载路由、业务代码、其它中间件等开始 *****/

app.get('/', (req, res) => {
  res.send('Hello World!')
})

/*****引入各种配置、挂载路由、业务代码、其它中间件等结束 *****/
3.开启http服务，监听3000端口。
app.listen(3000,() => {
  console.log('server is running on http://localhost:3000')
})
注意：在开启http服务之后，每次客户端发送请求时就会触发回调函数中的两个对象request，response。而express对这两个对象进行了进一步的封装。
常见如下：
 req:request的缩写，表示请求对象，可以用来获取一些客户端请求发送给服务器的信息。即客户端传过来的东西。
 常用请求对象：
 req.headers 获取请求头信息(是一个对象)
 req.rawHeaders 获取请求头信息(是一个数组)
 req.httpVersion 获取http协议的版本
 req.method 获取http请求的方法类型名，大写
 req.url 获取整个请求路径path,包括查询字符串。所以可以通过 '?' 进行拆分，前面为路由，后面为查询字符串
 req.query = { } 是一个对象存储了查询字符串信息，可以获得用户发送的get请求
 req.params = { } 是一个对象存储了动态路由参数信息
 req.body = { } 前端post请求传过来的请求体信息
 req.on() 用来监听事件

 res:response的缩写，表示响应对象，是服务器端响应给浏览器的一些数据。需要程序猿编写指明返回的是什么。即：我们设置返回给浏览器的信息。
 常用响应对象：
 res.statusCode = 404 设置响应的状态码
 res.statusMessage = 'Not Found' 设置响应信息
 res.setHeader('Content-Type','text/html;charset=utf-8') 设置响应头的数据编码格式
 res.send() 响应数据返回给前端



# 四、express中间件
## 4.1 中间件概述
&emsp;&emsp;express中间件本质就是一个函数，一个可以访问请求对象req，响应对象res，和next()应用程序请求-响应周期中下一个函数(调用这个函数就会将控制权传递给下一个中间件函数。)的函数。
事实上所有中间件在使用express实例的use()方法注册后最终都会挂载到入口文件的express实例上,存放在一个处理堆栈中，然后根据客户端HTTP请求的path和method来判断触发了哪些中间件就执行哪个中间件，通过next()函数可以将控制权传递给下一个中间件函数。
中间件是在最终请求处理程序之前在原始请求之后所以叫中间件，本质就是一个处理函数。
中间件的主要功能:
  执行任何封装的功能或业务代码
  修改req和res对象
  调用下一个中间件
  结束请求-响应循环。
中间件语法:
语法1:函数声明式
function(req,res,next){
  //req
  //res
  next()
}
语法2:箭头函数
(req,res,next) => {
  //req
  //res
  next()
}
语法3:异步函数
async (req,res,next) => {
  //req
  //res
  next()
}

## 4.2 中间件分类
本质上都是一样的当满足条件时，就执行对应的中间件函数。
分类：
1.应用层中间件：即挂载在express实例上的中间件。
app.use(path,middleware1,middleware2,....,middlewaren),将中间件注册(添加)到 app全局处理堆栈上。
这个是不看http是那种请求方法都匹配，同时如果还不指定路径就是所有的请求都要执行一次这个中间件。
app.METHOD(path,middleware1,middleware2,....,middlewaren),将中间件添加到app上的METHOD处理堆栈上。
这个METHOD是一个小写的http请求方法名，常见有：get、post、put、patch、delete等。

2.路由中间件：与应用层中间件的工作方式一模一样，不过是将中间件添加到 express.Router()的实例的处理堆栈上。实际就是express的内置中间件，也是我们实际开发中划分路由使用的中间件。
const router = express.Router()
router.use(path,middleware1,middleware2,....,middlewaren)，将中间件注册(添加)到router实例全局处理堆栈上。
router.METHOD(path,middleware1,middleware2,....,middlewaren)，将中间件注册(添加)到router实例的METHOD处理堆栈上

3.错误处理中间件，比其它中间件多一个err形参。用来做错误的统一处理
语法：function(err,req,res,next){
  //code
}

4.express内置中间件
express.static() 静态资源托管
express.json() 处理json格式相关
express.Router() 产生一个路由实例
5.第三方提供的中间件，这个是关键。
如：处理日期格式的中间件，错误处理的中间件，处理cookie的中间件，处理session的中间件等等。

## 4.3 express路由
在入口文件运行起来后就已经有了一个web服务器了，接下来就是对浏览器发起请求的响应了。这是通过路由来确定如何响应浏览器客户端对某种资源的请求，即对URI和特定HTTP请求方法的请求。每一个路由都可以拥有一个或多个处理函数，它们在路由匹配时就会执行。
1.直接使用app上的路由方法：app.METHOD(PATH , HANDLER)。app是express的一个实例它可以使用各种中间件。但是一般都不用做路由，而是用来注册其它第三方中间件。
app.all('api',callback)前端发送所有请求格式都匹配，
app.get('/api', function (req, res) {
  res.send('Hello World!')
})
使用es6效果是一样的。
app.get('/about', (req, res) => {
  前端通过req.params 向后端传入参数。
  res.send('Hello World!')
})
传路由动态参数
app.get('/about/:id', (req, res) => {
  res.send('Hello World!')
})
2.过多的路由时使用express路由对象Router()生成子路由，通过使用顶层express的Router()方法，用来创建新的路由器对象然后导出到入口文件即可。
const express = require('express')
const router = express.Router()
或者使用下面简写：
const router = require('express').Router()
router.get('/', function (req, res) {
  res.send('Birds home page')
})
module.exports = router
入口文件引入并注册
const productRouter = require('./routers/product')
// 注册路由
app.use('/api',productRouter)
缺陷：当有很多路由时每一个都要引入并注册，太过于繁琐。所以可以定义一个中转批量导出并注册路由的中间件。主要是利用node原生模块fs的readdir()方法,读取目录下所有文件的文件名并注册。

还有一种方法跟批量导入中间件一样，就是对每一个路由文件都变成一个函数导出，但是也一样要一个个导入入口文件，并不如上面的方法快整洁。所以以后还是用批量导入的方法。

## 4.4 express静态资源托管
使用 Express 中的 express.static() 内置中间件函数。
要使用多个静态资源目录，多次调用 express.static() 中间件即可：
例如：通过如下代码就可以将 public 目录下的图片、CSS 文件、JavaScript 文件等资源对外开放访问了
app.use(express.static('public'))
注册之后可以通过下面的方法访问：
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/index.html
注意：也可以创建一个虚拟目录来访问，即把path路径参数加上。
app.use('/static',express.static('public'))
访问：
http://localhost:3000/static/images/kitten.jpg

# 五、常用第三方中间件
## 5.1 cross-env中间件
cross-env中间件是用来跨平台设置环境变量的如：NODE_ENV=production
安装：npm install --save-dev cross-env
使用：在包管理文件的"scripts"选项中使用，如： "serve": "cross-env NODE_ENV=dev nodemon ./src/index.js",
## 5.2 cors跨域处理中间件
安装：npm install cors
使用：在入口文件引入并注册就可，这种是所有的请求都允许了。更细致的设置npm官网查看https://www.npmjs.com/https://www.npmjs.com/
## 5.3 mongoose中间件
mongoose中间件是专门用来操作mongodb数据库的中间件
安装：npm install mongoose
使用：一般连接mongodb数据库的配置和具体集合的定义都是抽离到js文件中的。
1.创建数据库连接
    module.exports = async () => {
    // 1.引入mongoose模块
    const mongoose = require('mongoose')
    // 引入数据库配置
    const {MONGODB_CONF} = require('./config')
    // 2.建立连接
    await mongoose.connect(
      MONGODB_CONF,
      { useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false,useCreateIndex: true},
      err => {
        if(err){
          // 数据库连接失败打印错误信息
          console.log("数据库连接失败",err)
          return;
        }
        console.log("数据库连接成功!")

      }
    )
}
2.根据实际情况创建集合

