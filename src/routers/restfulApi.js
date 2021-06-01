// 1.引入express
const express = require('express')
// 2.初始化路由实例对象
const router = express.Router()


router.get('/',(req,res) => {
  res.send('hello express')
})







// 导出路由实例
module.exports = router