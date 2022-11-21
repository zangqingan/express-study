const mongoose = require('mongoose')
// 定义一个约定schema
const schema = new mongoose.Schema({
    name:{type:String},
    title:{type:String},
    weight:{type:Number}
})
// 创建一个模型并导出
module.exports = mongoose.model('Product',schema)

// //引入mongoose模块
// const mongoose = require('mongoose')
// // 定义一个约束条件schema(集合里字段(field)的数据类型,默认值等)
// const schema = new mongoose.Schema({
//     name:{type:String,default:''},
//     items:[{image:{type:String},url:{type:String},}]    
// })
// // 创建一个模型(集合对象模型)并导出
// module.exports = mongoose.model('Ad',schema)

// //上面实际上是下面的简写
// // 注：在定义schema那里其实可以分成两步写的
// //1先获取schema对象
// const Schema = moogoose.Schema
// //2 new出规范实例
// const Adschema = new Schema({
//     name:{type:String},
//     items:[{image:{type:String},url:{type:String},}]    
// })
// //3使用model方法创建数据模型
// const Ad = mongoose.model('Ad', Adschema)
// //4导出Ad，这样就可以通过Ad这个变量对象来操作“广告”这个集合(表)了
// module.exports = Ad
// // 明显的这种写法过于麻烦作用记住前面那种即可。
