const mongoose = require('mongoose')
// 定义一个约定schema
const schema = new mongoose.Schema({
    name:{type:String},
    title:{type:String},
    weight:{type:Number}
})
// 创建一个模型并导出
module.exports = mongoose.model('Product',schema)
