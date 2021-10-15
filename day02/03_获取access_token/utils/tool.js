/*
    工具函数类
 */
// 引入xml2js, 将xml数据转化为js对象
const {parseString} = require('xml2js');
module.exports = {
    getUserDataAsync(req) {
        return new Promise(((resolve, reject) => {
            let xmlData = '';
            req
                .on('data', data => {
                    //当数据传递过来时,会触发当前事件,会将数据注入到回调函数中
                    console.log(data);
                    //读取的数据是buffer,需要将其转化为字符串
                    xmlData += data.toString();
                    // xmlData = data;
                })
                .on('end', () => {
                    //当数据接受完毕时,会触发当前
                    resolve(xmlData)
                })
        }))
    },
    parseXMLAsync(xmlData) {
        return new Promise(((resolve, reject) => {
            parseString(xmlData, {trim: true}, (err, res) => {

                if (!err) {
                    resolve(res)
                } else {
                    reject('parseXMLAsync方法出出了问题:' + err)
                }
            })
        }))

    },
    formatMessage(jsData){
        let message = {};
        // 获取xml对象
        jsData = jsData.xml;
        // 判断数据是否是一个对象
        if(typeof jsData === 'object'){
            for (let key in jsData) {
                // 获取属性值
                let value = jsData[key]
                // 过滤掉空的数据
                if(Array.isArray(value) && value > 0){
                    console.log('这里--',value,value > 0)
                    // 将合法的数据复制到message上
                    message[key] = value[0]
                }


            }

        }



        return message
    }
}

