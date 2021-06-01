// 获取当前环境变量
const env = process.env.NODE_ENV
// 设置端口号，实际应该放到全局的配置文件中
const PORT = process.env.PORT || 3000

// 数据库地址配置
let MONGODB_CONF
// 开发环境
if(env === "dev"){
  MONGODB_CONF = 'mongodb://localhost:27017/express-test'
}

// production环境实际应该是线上地址
if(env === 'production'){
  // 实际开发时写真实的
  MONGODB_CONF = 'mongodb://localhost:27017/express-test'

}

module.exports = {
  PORT,
  MONGODB_CONF
}