/*
    验证服务器有效性模块
*/
// 引入sha1模块
const sha1 = require("sha1");
// 引入config模块
const config = require('../config')
//引入tool模块
const {getUserDataAsync, parseXMLAsync, formatMessage} = require('../utils/tool')
//引入reply模块
const reply = require('./reply')
//引入template模块
const template = require('./template');

module.exports = () => {
    return async (req, res, next) => {
        // 微信服务器传来的参数
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
        /*
            //1. 将参与微信加密签名的三个参数(timestamp, nonce, token) 按照字典排序并组合在一起形成一个数组
            const arr = [timestamp, nonce, token];
            // const arrSort = arr.sort();
            console.log(arr.sort());
            //2. 将数组中所有参数拼接成一个字符串, 进行sha1加密
            const str = arr.join('')
            console.log(str);
            const sha1Str = sha1(str);
        */

        const sha1Str = sha1([timestamp, nonce, token].sort().join(''));


        // console.log(sha1Str);


        if (req.method === 'GET') {
            //3. 加密完成就生成了一个signature, 和微信发送过来的进行对比,
            if (sha1Str === signature) {
                // 如果一样, 说明消息来自微信服务器, 返回完成后石头人给微信服务器
                res.send(echostr)
            } else {
                // 如果不一样, 说明不是微信服务器发送的消息, 返回error
                res.end('error')
            }
        } else if (req.method === 'POST') {
            if (sha1Str !== signature) {
                //消息不来自于微信服务器
                res.end('error')
            }
            // console.log(req.query)
            console.log('收到消息-------------------------')
            // 接受请求体中的数据,流式数据
            const xmlData = await getUserDataAsync(req);
            // console.log('xmlData-',xmlData);
            /*
            <xml>
                <ToUserName><![CDATA[gh_7b7171e7b307]]></ToUserName>        //开发者id
                <FromUserName><![CDATA[oyQgD6Sal0ICx8jDdMxVWtom9fik]]></FromUserName>        //用户openid
                <CreateTime>1634289709</CreateTime>        //发送的时间戳
                <MsgType><![CDATA[text]]></MsgType>        //发送的消息类型
                <Content><![CDATA[321]]></Content>        //发送内容
                <MsgId>23397405170143760</MsgId>        //消息id 微信服务器会默认保存3天用户发送的数据,通过此id三天内就能找到,三天后销毁
            </xml>
             */

            //将xml数据解析为js对象
            const jsData = await parseXMLAsync(xmlData)
            // console.log('jsData--',jsData);
            /*
             {
              xml: {
                ToUserName: [ 'gh_7b7171e7b307' ],
                FromUserName: [ 'oyQgD6Sal0ICx8jDdMxVWtom9fik' ],
                CreateTime: [ '1634291188' ],
                MsgType: [ 'text' ],
                Content: [ '321' ],
                MsgId: [ '23397423088668038' ]
              }
            }
             */

            // 格式化数据
            const message = formatMessage(jsData)
            console.log('message--', message);
            /*
            一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号暂时无法提供服务，请稍后再试”：
                1、开发者在5秒内未回复任何内容
                2、开发者回复了异常数据，比如JSON数据等,xml数据中有多余的空格
            */

            const options = reply(message)

            //最终回复用户的消息
            const replyMessage = template(options)

            //返回响应给服务器
            res.send(replyMessage)

            //如果开发者服务器没有相应，微信服务器会发送三次请求过来
            // res.end('')
        } else {
            res.end('error')
        }
    }
}
