//引入express模块
const express = require('express');
//引入sha1模块
const sha1 = require('sha1');
//创建app应用对象
const app = express();

//验证服务器有效性
/*
    1. 微信服务器知道开发者服务器是哪个
        -测试号管理页面上填写url开发者服务器地址
            - 使用ngrok 内湾穿透 将本端口号地开启的服务映射为外网快于访问的一个网址
            - ngrok http 3000
        - 填写token
            - 参与微信签名加密的一个参数
    2. 开发者服务器 - 验证消息是否来自于微信服务器
        目睹: 计算signature微信加密签名, 和微信传递过来的signature进行对比, 如果一样, 说明消息来自于微信服务器, 若不一样, 说明不是卫星服务器发送的消息
        1. 将参与微信加密签名的三个参数(timestamp, nonce, token), 组合在一起, 按照字典序排序并组合在一起形成一个数组
        2. 将数组中所有参数拼接成一个字符串, 进行sha1加密
        3. 加密完成就生成了一个signature, 和微信发送过来的进行对比,
            如果一样, 说明消息来自微信服务器, 返回完成后石头人给微信服务器
            如果不一样, 说明不是微信服务器发送的消息, 返回error
 */
//定义配置对象
const config ={
    token : 'djiusdjjfwoei32',
    appID :  'wxdca81a960e7a76d4',
    appsecret : 'dd5452fee690879096fd640e18ed5678',
}
//接受处理所有消息
app.use((req, res, next)=>{
    // 微信服务器传来的参数
    console.log(req)

    console.log(req.query)
    /*
        {
          signature: '22196be1b9ce358b40b060d25110f6aafaebdc3b',    //微信加密签名
          echostr: '5613195638641446751',       //微信随机字符串
          timestamp: '1632797462',      //微信的发送请求时间戳
          nonce: '2039581380'       //微信的随机数字
        }
    * */
    const { signature, echostr, timestamp, nonce} = req.query;
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
    if(sha1Str === signature){
        // 如果一样, 说明消息来自微信服务器, 返回完成后石头人给微信服务器
        res.send(echostr)
    }else{
        // 如果不一样, 说明不是微信服务器发送的消息, 返回error
        res.end('error')
    }
})

//监听端口号
app.listen(3000, ()=>{
    console.log('服务器启动成功~~!');
})
