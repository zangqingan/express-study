module.exports = async () => {
    // 1.引入mongoose模块
    const mongoose = require('mongoose')
    // 引入数据库配置
    const {MONGODB_CONF} = require('./globalConfig')
    // 2.建立连接
    try {
      await mongoose.connect(MONGODB_CONF)
    } catch (error) {
      console.log("数据库连接失败",error)
      throw error
    }
}
