module.exports = async () => {
    // 1.引入mongoose模块
    const mongoose = require('mongoose')
    // 引入数据库配置
    const {MONGODB_CONF} = require('./globalConfig')
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
