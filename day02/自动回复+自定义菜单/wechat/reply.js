/*
    处理用户发送的消息类型和内容,决定返回不同的内容给用户
 */

module.exports = message => {
    let options = {
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName,
        createTime: Date.now(),
        msgType: 'text',
        content: ''
    }
    let content = '没听懂，try again';
    if (message.MsgType === 'text') {
        //判断用户发送的消息内容是什么
        if (message.Content === '1') {
            content = '哒哒哒哒哒哒'
        } else if (message.Content === '2') {
            content = '中中中中中中'
        } else if (message.Content.match('爱')) { //半匹配
            content = '爱个球'
        }
    } else if (message.MsgType === 'image') {
        //用户发送图片消息
        options.msgType = 'image';
        options.mediaId = message.MediaId;
        console.log(message.PicUrl)
    } else if (message.MsgType === 'voice') {
        //用户发语音消息
        options.msgType = 'voice';
        options.mediaId = message.MediaId;
        console.log(message.Recognition)
    } else if (message.MsgType === 'location') {
        //用户发位置消息
        content = `纬度:${message.Location_X}  经度:${message.Location_Y}  缩放大小:${message.Scale}  位置信息:${message.Label}`
    } else if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            //用户订阅事件
            content =
                `人生何处不相逢,日复一日山水重;
前夕离别去,今朝又相逢;
朝朝暮暮无他愿,唯愿今夕代码通,
省去我头疼`;
            if (message.EventKey === 'subscribe') {
                content = '用户扫描带参数的二维码关注事件';
            }
        } else if (message.Event === 'unsubscribe') {
            //用户取消订阅事件
            console.log('用户取关~(此时发送消息无意义)');
        } else if (message.Event === 'SCAN') {
            content = '用户已经关注,再扫描带参数的二维码关注事件';
        } else if (message.Event === 'LOCATION') {
            content = `纬度:${message.Latitude}  经度:${message.Longitude}  缩放大小:${message.Precision}`
        } else if (message.Event === 'CLICK') {
            content = `您点击了按钮:${message.EventKey}`;
        }
    }

    options.content = content
    console.log(options);

    return options
}
