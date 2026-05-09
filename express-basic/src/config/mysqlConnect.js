// 引入模块
const mysql = require('mysql')
// 引入配置
const { MYSQL_CONF } = require('./globalConfig')
// 创建数据库连接对象
const con = mysql.createConnection(MYSQL_CONF)
// 建立连接 
con.connect()
// 封装数据库操作函数 
async function exec(sql){
  const promise = new Promise(async (resolve,reject) => {
    await con.query(sql,(error,result) => {
      if(error){
        reject(error)
        return
      }
      resolve(result)
    })
  })
  return promise
}

// 导出
module.exports = {
  exec,
  // 防止sql注入
  escape:mysql.escape
}