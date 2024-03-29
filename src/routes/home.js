const express = require('express')
// 创建子路由对象
const router = express.Router()
// 引入模型Product
const Product = require('../models/Product')


//解析 formdata
// const formidable = require('formidable')
// 路径处理
const path = require('path')

// 测试连接
router.get('/',(req,res) => {
  res.send('hello express')
})

// 登陆测试get请求
router.get('/login',async (req,res) => {
  console.log('query',req.query);
  res.send("登录路由，user为："+req.query.user+"==>   password为："+req.query.password);
})
// 登陆测试post请求
router.post('/login',async (req,res) => {
  console.log('body',req.body);
  res.send("登录路由，user为："+req.body.username+"==>   password为："+req.body.password);
})
// put方法测试
router.put('/putUser/:id',async (req,res) => {
    res.status(200).send({msg:'put ok'})
})
// patch方法测试
router.patch('/patchUser/:id',async (req,res) => {
    res.status(200).send({msg:'patch ok'})
})
// delete方法测试
router.delete('/deleteUser/:id',async (req,res) => {
    res.status(200).send({msg:'delete ok'})
})
// ajax通信连接数据库
router.get('/ajaxProduct',async (req,res) => {
 const data = await Product.find()
 res.send(data)
})
// ajax练习接口-检测邮箱
router.get('/verifyEmail',async (req,res) => {
  if(req.query.email == '18367319791@163.com'){
      res.status(400).send({
          message:'邮箱已经被注册过了'
      })
  }else{
      res.send({
          message:'邮箱注册成功'
      })
  }
})
// 搜索框输入文字自动提示练习
router.get('/search',async (req,res) => {
  console.log(req.query)
  if(req.query.value == '小王'){
      res.send([
          '小王的房子',
          '小王的车子',
          '小王的老婆',
          '小王的家',
          '小王的别墅'
      ])
  }else{
      res.send([
          '没找到'
      ])
  }
})
// 省市县三级联动
router.get('/province',async (req,res) => {
 res.send([
     {id:'001',name:'浙江省'},
     {id:'002',name:'湖南省'},
     {id:'003',name:'广东省'},
     {id:'004',name:'广西省'},
     {id:'005',name:'四川省'},
 ])
})
// 使用路由参数-也就是拼接在url后面的
router.get('/province/:id',async (req,res) => {
    const id = req.params.id
    console.log('req.params',req.params)
    const result = [
        {id:'001',name:'浙江省'},
        {id:'002',name:'湖南省'},
        {id:'003',name:'广东省'},
        {id:'004',name:'广西省'},
        {id:'005',name:'四川省'},
    ].find((item) => item.id === id)
    if(!result) {
        res.status(400).send('找不到省份')
    }
    res.send(result)
   })
router.get('/cities',async (req,res) => {
  // console.log(req.query.id)
  // 判断是那个省并返回对应市级信息
  if(req.query.id == '001'){
      res.send([{id:101,name:'杭州市'},{id:102,name:'宁波市'},{id:103,name:'嘉兴市'},])
  }else if(req.query.id == '002'){
      res.send([{id:201,name:'长沙市'},{id:202,name:'岳阳市'},{id:203,name:'凤凰市'},])
  }else if(req.query.id == '003'){
      res.send([{id:301,name:'广州市'},{id:302,name:'深圳市'},{id:303,name:'珠海市'},])
  }else if(req.query.id == '004'){
      res.send([{id:401,name:'南宁市'},{id:402,name:'玉林市'},{id:403,name:'贵港市'},])
  }else{
      res.send([{id:501,name:'成都市'},{id:502,name:'绵阳市'},{id:503,name:'雅安市'},])
  }        
})
router.get('/areaes',async (req,res) => {
  // console.log(req.query.id)
  // 判断是那个省并返回对应市级信息
  if(req.query.id == 101){
      res.send([{id:1011,name:'滨江区'},{id:1021,name:'西湖区'},{id:1031,name:'萧山区'},])
  }else if(req.query.id == 201){
      res.send([{id:2011,name:'天心区'},{id:2022,name:'芙蓉区'},{id:2033,name:'岳麓区'},])
  }else if(req.query.id == 301){
      res.send([{id:3011,name:'越秀区'},{id:3021,name:'番禺区'},{id:3031,name:'白云区'},])
  }else if(req.query.id == 401){
      res.send([{id:4011,name:'江南区'},{id:4021,name:'青秀区'},{id:4031,name:'青宁区'},])
  }else if(req.query.id == 501){
      res.send([{id:5011,name:'成华区'},{id:5021,name:'武侯区'},{id:5031,name:'金牛区'},])
  } 
})
//formdata 要使用formidable中间件解析
// router.post('/formdata',async (req,res) => {
//   // 创建formidable表单解析对象
//   const form =  new formidable.IncomingForm()
//   // 解析客户端传过来的formdata对象 fields普通内容,files文件
//   form.parse(req,(err,fields,files) => {
//       res.send(fields)
//   })
// })
//formdata 二进制文件上传要使用formidable中间件解析
// router.post('/upload',async (req,res) => {
//   // 创建formidable表单解析对象
//   const form =  new formidable.IncomingForm()
//   // 设置文件上传保存的路径
//   form.uploadDir = path.join(__dirname,'uploads')
//   //保留上传文件的后缀名
//   form.keepExtensions = true
//   // 解析客户端传过来的formdata对象 fields普通内容,files文件
//   form.parse(req,(err,fields,files) => {
//       // 将客户端传过来的文件地址传回给前端
//       res.send({
//           path:files.attrName.path.split('uploads')[1]
//       })
//   })
// })
// jsonp测试
router.post('/jsonp',async (req,res) => {
  //获取前端传过来的回调函数名
  const callbackName = req.query.callback
  // 定义一个函数调用形式的字符串
  const result = callbackName + '({name:"zhangsan"})'
  //返回
  res.send(result)
 
})

router.get('/cookies',async (req,res) => {
    // 后端设置cookie返回
    res.cookie("name",'zhangsan',{maxAge: 900000, httpOnly: true})
    res.status(200).send({msg:'cookie'})
})
router.get('/send-cookies',async (req,res) => {
    // 后端设置cookie返回
    console.log('req.headers.cookie',req.headers.cookie)
    console.log('req.cookies',req.cookies)
    // 这里就可以判断cookie是否是正确的
    res.status(200).send({msg:'send-cookies'})
})
// 验证
router.get('/auth',async (req,res) => {
    // 1. 获取前端传入的用户名和密码
    // 2. 查找数据库是否存在，不存在报错'用户不存在'、密码不正确报错
    // 3. 找到了、设置session
    req.session.user = findUser.username
})

// 导出子路由对象
module.exports = router