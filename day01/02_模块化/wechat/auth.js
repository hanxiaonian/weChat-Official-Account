const sha1 = require("sha1");
// 引入config模块
const config = require('../config')
/*
* 验证服务器有效性模块
* */
module.exports = () => {
    return (req, res, next) => {
        // 微信服务器传来的参数
        // console.log(req)

        console.log(req.query)
        /*
            {
              signature: '22196be1b9ce358b40b060d25110f6aafaebdc3b',    //微信加密签名
              echostr: '5613195638641446751',       //微信随机字符串
              timestamp: '1632797462',      //微信的发送请求时间戳
              nonce: '2039581380'       //微信的随机数字
            }
        * */
        const {signature, echostr, timestamp, nonce} = req.query;
        const {token} = config;

        //1. 将参与微信加密签名的三个参数(timestamp, nonce, token) 按照字典排序并组合在一起形成一个数组
        const arr = [timestamp, nonce, token];
        // const arrSort = arr.sort();
        console.log(arr.sort());
        //2. 将数组中所有参数拼接成一个字符串, 进行sha1加密
        const str = arr.join('')
        console.log(str);
        const sha1Str = sha1(str);
        console.log(sha1Str);
        //3. 加密完成就生成了一个signature, 和微信发送过来的进行对比,
        if (sha1Str === signature) {
            // 如果一样, 说明消息来自微信服务器, 返回完成后石头人给微信服务器
            res.send(echostr)
        } else {
            // 如果不一样, 说明不是微信服务器发送的消息, 返回error
            res.end('error')
        }
    }
}
