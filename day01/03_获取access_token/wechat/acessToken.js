/*
   获取access_token
    是什么? 微信调用全局唯一凭据


   特点:
    1. 唯一的
    2.有效期为2小时,提前五分钟请求
    3.请求地址
        https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    4.请求方式
        GET


    设计思路:
        1. 首次本地没有,发送请求获取access_token, 保存下来(本地文件)
        2. 第二次+
            - 先去本地读取文件, 判断是否过期
                - 过期
                    - 重新请求获取token,保存下来覆盖之前的文件(保证文件唯一)
                - 没有过期
                    -直接使用
    整理思路:
        读取本地文件(readAccessToken)
           - 本地有文件
            - 判断是否过期(isValidAccessToken)
                -过期了
                    - 重新请求获取token(getAccessToken),保存下来覆盖之前的文件(保证文件唯一)(saveAccessToken)
                -未过期
                    - 直接使用
           - 本地没有文件
            - 发送请求获取access_token(getAccessToken), 保存下来(本地文件)(saveAccessToken), 直接使用
*/
// 引入config模块
const {appId, appsecret} = require('../config')
// 只需要引入request-promise-native
const rp = require('request-promise-native')
//引入fs模块
const {writeFile, readFile} = require("fs");

// 定义类, 获取access_Token
class WeChat {
    constructor() {

    }

    /*
        用来获取access_token
     */
    getAccessToken() {
        //定义请求地址
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appsecret}`
        //发送请求
        /*
            request
            request-promise-native  返回值是一个promise对象
        */
        return new Promise((resolve, reject) => {
            rp({mtheod: 'GET', url, json: true})
                .then(res => {
                    console.log(res);
                    /*
                        {
                            access_token: '49_-jxMB55htHpVu9rl6ctPs-NisJOKLtSy4bJMj6SocFiieqomo9E8zCVnt0WYNvSCi4UWoo3Q-_wiOf_I9d4jEt-8xEF6_C1gcrnWKALsHPqDTji3wTKimhE05wSeLeDHxjggJNSBlZyMiZRoCZEeAIASPU',
                            expires_in: 7200
                        }
                    */
                    //设置access_token的过期时间
                    res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                    resolve(res)
                }).catch(err => {
                console.log(err);
                reject('getAccessToken方法错误:', err)
            })
        })


    };

    /*
        * 用来保存access_token
        * @param accessToken 要保存的凭据
        *
    */
    saveAccessToken(accessToken) {
        //将对象转化json字符串
        accessToken = JSON.stringify(accessToken)
        //将access_token保存文件
        return new Promise(((resolve, reject) => {
            writeFile('./accessToken.txt', accessToken, err => {
                if (!err) {
                    console.log('文件保存成功了啊');
                    resolve()
                } else {
                    reject('saveAccessToken错误', err)
                }
            })
        }))
    };

    /*
        * 用来读取access_token
        * @param accessToken 要保存的凭据
        *
    */
    readAccessToken() {
        //读取本地文件中的 access_token
        return new Promise(((resolve, reject) => {
            readFile('./accessToken.txt', (err, data) => {
                if (!err) {
                    //将json字符串转化为js对象
                    data = JSON.parse(data);
                    console.log('文件读取成功');
                    resolve(data)
                } else {
                    reject('readAccessToken错误', err);
                }
            })
        }))
    };

    /**
     * 用来检查access_token是否有效
     * @param data
     */
    isValidAccessToken(data) {
        //检测传入的参数是否是有效
        if (!data && !data.access_token && !data.expires_in) {
            //代表access_token无效
            return false;
        }
        //检查access_token是否在有效期内
        // if(data.expires_in< Date.now()){
        //     //过期了
        //     return false
        // }else{
        //     // 未过期
        //     return true
        // }
        return data.expires_in > Date.now()

    };

    /**
     *  用来获取没有过期的access_token
     * @returns {Promise<any>}
     */
    fetchAccessToken() {
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in,
            })
        }
        return this.readAccessToken()
            .then(async res => {
                //本地有文件
                //判断他是否过期
                if (this.isValidAccessToken(res)) {
                    return Promise.resolve(res)
                } else {
                    //过期了
                    //发送请求获取access_token(getAccessToken)
                    const res = await this.getAccessToken()
                    await this.saveAccessToken(res)
                    // 将请求回来的access_token返回出去
                    return Promise.resolve(res)
                }
            })
            .catch(async err => {
                // 本地没有文件
                // 发送请求获取access_token(getAccessToken), 保存下来
                const res = await this.getAccessToken()
                await this.saveAccessToken(res)
                // 将请求回来的access_token返回出去
                return Promise.resolve(res)
            })
            .then(res => {
                //将access_token挂载到this上
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;
                return Promise.resolve(res)
            })

            .then(res => {
                console.log(182, res);
            })
    }
}

//模拟测试
const w = new WeChat();
/*
读取本地文件(readAccessToken)
   - 本地有文件
    - 判断是否过期(isValidAccessToken)
        -过期了
            - 重新请求获取token(getAccessToken),保存下来覆盖之前的文件(保证文件唯一)(saveAccessToken)
        -未过期
            - 直接使用
   - 本地没有文件
    - 发送请求获取access_token(getAccessToken), 保存下来(本地文件)(saveAccessToken), 直接使用
 */
new Promise((resolve, reject) => {
    w.readAccessToken().then(res => {
        //本地有文件
        if (w.isValidAccessToken(res)) {
            resolve(res)
        } else {
            w.getAccessToken()
                .then(res => {
                    w.saveAccessToken(res)
                        .then(() => {
                            resolve(res)
                        })
                })
        }
    }).catch(err => {
        // 本地没有文件
        // 发送请求获取access_token(getAccessToken), 保存下来
        w.getAccessToken()
            .then(res => {
                w.saveAccessToken(res)
                    .then(() => {
                        resolve(res)
                    })
            })
    })
})
    .then(res => {
        console.log(182, res);
    })
