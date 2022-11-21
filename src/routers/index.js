// 中间件批量导入注册路由中间件
module.exports = app => {
    // 引入fs模块操作文件
    const fs = require('fs')
    // 使用readdir()方法获取文件名
    fs.readdir(__dirname,(err,data) => {
        // 判断读取是否成功
        if(err == null && err == undefined){
          // 对读取成功的数据进行遍历
          data.forEach(value => {
            // 如果是index.js则直接返回
            if(value ==="index.js"){return;}
            // 其它则引入并注册
            const router = require(`./${value}`)
            app.use('/api',router)
          })
        }else{
          // 输入错误信息
          console.log('read fail!',err)
        }
    })
}