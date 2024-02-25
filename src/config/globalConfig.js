// 获取当前环境变量
const env = process.env.NODE_ENV
// 设置端口号，实际应该放到全局的配置文件中
const PORT = process.env.PORT || 3000

// jwt密钥
const SECRET = 'express-study-secret'

// mongodb数据库地址配置
let MONGODB_CONF
let MYSQL_CONF
// 开发环境
if(env === "dev"){
  MONGODB_CONF = 'mongodb://127.0.0.1:27017/express-test',
  MYSQL_CONF = {
    host:'localhost',
    user:'root',
    password:'123456',
    port:'3306',
    database:'teststudy'
  }
}

// production环境实际应该是线上地址
if(env === 'production'){
  // 实际开发时写真实的
  MONGODB_CONF = 'mongodb://localhost:27017/express-test',
  // 实际开发时写真实的
  MYSQL_CONF = {
    // 域，线上环境就是线上的数据库地址，本地是localhost
    host:'localhost',
    // 用户
    user:'root',
    password:'123456',
    port:'3306',
    database:'myblog'//指定连接的数据库
  }

}

module.exports = {
  PORT,
  SECRET,
  MONGODB_CONF,
  MYSQL_CONF
}