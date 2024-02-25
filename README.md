# 一、概述
对基于 Node.js 平台，快速、开放、极简的 Web 开发框架express的学习记录。
2024.2.22 重新梳理express技术栈、总结出express作为web server时需要的技术。

# 二、Express.js基础

## 2.1 定义
express是一个基于 Node.js 平台的，快速的、开放的、极简的 Web 开发框架，本质上是对原生nodejs的http模块的二次封装，并提供api方便开发者加快项目开发，便于团队开发。它类似于前端的jQuery。它是nodejs最常用的web server框架。我们主要也是学习express框架作为web server提供api使用。

[官方网站](http://expressjs.com) 主要用来查询相关api
[中间件列表](http://expressjs.com/en/resources/middleware.html) 主要用来查询常用中间件

## 2.2 安装

1. 安装方法一：
 - 和原生nodejs一样也先初始化node项目的包管理文件: package.json ,命令: `$ npm init -y` , -y选项会忽略命令行的询问，直接采用默认配置。
 - 安装express框架: `$ npm install express`, 不过一般安装下一版本 5.x以上的 `$ npm install express@next `
注意:在npm 5.0+以上的版本，默认情况下会将安装的模块添加到 package.json 文件中的 dependencies 列表中。而对于较老的 npm 版本，你就必须指定 --save 参数。这样在执行 npm install 命令时即可自动安装依赖列表中所列出的所有依赖模块。

2. 安装方法二：使用 express-generator 脚手架快速创建一个express项目框架，之后就可以使用express关键字创建项目了。不过这个创建的项目前后端是不分离的，所以用的不多了解即可。
  - 先安装脚手架 `$ npm install -g express-generator`
  - 再指定模板引擎 `$ express --view= view engine projectName`
  - 如：express --view=ejs sobooks、创建一个模板引擎为ejs的 express项目 sobooks。

## 2.3 项目目录结构
和nodejs一样这是人为定义的结构，事实上你可以所有代码都写在一个文件上如index.js。
但是这样阅读不友好，也不利于开发和维护，所以人为的定义这种目录结构，这只是我个人的习惯。
使用脚手架时自带目录的。
```javaScript

项目名称
  -node_modules  项目安装依赖存放目录初始化node项目时自动生成
  -public 存放静态文件、图片、音频、视频等资源目录
    -images 图片
    -logs 日志
    -music 音乐
    -upload 上传资源目录
    -keys 密钥存放目录
    -.....其它静态资源
  -src 项目代码的实际存放位置
    -config 项目全局相关的配置
    -doc 存放项目说明文档、接口文档等
    -controllers 控制器具体业务处理代码存放目录
    -models 数据库表定义文件目录
    -middleware  自定义模块第三方中间件 
    -routers 项目路由
    -views 前后端不分离时的页面文件
    -utils 自定义工具类
    -index.js 项目入口文件，你也可以命名为app.js等等随你喜欢
  .gitignore，提交github等远程仓库时规定的忽略内容文件
  LICENSE，开源协议文件
  package.json，node项目的包管理文件
  README.md，读我文件用来记录项目信息的md文件

```

## 2.4 基本使用
使用express.js启动一个web server服务是非常简单且快速的。

**入口文件 index.js**
```javaScript
// 1.引入express框架
const express = require('express')
// 2.初始化express实例app，用来创建web服务器 ，express() 是一个由 express 模块导出的顶层入口（top-level）函数。
const app = express()

/*****引入各种配置、挂载路由、业务代码、其它中间件等开始 *****/
// 访问本地http://localhost:3000 就会返回 Hello World!
app.get('/', (req, res) => {
  res.send('Hello World!')
})

/*****引入各种配置、挂载路由、业务代码、其它中间件等结束 *****/

// 3.启动服务监听端口
app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})


```

## 2.5 express包提供的内容
### 1. express()
它express模块导出的顶级函数对象、在引入 express 之后得到的就是它。本质是 createApplication 函数。

### 2. express对象下挂载的常用的方法
这些方法本质是绑定在 exports 对象下的。
1. **express.static()**
在Express中提供静态文件功能-express.static(root,options)、它就是前端上次静态资源时存放的目录。
提供图像、CSS文件和JavaScript文件在本地加载访问的目录。
本质是一个中间件使用是很简单的、接受一个提供静态资产的根目录路径参数root和配置对象options。
```javaScript
// 直接指定目录使用
app.use(express.static('public'))
// 在public下的静态资源就能直接被访问到、注意'public'目录本身不是URL的一部分。
// 这是因为Express查找的是相对于静态目录的文件。
http://localhost:3000/images/kitten.jpg
http://localhost:3000/css/style.css
http://localhost:3000/js/app.js
http://localhost:3000/images/bg.png
http://localhost:3000/hello.html
// 增加虚拟目录(该路径目录在文件系统中实际上不存在)
app.use('/static',express.static('public'))
http://localhost:3000/static/images/kitten.jpg
http://localhost:3000/static/css/style.css
http://localhost:3000/static/js/app.js
http://localhost:3000/static/images/bg.png
http://localhost:3000/static/hello.html
// 注意上面两种方法指定的路径'public'都是相对于启动node进程的地方的，所以为了更安全我们应该使用如下方法
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))
app.use('/static', express.static(path.join(__dirname, 'public')))


```

2. **express.json()**
用来转换成JSON数据格式的方法。

3. **express.Router()**
用来创建一个新的路由对象、实际开发中是经常使用的根据业务模块的不同生产不同的子路由对象。
接收一个可选参数对象options指定路由器的行为、它的使用方法和应用程序对象app层级的路由一样

```javaScript

const express = require('express')
// 创建子路由对象
const router = express.Router()
// 接口
router.get('/login',handleCallback,handleCallback,...)
// ....其它接口

// 导出子路由对象-在入口文件注册即可。
module.exports = router

```


## 2.6 app对象
app对象通常表示Express应用程序、它是通过调用express模块导出的顶层express()函数来创建的。
本质上就是一个被设计作为回调传递给Node的HTTP服务器来处理网络请求的JavaScript回调函数、所以它其实是可以传递给 http.createServer()的。
这也意味着app里肯定也是有请求对象request、响应对象response、同时express增加了第三个参数 next函数用来释放事件句柄。
我们也是主要学习这个对象下的以下常用方法、主要是路由和中间件的处理。
1. 处理路由-即处理HTTP请求 - app.METHOD and app.param
2. 注册以及配置中间件 - app.use
3. Rendering HTML views - app.render
4. Registering a template engine - app.engine


### 1. app.listen([port[, host[, backlog]]][, callback]) 方法
和原生node的listen() 方法作用一样、应用实例初始化后用来绑定并监听指定主机和端口上的连接的方法。
express本质是对其做了一层封装、本质上返回的还是一个  http.Server 对象。
```javaScript
app.listen = function () {
  const server = http.createServer(this)
  return server.listen.apply(server, arguments)
}

```

### 2. app.use([path,] callback [, callback...])方法
在指定路径上挂载指定的中间件函数或函数:当HTTP网络请求的请求路径与path匹配时执行中间件函数。
1. 可选路径参数path可以是以下的值-就是实际开发中的api接口路径-默认值是root('/')也就是所有。
    1. 表示路径的字符串 - '/abcd' -> 匹配 /abcd
    2. 匹配路径的路径模式 - '/ab(c?)d' -> 匹配 /abcd 和 /abd
    3. 匹配路径的正则表达式模式 - /\/abc|\/xyz/ -> 匹配 /abc and /xyz
    4. 上述3个任意项的组合数组 - ['/abcd', '/xyza', /\/lmn|\/pqr/] -> 匹配 /abcd, /xyza, /lmn, and /pqr
2. callback-路径匹配时执行的中间件函数、可以是以下的值
    1. 一个中间件函数
    2. 多个中间件函数(以逗号分隔)
    3. 中间件函数数组
    4. 以上所有的组合。
**中间件函数示例:**
```javaScript
// 一个
app.use((req, res, next) => {
  next()
})

// 多个
const r1 = express.Router()
r1.get('/', (req, res, next) => {
  next()
})
const r2 = express.Router()
r2.get('/', (req, res, next) => {
  next()
})
app.use(r1, r2)

//  使用数组进行逻辑分类	
const r1 = express.Router()
r1.get('/', (req, res, next) => {
  next()
})
const r2 = express.Router()
r2.get('/', (req, res, next) => {
  next()
})
app.use([r1, r2])

// 以上组合
function mw1 (req, res, next) { next() }
function mw2 (req, res, next) { next() }

const r1 = express.Router()
r1.get('/', (req, res, next) => { next() })

const r2 = express.Router()
r2.get('/', (req, res, next) => { next() })

const subApp = express()
subApp.get('/', (req, res, next) => { next() })

app.use(mw1, [mw2, r1, r2], subApp)


```

### 3. app.METHOD(path, callback [, callback ...])方法
路由指的是确定应用程序如何响应对特定端点的客户机请求，这是一个URI(或路径)和一个特定的HTTP请求方法(GET、POST等)。在原生node里我们是使用请求对象的 url和method属性来确定一个路由、而express里是给我们封装了可以直接使用。这个是app应用层面的路由、一般会根据业务使用 express.Router() 方法创建子路由对象。
**路由语法**
app.METHOD(PATH, HANDLER)
  - app是express的一个实例。
  - METHOD是一个HTTP请求方法，使用小写形式。
  - PATH是服务器上的路径、即接口地址取值和app.use()方法一致。
  - HANDLER是匹配路由时执行的回调函数、取值和app.use()方法一致。

```javaScript
// get请求
app.get('/', (req, res) => {
  res.send('Hello World!')
})
// post请求
app.post('/', (req, res) => {
  res.send('Got a POST request')
})
// put请求
app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})
// delete请求
app.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})

```



## 2.7 Request 请求对象
在express里对HTTP请求对象Request进行了进一步的封装、更方便使用了。
app.use和app.METHOD的回调函数第一个参数就是它一般缩写为req。
**和原生node比较**
| 字段说明      | 原生node | express    |
| :---        |    :----:   |          ---: |
| 获取请求头信息对象      | req.headers       | req.headers   |
| 获取http请求的方法类型名   | req.method        | req.method     |
| 获取整个请求路径path,注意它是包括查询字符串   | req.url        | req.originalUrl、还可以使用req.baseUrl、细分    |
| 路由路径   |  对req.url通过 '?' 进行拆分，前面为路由       | req.path直接获取      |
| 查询字符串对象   | 对req.url通过 '?' 进行拆分，后面为查询字符串        | req.query 对象存储了查询字符串信息     |
| 路由参数   | 自己计算        | req.params对象存储了动态路由参数信息     |
| post请求传递数据   | 通过req.on方法监听data end事件        | req.body 需要第三方中间件才能解析    |
| cookies数据   | 自己添加       |  使用cookie-parser中间件时自动放到 req.cookies对象上    |



```javaScript
app.get('/user/:id', (req, res) => {
  res.send(`user ${req.params.id}`)
})
// 路由参数
Route path: /users/:userId/books/:bookId
app.get('/users/:userId/books/:bookId', (req, res) => {
  res.send(req.params)
})
Request URL: http://localhost:3000/users/34/books/8989
req.params: { "userId": "34", "bookId": "8989" }


```



## 2.8 Response 响应对象
res对象表示Express应用程序在收到HTTP请求时发送的HTTP响应。
app.use和app.METHOD的回调函数第二个参数就是它一般缩写为res。

**和原生node比较**
| 字段说明      | 原生node | express    |
| :---        |    :----:   |          ---: |
| 设置响应的HTTP状态码      | res.statusCode = code       | res.status(code)   |
| 结束响应过程   | res.end(JSON.stringify(data))        | res.end()它是不带任何数据的      |
| 结束响应过程并返回数据   | res.end(JSON.stringify(data))         | res.send() 或者res.json()     |
| 响应头设置   | res.writeHead(statusCode,statusMessage,headers)   | res.set({'Content-Type': 'text/plain'})      |
| 响应头设置   | res.setHeader('Content-Type','text/html;charset=utf-8')  | res.set('Content-Type', 'text/plain')     |

```javaScript
//body参数可以是Buffer对象、String、object、Boolean或Array
res.send(Buffer.from('whoop'))
res.send({ some: 'json' })
res.send('<p>some html</p>')
res.status(404).send('Sorry, we cannot find that!')
res.status(500).send({ error: 'something blew up' })



```



# 三、Middleware 中间件

## 3.1 中间件概述
express中间件是在最终请求处理程序之前在原始请求之后所以叫中间件，它的本质是一个函数。
一个可以访问请求对象req，响应对象res，和next()应用程序请求-响应周期中下一个函数(调用这个函数就会将控制权传递给下一个中间件函数)的函数。
**中间件的主要功能:**
1. 执行任何封装的功能或业务代码
2. 对请求和响应对象进行更改
3. 结束请求-响应周期、res.end() res.send()等方法。如果当前中间件函数没有结束请求-响应周期，它必须调用next()将控制传递给下一个中间件函数。否则，请求将被挂起。
4. 调用下一个中间件

事实上所有中间件在使用app.use()方法注册后最终都会挂载到入口文件的express实例app上,存放在一个处理堆栈中，然后根据客户端HTTP网络请求的path和method来判断触发了哪些中间件就执行哪个中间件，通过next()函数可以将控制权传递给下一个中间件函数，这就是中间件工作的流程。
简单说就是当满足条件时，就执行对应的中间件函数。

如果需要中间件是可配置的，那么可以导出一个接受选项对象或其他参数的函数，然后根据输入参数返回中间件实现。

**中间件语法**
```javaScript
// 语法1:函数声明式
const name1 = function(req,res,next){
  //req
  //res
  next()
}
// 语法2:箭头函数
const name2 = (req,res,next) => {
  //req
  //res
  next()
}
// 语法3:异步函数
const name3 = async (req,res,next) => {
  //req
  //res
  next()
}
// 语法4:封装导出
// my-middleware.js
module.exports = function (options) {
  return function (req, res, next) {
    // 具体实现
    next()
  }
}
// 使用
const mw = require('./my-middleware.js')
app.use(mw({ option1: '1', option2: '2' }))

// 要加载中间件函数，调用app.use()，并指定中间件函数。可以指定路径也可以省略。
app.use(name1,name2,name3)

```

## 3.2 中间件分类
Express是一个路由和中间件web框架，它自己的功能很少:Express应用程序本质上是一系列中间件函数调用。
就是根据HTTP网络请求的方法和路径匹配中间件函数、匹配上就执行反之则否。

**Express应用程序可以使用以下类型的中间件:**
1. 应用层中间件：即挂载在express实例app上的中间件。
app.use(path,middleware1,middleware2,....,middlewaren),将中间件注册(添加)到 app全局处理堆栈上。
这个是不看http是那种请求方法都匹配，同时如果还不指定路径就是每当应用程序接收到请求时，都会执行中间件。
app.METHOD(path,middleware1,middleware2,....,middlewaren),将中间件添加到app上的METHOD处理堆栈上。
这个METHOD是一个小写的http请求方法名，常见有：get、post、put、patch、delete等。
可以通过 next('route') 跳过当前路由将控制权传递给下一个路由。

```javaScript
const express = require('express')
const app = express()
// 没有挂载路径的中间件函数、每当应用程序接收到请求时，都会执行该函数。
app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})
// 挂载在/user/:id路径上的中间件函数。对于/user/:id路径上的任何类型的HTTP请求，都会执行该函数。
app.use('/user/:id', (req, res, next) => {
  console.log('Request Type:', req.method)
  next()
})
// 处理对/user/:id路径的GET请求。
app.get('/user/:id', (req, res, next) => {
  res.send('USER')
})
// 加载一系列中间件函数-要调用 next()释放
app.use('/user/:id', (req, res, next) => {
  console.log('Request URL:', req.originalUrl)
  next()
}, (req, res, next) => {
  console.log('Request Type:', req.method)
  next()
})

```

2. 路由中间件：与应用层中间件的工作方式一模一样，不过是将中间件添加到路由实例即 express.Router()的实例的处理堆栈上。
实际就是express的内置中间件，也是我们实际开发中划分路由使用的中间件、通过使用router.use()和router.METHOD()函数加载路由器级中间件。
router.use(path,middleware1,middleware2,....,middlewaren)，将中间件注册(添加)到router实例全局处理堆栈上。
router.METHOD(path,middleware1,middleware2,....,middlewaren)，将中间件注册(添加)到router实例的METHOD处理堆栈上
也可以通过 next('route') 跳过当前路由将控制权传递给下一个路由。

```javaScript
//router.js
// 1.引入express
const express = require('express')
// 2.初始化路由实例对象
const router = express.Router()
// 1,2两步一起写
const router = require('express').Router()
// a middleware function with no mount path. This code is executed for every request to the router
router.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

// a middleware sub-stack shows request info for any type of HTTP request to the /user/:id path
router.use('/user/:id', (req, res, next) => {
  console.log('Request URL:', req.originalUrl)
  next()
}, (req, res, next) => {
  console.log('Request Type:', req.method)
  next()
})

// a middleware sub-stack that handles GET requests to the /user/:id path
router.get('/user/:id', (req, res, next) => {
  // if the user ID is 0, skip to the next router
  if (req.params.id === '0') next('route')
  // otherwise pass control to the next middleware function in this stack
  else next()
}, (req, res, next) => {
  // render a regular page
  res.render('regular')
})

// handler for the /user/:id path, which renders a special page
router.get('/user/:id', (req, res, next) => {
  console.log(req.params.id)
  res.render('special')
})

// mount the router on the app
app.use('/', router)

```

3. 错误处理中间件，总是接受四个参数(err,req,res,next)、err形参用来做错误的统一处理。
Express自带默认错误处理程序可以捕获和处理同步和异步发生的错误，因此开发者是不需要编写自己的错误处理程序的。
```javaScript
// 在路由处理程序和中间件中的同步代码中发生的错误不需要额外的工作可以直接抛出错误
app.get('/', (req, res) => {
  throw new Error('BROKEN') // Express will catch this on its own.
})
// 对于由路由处理程序和中间件调用的异步函数返回的错误，必须将它们传递给next()函数，Express将在该函数中捕获并处理它们。
app.get('/', (req, res, next) => {
  fs.readFile('/file-does-not-exist', (err, data) => {
    if (err) {
      next(err) // Pass errors to Express.
    } else {
      res.send(data)
    }
  })
})

// 语法
const errorHandle = function(err,req,res,next){
  //code
}
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

```

4. express内置中间件，由express对象自带的方法,它们也是可以使用app.use()注册的，因为它们也是一个中间件。
    - express.static() 静态资源托管
    - express.json() 处理json格式相关
    - express.Router() 产生一个路由实例

5. 第三方提供的中间件，这个是关键。
社区成熟的或者开发者自己定义的都算、本质就是一个函数。
使用第三方中间件作用是为Express应用添加功能如：处理日期格式的中间件，错误处理的中间件，处理cookie的中间件，处理session的中间件等等。
Express常用的第三方中间件可以查看[常用中间件列表](http://expressjs.com/en/resources/middleware.html)

# 四、常用中间件学习 
这些中间件主要包括由Express.js团队维护的、社区开发的、个人封装的。

## 4.1 cors 跨域处理中间件
前端接口请求发生跨域时、后端的解决方案
1. 自定义中间件解决
```javaScript
const cors = function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
   res.header('Access-Control-Allow-Methods', '*');
   res.header('Content-Type', 'application/json;charset=utf-8');
   next();
}
app.use(cors)


```  
2. 使用官方维护的中间件 cors
通过使用各种选项启用跨域资源共享(CORS)。
```javaScript
安装：npm install cors
const cors = require('cors')
// 启用所有
app.use(cors())
// 针对一个单独的路由
app.get('/products/:id', cors(), function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for a Single Route'})
})

```


## 4.2 body-parser 解析HTTP请求体
使用这个中间件后、数据会自动挂载在 req.body属性上。

```javaScript
const bodyParser = require('body-parser')
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// 解析 application/json
app.use(bodyParser.json())
app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
})

```

## 4.3 cookie 相关的中间件
官方维护的中间件 cookie-parser、它可以解析cookie header并填充到 req.cookies 属性上。
安装: `$ npm install cookie-parser`

```javaScript
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(cookieParser('secret'))// signed 要为true
// 设置cookie之后在响应头的 Set-Cookie字段会有设置的cookie信息
// 之后前端发送请求时请求体就会携带上这个cookie信息
res.cookie("name",'zhangsan',{maxAge: 900000, httpOnly: true})
res.cookie(名称,值,{配置信息})

// 获取设置的cookie-这个属性是在安装了cookieParser中间件才有的。
req.cookies
// 使用原生的属性获取cookie
req.headers.cookie

app.get('/', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)
})

```
**关于设置cookie的参数说明**
1. domain: 域名  
2. name=value：键值对，可以设置要保存的 Key/Value，注意这里的 name 不能和其他属性项的名字一样 
3. Expires： 过期时间（秒），在设置的某个时间点后该 Cookie 就会失效，如 expires=Wednesday, 09-Nov-923:12:40 GMT。
4. maxAge： 最大失效时间（毫秒），设置在多少后失效 。
5. secure： 当 secure 值为 true 时，cookie 在 HTTP 中是无效，在 HTTPS 中才有效 。
6. Path： 表示 在那个路由下可以访问到cookie。
7. httpOnly：是微软对 COOKIE 做的扩展。如果在 COOKIE 中设置了“httpOnly”属性，则通过程序（JS 脚applet 等）将无法读取到COOKIE 信息，防止 XSS 攻击的产生 。
8. singed：表示是否签名cookie, 设为true 会对这个 cookie 签名，这样就需要用 res.signedCookies 而不res.cookies 访问它。
被篡改的签名 cookie 会被服务器拒绝，并且 cookie 值会重置为它的原始值。
cookie加密：让客户端用户无法的获取cookie明文信息，是数据安全的重要部分。在注册时传入密钥
一般的我们可以在保存cookie时对cookie信息进行加密，或者在res.cookie中对option对象的signed属性设置设置成true即可。当option中signed设置为true后，底层会将cookie的值与“secret”进行hmac加密。

## 4.4 session 相关的中间件
session是另一种记录客户状态的机制，与cookie保存在客户端浏览器不同，session保存在服务器当中。
相当于升级版本的cookie，存放在服务器端更加的安全。
当客户端访问服务器时，服务器会生成一个session对象，对象中保存的是key:value值，同时服务器会将key传回给客户端的cookie当中；当用户第二次访问服务器时，就会把cookie当中的key传回到服务器中，最后服务器会吧value值返回给客户端。
因此上面的key则是全局唯一的标识，客户端和服务端依靠这个全局唯一的标识来访问会话信息数据。

1. 官方维护的是 cookie-session
安装: `$ npm install cookie-session`
**使用**
```javaScript
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: [/* secret keys */],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

```

2. 第三方提供的一个中间件断电会丢失：express-session
安装: `$ npm install express-session`
**使用**
```javaScript
const session = require('express-session')
app.use(session({
    //配置对象。 
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: false,
    cookie: ('name', 'value',{ maxAge: 5*60*1000,secure: false, name: "seName",resave: false})
}))
// 读取
req.session即可读取session对象。
//设置session
req.session.username="张三"
//获取session
req.session.username
//重新设置cookie的过期时间
req.session.cookie.maxAge=1000;
//销毁session
req.session.destroy(function(err){
})

```

## 4.5 multer中间件
multer中间件是用来处理 multipart/form-data 类型的表单数据的、前端页面的form表单需要设置 enctype="multipart/form-data"。也就是文件上传。

安装: `$ npm install multer`
```javaScript
// 前端
<form action="/profile" method="post" enctype="multipart/form-data">
  <input type="file" name="avatar" />
</form>
// 后端
const multer = require('multer)
// 初始化上传对象，设置上传文件存放的目录位置
const upload = multer({dest:'/upload/'})
app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // "avatar" 是前端input上传文件输入框的name属性值
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})
```

## 4.6 validator 参数验证中间件
前端传入的数据格式不对时直接报错不写入数据库，这是非常有必要的。
这个库提供了很多开箱即用的检验方法、如: 非空判断、是否是布尔值、数字等等。
它们都是一个中间件函数只需要在路由handler之前调用即可。
不过这些验证函数不会处理校验产生的错误。
安装: `$ npm install express-validator`

```javaScript
// 对query的检验
//  http://localhost:3000/hello?person=John 
const { query,validationResult,body,checkSchema  } = require('express-validator')
app.get('/hello', query('person').notEmpty().escape(), (req, res) => {
  const result = validationResult(req)
  // 有错误时把错误信息返回。 
  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() })
  }
  res.send(`Hello, ${req.query.person}`)
});
// escape() 转换html标签的防止xss攻击使用。
// http://localhost:3000/hello 就会返回一个错误
{
  "errors": [
    {
      "location": "query",
      "msg": "Invalid value",
      "path": "person",
      "type": "field"
    }
  ]
}
// 对请求体的检验
// 也可以自定义校验逻辑
app.post(
  '/create-user',
  body('email').custom(async value => {
    const user = await UserCollection.findUserByEmail(value)
    if (user) {
      throw new Error('E-mail already in use')
    }
  }),
  // 重写错误信息
  body('email').isEmail().withMessage('Not a valid e-mail address'),
  (req, res) => {
    // Handle the request
  }
)

// 使用模式schema: 模式是一种基于对象的方式，用于定义对请求的验证或清理。
// 指定已给schema使用 checkSchema函数、它接收一个约束对象
const createUserValidatorSchema ={
  username: {
    errorMessage: 'Invalid username',
    isEmail: true,
  },
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password should be at least 8 chars',
    },
  }
}

app.post(
  '/create-user',
  checkSchema(createUserValidatorSchema),
  (req, res) => {
    // Handle the request
  }
)

```


## 4.7 password 身份验证中间件
这是一种身份认证中间件非常灵活和模块化、可以使用:用户名和密码、邮箱等多种策略验证。
如本地的用户名和密码验证
安装`$ npm install passport passport-local`
**使用**

```javaScript
const passport = require('passport')
const LocalStrategy = require('passport-local')
const crypto = require('crypto')


router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

```

## 4.8
## 4.9
## 4.10
## 4.11

# 五、生产最佳实践
