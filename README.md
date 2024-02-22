# 一、概述
对基于 Node.js 平台，快速、开放、极简的 Web 开发框架express的学习记录。
2024.2.22 重新梳理express技术栈、总结出express作为web server时需要的技术。

# 二、Express.js基础

## 2.1 定义
express是一个基于 Node.js 平台的，快速的、开放的、极简的 Web 开发框架，本质上是对原生nodejs的http模块的二次封装，并提供api方便开发者加快项目开发，便于团队开发。它类似于前端的jQuery。它是nodejs最常用的web server框架。我们主要也是学习express框架作为web server提供api使用。

[官方网站](http://expressjs.com) 主要用来查询相关api

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




## 2.7 



## 2.8


# 三、express入门

##  3.2 express框架创建web服务器

常见属性如下：
 req:request的缩写，表示请求对象，可以用来获取一些客户端请求发送给服务器的信息。
 即客户端传过来的东西，不难看出它是对原生node的更近一步封装。
 常用请求对象：
 req.headers 获取请求头信息(是一个对象)
 req.rawHeaders 获取请求头信息(是一个数组)
 req.httpVersion 获取http协议的版本
 req.method 获取http请求的方法类型名，大写
 req.url 获取整个请求路径path,包括查询字符串。所以可以通过 '?' 进行拆分，前面为路由，后面为查询字符串
 req.query = { } 是一个对象存储了查询字符串信息，可以获得用户发送的get请求
 req.params = { } 是一个对象存储了动态路由参数信息
 req.body = { } 前端post请求传过来的请求体信息，需要第三方中间件才能解析。
 req.on() 用来监听事件

 res:response的缩写，表示响应对象，是服务器端响应给浏览器的一些数据。需要程序猿编写指明返回的是什么。即：我们设置返回给浏览器的信息。
 常用响应对象：
 res.statusCode = 404 设置响应的状态码
 res.statusMessage = 'Not Found' 设置响应信息
 res.setHeader('Content-Type','text/html;charset=utf-8') 设置响应头的数据编码格式
 res.send() 响应数据返回给前端



# 四、中间件
## 4.1 中间件概述
&emsp;&emsp;express中间件是在最终请求处理程序之前在原始请求之后所以叫中间件，它的本质是一个函数，一个可以访问请求对象req，响应对象res，和next()应用程序请求-响应周期中下一个函数(调用这个函数就会将控制权传递给下一个中间件函数。)的函数。
事实上所有中间件在使用express实例的use()方法注册后最终都会挂载到入口文件的express实例app上,存放在一个处理堆栈中，然后根据客户端HTTP请求的path和method来判断触发了哪些中间件就执行哪个中间件，通过next()函数可以将控制权传递给下一个中间件函数，这就是中间件工作的流程本质上都是一样的当满足条件时，就执行对应的中间件函数。
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
1. 应用层中间件：即挂载在express实例上的中间件。
app.use(path,middleware1,middleware2,....,middlewaren),将中间件注册(添加)到 app全局处理堆栈上。
这个是不看http是那种请求方法都匹配，同时如果还不指定路径就是所有的请求都要执行一次这个中间件。
app.METHOD(path,middleware1,middleware2,....,middlewaren),将中间件添加到app上的METHOD处理堆栈上。
这个METHOD是一个小写的http请求方法名，常见有：get、post、put、patch、delete等。

2. 路由中间件：与应用层中间件的工作方式一模一样，不过是将中间件添加到路由实例即 express.Router()的实例的处理堆栈上。实际就是express的内置中间件，也是我们实际开发中划分路由使用的中间件。
//router.js
// 1.引入express
const express = require('express')
// 2.初始化路由实例对象
const router = express.Router()
<!-- 1,2两步一起写 -->
const router = require('express').Router()

router.use(path,middleware1,middleware2,....,middlewaren)，将中间件注册(添加)到router实例全局处理堆栈上。
router.METHOD(path,middleware1,middleware2,....,middlewaren)，将中间件注册(添加)到router实例的METHOD处理堆栈上

3. 错误处理中间件，比其它中间件多一个err形参，用来做错误的统一处理
语法：function(err,req,res,next){
  //code
}

4. express内置中间件，由express对象自带的方法。
express.static() 静态资源托管
express.json() 处理json格式相关
express.Router() 产生一个路由实例

5. 第三方提供的中间件，这个是关键。
如：处理日期格式的中间件，错误处理的中间件，处理cookie的中间件，处理session的中间件等等。

## 4.3 express路由
在入口文件运行起来后就已经有了一个web服务器了，接下来就是对浏览器发起请求的响应了。这是通过路由来确定如何响应浏览器客户端对某种资源的请求，即对URI和特定HTTP请求方法的请求。每一个路由都可以拥有一个或多个处理函数，它们在路由匹配时就会执行。
1. 直接使用app上的全局路由方法：app.METHOD(PATH , HANDLER)。app是express的一个实例它可以使用各种中间件。但是一般都不用做路由，而是调用 app.use() 方法用来注册挂载其它第三方中间件。
app.all('/api',callback) 前端发送所有的http请求格式都匹配，无论何种http请求方法。常用来做全局验证或者全局检查，在所有路由前面书写即可。
如：app.all('*', requireAuthentication, loadUser)
或者匹配一部分如下：以/api开始的
app.all('/api/*', requireAuthentication)
app.get('/api', function (req, res) {
  res.send('Hello World!')
})
使用es6效果是一样的。
app.get('/about', (req, res) => {
  res.send('Hello World!')
})
传路由动态参数
app.get('/about/:id', (req, res) => {
  前端通过req.params 向后端传入参数。
  res.send('Hello World!')
})
2. 过多的路由时使用express的路由对象Router()生成子路由，它是通过使用顶层express的Router()方法，用来创建新的路由器对象然后导出到入口文件即可。
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

## 5.4 cookie中间件使用：
第三方提供的一个中间件：cookie-parser
安装：npm install cookie-parser
在入口文件app.js中引入并注册
const cookieParser = require('cookie-parser')
注册：app.use(cookieParser())
<!-- 设置cookie -->
res.cookie("name",'zhangsan',{maxAge: 900000, httpOnly: true});
res.cookie(名称,值,{配置信息})
设置之后在响应头的 Set-Cookie字段会有设置的cookie信息，之后发送请求时请求体就会携带上这个cookie信息
<!-- 获取设置的cookie -->
req.cookies.name;

关于设置cookie的参数说明：
    domain: 域名  
    name=value：键值对，可以设置要保存的 Key/Value，注意这里的 name 不能和其他属性项的名字一样 
    Expires： 过期时间（秒），在设置的某个时间点后该 Cookie 就会失效，如 expires=Wednesday, 09-Nov-99 23:12:40 GMT。
    maxAge： 最大失效时间（毫秒），设置在多少后失效 。
    secure： 当 secure 值为 true 时，cookie 在 HTTP 中是无效，在 HTTPS 中才有效 。
    Path： 表示 在那个路由下可以访问到cookie。
    httpOnly：是微软对 COOKIE 做的扩展。如果在 COOKIE 中设置了“httpOnly”属性，则通过程序（JS 脚本、applet 等）将无法读取到COOKIE 信息，防止 XSS 攻击的产生 。
    singed：表示是否签名cookie, 设为true 会对这个 cookie 签名，这样就需要用 res.signedCookies 而不是 res.cookies 访问它。被篡改的签名 cookie 会被服务器拒绝，并且 cookie 值会重置为它的原始值。
cookie加密：让客户端用户无法的获取cookie明文信息，是数据安全的重要部分。在注册时传入密钥
一般的我们可以在保存cookie时对cookie信息进行加密，或者在res.cookie中对option对象的signed属性设置设置成true即可。当option中signed设置为true后，底层会将cookie的值与“secret”进行hmac加密；

也可以使用crypto模块进行加密

## 5.5 session中间件使用：
session是另一种记录客户状态的机制，与cookie保存在客户端浏览器不同，session保存在服务器当中；
相当于升级版本的cookie，存放在服务器端更加的安全。
当客户端访问服务器时，服务器会生成一个session对象，对象中保存的是key:value值，同时服务器会将key传回给客户端的cookie当中；当用户第二次访问服务器时，就会把cookie当中的key传回到服务器中，最后服务器会吧value值返回给客户端。
因此上面的key则是全局唯一的标识，客户端和服务端依靠这个全局唯一的标识来访问会话信息数据。
第三方提供的一个中间件断电会丢失：express-session
安装：npm install express-session
在入口文件app.js中引入并注册
const session = require('express-session')
注册：app.use(session({
    //配置对象。 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: ('name', 'value',{ maxAge: 5*60*1000,secure: false, name: "seName",resave: false})
}))
单独配置
//设置session
req.session.username="张三"
//获取session
req.session.username
//重新设置cookie的过期时间
req.session.cookie.maxAge=1000;
//销毁session
req.session.destroy(function(err){
})




					


## 5.6 multer中间件使用：
multer中间件用来处理multipart/form-data类型的表单数据
安装：npm install multer
前端页面的form表单需要设置 enctype="multipart/form-data"
引入
const multer = require('multer)
初始化上传对象，设置上传文件存放的目录位置
const upload = multer({dest:'/upload/'})
使用
app.use('upload',upload.single("files"),(req,res) => {

})
"files" 是前端input上传文件输入框的name属性值

文件下载：














