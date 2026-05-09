const express = require('express')
const router = express.Router()
// 引入模型Product
const Product = require('../models/Product')

// 获取所有的产品
router.get('/product',(req,res) => {
  res.send('product page')
})









module.exports = router