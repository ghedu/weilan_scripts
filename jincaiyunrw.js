/**
 * cron 5 15 * * *
 * 变量名:JinCaiYunTouLu 
 * 变量值:2w获取金XX的CK  只要值 Auth-Token的值#Auth-Id的值#push_device的值#driver-id的值
 * 例如 fXXXXXXXXXXXXXXXXXXea#feAAAAAAAAAAAAAAAAAAAAAAa8#xzmsasas5qmqsaexloh#e1ef3w8d-548d-4s9c-a0sc-decq07sas9e5
 * scriptVersionNow = "0.0.1";
 * //目前只做 点赞阅读分享(给0豆正常),后续更新 阅读时间和其他
 * //脚本只在白天8-20点可以跑
 * //带兑换 update 2024/1/8
 * 适配WOOLWEB获取的变量,修改变量名即可
 */

/**这里在``里面写你的卡密 */

const key = `872aa01954cf59de5b4be82616371066`
let ckName = "JinCaiYunTouLu";

const $ = new Env("金彩云");
const notify = $.isNode() ? require('./sendNotify') : '';
let envSplitor = ["&", "\n"]; //多账号分隔符
let strSplitor = "#"; //多变量分隔符
let userIdx = 0;
let userList = [];
class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.Api_DeviceId = str.split(strSplitor)[3];
        this.Api_AuthId = str.split(strSplitor)[1]; //单账号多变量分隔符
        this.Api_Token = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.Api_LoginKey = ""
        this.Api_Authorization = ""
        this.push_device = str.split(strSplitor)[2];
        this.act_readList = []
        this.BeiJingTime = ''
        this.wa = true
        this.act_readList2 = []
        //定义在这里的headers会被get请求删掉content-type 而不会重置
    }
    async main() {
        await this._getChinaTime()
        console.log(`当前时间运行情况[${this.isInTimeRange(Number(this.BeiJingTime))}]`);
        if (this.isInTimeRange(Number(this.BeiJingTime))) {
            await this.login_activity();
            if (this.wa) {
                await $.wait(2000)
                await this.act_info()
                await this.act_readListApi()
                if (this.act_readList.length !== 0) {
                    for (let act of this.act_readList) {

                        if (this.wa) {
                            if (act.isRead == 0 || act.isLike == 0 || act.isShare == 0) {
                                $.log(`正在完成[${act.title}]`)

                            }
                            if (act.isRead == 0) {
                                await this.app_read(act.id)
                                await $.wait(5000)
                            }
                            if (this.wa) {
                                if (act.isLike == 0) {
                                    await this.app_like(act.id)
                                    await $.wait(5000)
                                }
                            }
                            if (this.wa) {
                                if (act.isShare == 0) {
                                    await this.app_share(act.id)
                                    await $.wait(5000)
                                }
                            }
                            //console.log(this.act_readList.indexOf(act))

                            if (this.wa) {
                                if (act.isComment == 0) {
                                    $.log(`正在完成[${act.title}]`)
                                    if (this.act_readList.indexOf(act) !== -1 && this.act_readList.indexOf(act) < 11) {
                                        await this.app_content(act.id, act.title)
                                        await $.wait(5000)
                                    }
                                }
                            }

                        } else {
                            $.log(`玛卡巴卡`)
                            return
                        }
                    }
                }
                await this.challenge_info()
                await this.act_readListApi2()
                if (this.act_readList2.length !== 0) {
                    for (let act of this.act_readList2) {
                        if (this.wa) {
                            /*if (act.isRead == 0 || act.isLike == 0 || act.isShare == 0) {
                                $.log(`正在完成[${act.title}]`)

                            }
                            if (act.isRead == 0) {
                                await this.app_read(act.id)
                                await $.wait(5000)
                            }
                            if (this.wa) {
                                if (act.isLike == 0) {
                                    await this.app_like(act.id)
                                    await $.wait(5000)
                                }
                            }
                            if (this.wa) {
                                if (act.isShare == 0) {
                                    await this.app_share(act.id)
                                    await $.wait(5000)
                                }
                            }*/
                            /*if (this.wa) {
                                if (act.isComment == 0) {
                                    $.log(`正在完成[${act.title}]`)
                                    if (this.act_readList2.indexOf(act) !== -1 && this.act_readList2.indexOf(act) < 10) {
                                        await this.app_content(act.id, act.title)
                                        await $.wait(5000)
                                    }
                                }
                            }*/

                        } else {
                            $.log(`玛卡巴卡`)
                            return
                        }
                    }
                }

                await this.act_info()
            }
        } else {
            $.log(`睡觉`)
        }

    }
    isInTimeRange(timestamp) {
        // 将时间戳转换为Date对象
        const date = new Date(timestamp); // 注意时间戳单位是毫秒
        const hour = date.getHours();
        if (hour >= 7 && hour <= 22) {
            return true;
        } else {
            return false;
        }
    }
    async _getChinaTime() {
        try {
            let options = {
                fn: "获取北京时间",
                method: "get",
                url: `http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp`,
            }
            let { body: result } = await $.httpRequest(options)

            this.BeiJingTime = result.data.t
        } catch (e) {
            console.log(e);
        }
    }
    async taskAppRequest(method, url, body = "") {
        //url = url.replace("/%/g", "/%25")
        let headers = {
            "x-version": "6.2.3",
            "user-agent": "Dart/2.18 (dart:io)",
            "appid": "PKVUIaj4wgDKYV9R",
            "push_device": this.push_device,
            "Content-Type": "application/json; charset=utf-8",
            "x-driver-id": this.Api_DeviceId,
            "accept-encoding": "gzip",
            "x-phone-models": "iPhone 8",
            "host": "mapi.jcy.jinhua.com.cn",
            "x-token": this.Api_Token,
            "x-ip": "127.0.0.1",
            "x-driver-type": "iOS 15.9.5"
        }
        if (url.split("?")[1] == "") {
            url = url + `timestamp=${Date.now()}&noncestr=${$.randomString(32)}`;
        } else {
            url = url + `&timestamp=${Date.now()}&noncestr=${$.randomString(32)}`;
        }
        let sign = await this.getSignApp(url.split("?")[1]);
        if (sign == false) {
            console.log(`脚本运行False`)
            this.wa = false
            return { body: undefined };
        }
        url = url + `&sign=${sign}`
        //console.log(url)
        if (method == "get") {
            return await $.httpRequest({ method: method, url: url, headers: headers })
        } else if (method == "post") {
            return await $.httpRequest({ method: method, url: url, headers: headers, body: body })
        }
    }


    async taskAppRequest_content(url, body) {
        //url = url.replace("/%/g", "/%25")
        let boundaryRandomString = $.randomNumber(10)
        let headers = {
            "x-version": "6.2.3",
            "user-agent": "Dart/2.18 (dart:io)",
            "appid": "PKVUIaj4wgDKYV9R",
            "push_device": this.push_device,
            "Content-Type": `multipart/form-data; boundary=--dio-boundary-${boundaryRandomString}`,
            "x-driver-id": this.Api_DeviceId,
            "accept-encoding": "gzip",
            "x-phone-models": "iPhone 8",
            "host": "mapi.jcy.jinhua.com.cn",
            "x-token": this.Api_Token,
            "x-ip": "127.0.0.1",
            "x-driver-type": "iOS 15.9.5"
        }
        let timestamp = Date.now()
        let noncestr = $.randomString(32)
        let params = body
        params = params + `&timestamp=${timestamp}&noncestr=${noncestr}`;
        //console.log(params)
        let sign = await this.getSignApp(params);
        if (sign == false) {
            console.log(`脚本运行False`)
            this.wa = false
            return { body: undefined };
        }
        params = params + `&sign=${sign}`;
        //console.log(params)
        let formData = $.getURLParams(url + "?" + params)

        let fields = '';
        for (const key in formData) {
            const value = formData[key];
            const field = `----dio-boundary-${boundaryRandomString}\n`;
            const fieldValue = typeof value === 'string' ? value : JSON.stringify(value);
            let fieldData = fieldValue;
            if (/[\u4e00-\u9fa5]/.test(fieldValue)) {
                fieldData = `content-type: text/plain; charset=utf-8\n`;
                fieldData += `content-transfer-encoding: binary\n\n`;
                fieldData += fieldValue;
            }
            fields += `${field}content-disposition: form-data; name="${key}"\n`;
            if (!/[\u4e00-\u9fa5]/.test(fieldValue)) {
                fields += '\n';

            }
            fields += fieldData + '\n';
        }

        // 构建完整的请求体
        let bodyStr = `${fields}----dio-boundary-${boundaryRandomString}--`;
        //console.log(url)

        //await $.initGotEnv({ method: `post`, url: url, headers: headers, body: bodyStr });
        let httpResult = await $.httpRequest({ method: `post`, url: url, headers: headers, body: bodyStr });
        return httpResult


    }

    async taskH5Request(method, url, body = "") {
        url = url.replace("/%/g", "/%25")
        let uuid = $.uuid()
        let timestamp = Date.now()
        let data
        if (method == "get") {
            data = $.getURLParams(url)
        } else if (method == "post") {
            data = body
        }
        let sign = await this.getSignH5(this.Api_DeviceId, uuid, timestamp, this.Api_AuthId, this.Api_Token, data, this.Api_LoginKey)
        if (sign == "") {
            console.log(`脚本运行False`)
            this.wa = false
            return;
        }
        let headers = {
            "Host": "op-api.cloud.jinhua.com.cn",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json; charset=utf-8",
            "Access-Nonce-Str": uuid,
            "Access-Device-Id": this.Api_DeviceId,
            "Access-Api-Token": this.Api_Token,
            "Access-Auth-Id": this.Api_AuthId,
            "Access-App-Id": "wxc097803934a957eb",
            "Access-Type": "app",
            "Cookie": `acw_tc=368c632ad8b8822587388ffcfeb6692652c9238b27ae47de51454879421cfa1f`,
            "Access-Api-Signature": sign,
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Origin": "https://op-h5.cloud.jinhua.com.cn",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 JinHua_JCY jcy_version:B",
            "Referer": "https://op-h5.cloud.jinhua.com.cn/",
            "Connection": "keep-alive",
            "Access-Timestamp": timestamp
        }
        //console.log(headers)
        //console.log(this.Api_LoginKey)
        if (this.Api_LoginKey !== "") {
            headers['Authorization'] = this.Api_Authorization
        }
        //console.log(headers)
        if (method == "get") {
            return await $.httpRequest({ method: method, url: url, headers: headers })
        } else if (method == "post") {
            return await $.httpRequest({ method: method, url: url, headers: headers, body: JSON.stringify(body) })
        }
    }

    async app_content(id, title) {
        try {
            let { body: result } = await this.taskAppRequest_content(`https://mapi.jcy.jinhua.com.cn/api/publish/m_send_comment`, `address=北京市&content=关注&publish_id=${id}&origin_id=653158&app_uniqueid=article&column_id=2476&content_title=${title}&comment_member_id=0`)
            //console.log(options);
            //console.log(result);
            if (result !== undefined) {
                result.code == 0 ? $.log(`评论成功`) : $.log(`评论失败`)
                if (result.msg == "success") {
                    await this.app_content_add(id)
                }
            }

        } catch (e) {
            console.log(e);
        }
    }
    async challenge_info() {
        try {
            let { body: result } = await this.taskH5Request(`get`, `https://op-api.cloud.jinhua.com.cn/api/welfare/task/challenge`)
            //console.log(options);
            //console.log(JSON.stringify(result));
            if (result !== undefined) {
                if (result.code == 0) {
                    $.log(`当前共完成[${result.data.completeTaskCount}]高分任务`)
                    if (result.data.completeTaskCount >= 5 && result.data.completeTaskCount < 10) {
                        if (result.data.list[0].complete == 0 && result.data.list[0].isEnable == 1) {
                            $.log(`可以获取10豆`)
                            await this.challenge_getGold(12)
                        }

                    } else if (result.data.completeTaskCount >= 10 && result.data.completeTaskCount < 30) {
                        if (result.data.list[1].complete == 0 && result.data.list[1].isEnable == 1) {
                            $.log(`可以获取40豆`)
                            await this.challenge_getGold(13)
                        }
                    } else if (result.data.completeTaskCount >= 30 && result.data.completeTaskCount < 60) {
                        if (result.data.list[2].complete == 0 && result.data.list[2].isEnable == 1) {
                            $.log(`可以获取150豆`)
                            await this.challenge_getGold(14)
                        }
                    } else if (result.data.completeTaskCount >= 60 && result.data.completeTaskCount < 100) {
                        if (result.data.list[3].complete == 0 && result.data.list[3].isEnable == 1) {
                            $.log(`可以获取400豆`)
                            await this.challenge_getGold(15)
                        }
                    } else if (result.data.completeTaskCount >= 100) {
                        if (result.data.list[4].complete == 0 && result.data.list[4].isEnable == 1) {
                            $.log(`可以获取800豆`)
                            await this.challenge_getGold(16)
                        }
                    }

                }
            }

        } catch (e) {
            console.log(e);
        }
    }
    async challenge_getGold(id) {
        try {
            let { body: result } = await this.taskH5Request(`post`, `https://op-api.cloud.jinhua.com.cn/api/welfare/task/challenge/getGold`, { "id": id })
            //console.log(options);
            //console.log(result);
            if (result !== undefined) {
                $.log(`领取成功`)
            }

        } catch (e) {
            console.log(e);
        }
    }
    async app_content_add(id) {
        //领取评论奖励
        try {
            let { body: result } = await this.taskAppRequest(`get`, `https://mapi.jcy.jinhua.com.cn/api/credit/m_credit_add?content_id=${id}&operation=comment`)
            //console.log(options);
            //console.log(result);
            if (result !== undefined) {
                result.code == 0 ? $.log(`获得[${result.data.credits}]金豆`) : $.log(`领取评论奖励失败`)
                if (result.msg == "success") {

                }
            }

        } catch (e) {
            console.log(e);
        }
    }
    async app_like(id) {
        try {
            let { body: result } = await this.taskAppRequest("get", `https://mapi.jcy.jinhua.com.cn/api/publish/m_praises_add?id=${id}`)
            //console.log(options);
            //console.log(result);
            if (result !== undefined) {
                result.code == 0 ? $.log(`点赞成功获得[${result.data.credits}]金豆`) : $.log(`阅读失败`)

            }
        } catch (e) {
            console.log(e);
        }
    }
    async app_share(id) {
        try {
            let { body: result } = await this.taskAppRequest("get", `https://mapi.jcy.jinhua.com.cn/api/publish/add_content_state_num?id=${id}&operation=share&target=3&uid=465414`)
            //console.log(options);
            //console.log(result);
            if (result !== undefined) {
                result.code == 0 ? $.log(`分享成功获得[${result.data.credits}]金豆`) : $.log(`分享失败`)

            }
        } catch (e) {
            console.log(e);
        }
    }
    async app_read(id) {
        try {
            let { body: result } = await this.taskAppRequest("get", `https://mapi.jcy.jinhua.com.cn/api/publish/add_content_state_num?id=${id}&operation=click&uid=465414&target=2`)
            //console.log(options);
            //console.log(result);
            if (result !== undefined) {
                result.code == 0 ? $.log(`阅读成功获得[${result.data.credits}]金豆`) : $.log(`阅读失败`)

            }
        } catch (e) {
            console.log(e);
        }
    }



    async login_activity() {
        try {
            let { body: result } = await this.taskH5Request("post", `https://op-api.cloud.jinhua.com.cn/api/member/login`, { debug: 0, userId: "" })
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                this.Api_LoginKey = result.data.key
                this.Api_Authorization = "Bearer " + result.data.token
                $.log(`登录活动成功`)
            }
        } catch (e) {
            console.log(e);
        }
    }
    async golden_exchange(gold, cash, rate = "5") {
        try {
            let { body: result } = await this.taskH5Request("post", `https://op-api.cloud.jinhua.com.cn/api/welfare/golden/exchange`, { "gold": gold.toString(), "rate": rate, "cash": Number(cash) })
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`兑换现金成功 兑换到[${Number(cash) / 100}] 花费[${gold}]金豆`)
            }
        } catch (e) {
            console.log(e);
        }
    }

    async act_info() {
        try {
            let { body: result } = await this.taskH5Request("get", `https://op-api.cloud.jinhua.com.cn/api/welfare/info`)
            //console.log(options);
            //console.log(result);
            //console.log(Math.floor(Number(51) / 5))
            if (result.code == 0) {
                $.log(`当前金豆[${result.data.gold}] 现金[${Number(result.data.cash) / 100}]`)
                if (Number(result.data.gold) > 5) {
                    if (Number(result.data.gold) > 5000) {
                        await this.golden_exchange(5000, Math.floor(5000 / 5))
                    } else {
                        await this.golden_exchange(result.data.gold, Math.floor(Number(result.data.gold) / 5))

                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    async act_readListApi() {
        try {
            let { body: result } = await this.taskH5Request("get", `https://op-api.cloud.jinhua.com.cn/api/welfare/task/challenge/list?page=1&pageSize=10000`)
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`阅读任务今日数量 [${result.data.list.length}]`)
                for (let act of result.data.list) {
                    this.act_readList.push({ title: act.title, id: act.contentId, isRead: act.readComplete, isShare: act.shareComplete, isLike: act.praiseComplete, isComment: act.commentComplete })
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    async act_readListApi2() {
        try {
            let { body: result } = await this.taskH5Request("post", `https://op-api.cloud.jinhua.com.cn/api/welfare/task/userUnreadList`, {})
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`冲高分任务今日数量 [${result.data.list.length}]`)
                $.log(`此任务完成获取0豆子属于正常情况`)
                for (let act of result.data.list) {
                    this.act_readList2.push({ title: act.title, id: act.url.split("?")[1].split("&")[0].replace("id=", ""), isRead: act.task_status.click, isShare: act.task_status.share, isLike: act.task_status.praise, isComment: act.task_status.comment })
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    async getSignApp(params) {
        let { body: result } = await $.httpRequest({ method: `get`, url: `http://api.onecc.cc/KeyApi/jcy?str=${encodeURIComponent(params)}&key=${key}` });
        if (result.status == true) {
            return result.data
        } else {
            return false
        }
    }
    async getSignH5(device, nonce, timestamp, auth, token, data, key) {
        //console.log(device, nonce, timestamp, auth, token, data, key)
        const crypto = require('crypto');
        function getApiSign(device, nonce, timestamp, auth, token, c = {}, l = `35c782a2`) {
            let u = {
                app_id: `wxc097803934a957eb`,
                device_id: device,//每个设备不一样
                nonce_str: nonce,//随机UUID
                timestamp: timestamp,//时间戳
                auth_id: auth,//每个用户唯一
                token: token,//每个用户唯一
                source_type: `app`,
                ...c,//GET params || {}  POST 如果有就是data 没有{}  
            }
            let f = Object.keys(u);
            f.sort();
            let m = "";
            for (let x of f) {
                if (x == "file") continue;
                let g = "";
                Array.isArray(u[x]) ? (g = JSON.stringify(u[x])) : (g = "" + u[x]),
                    (m += x + "=" + g + "&&");
            }
            if (l == "" || l == null || l == undefined) {
                l = `35c782a2`
            }
            //console.log(m + l);
            let sign = crypto.createHash('sha256').update(m + l).digest('hex')
            return sign
        };
        return getApiSign(device, nonce, timestamp, auth, token, data, key)
    }
}

async function start() {
    let { body: keyinfo } = await $.httpRequest({ method: "get", url: `http://api.onecc.cc/api/UserInfo?key=${key}` })
    if (keyinfo.status == true) {
        $.log(`[${keyinfo.data.qq}]剩余[${keyinfo.data.num}]`)
        if (Number(keyinfo.data.num) > 0) {
            let taskall = [];
            for (let user of userList) {
                if (user.ckStatus) {
                    taskall.push(await user.main());
                }
            }
            await Promise.all(taskall);
        }
        let { body: keyinfo2 } = await $.httpRequest({ method: "get", url: `http://api.onecc.cc/api/UserInfo?key=${key}` })
        $.log(`[${keyinfo2.data.qq}]剩余[${keyinfo2.data.num}]`)
    } else {
        $.log(`KEY验证失败`)
        return
    }

}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
    await $.sendMsg($.logs.join("\n"))
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
    let userCookie = process.env[ckName];

    if (userCookie) {
        let e = envSplitor[0];
        for (let o of envSplitor)
            if (userCookie.indexOf(o) > -1) {
                e = o;
                break;
            }

        for (let n of userCookie.split(e)) {
            if (n) {
                n = n.replaceAll(`Auth-Token=`, '');
                n = n.replaceAll(`Auth-Id=`, '');
                n = n.replaceAll(`push_device=`, '');
                n = n.replaceAll(`driver-id=`, '');
                userList.push(new Task(n))
            }
        }
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}
function Env(t, s) {
    return new (class {
        constructor(t, s) {
            this.name = t;
            this.data = null;
            this.dataFile = "box.dat";
            this.logs = [];
            this.logSeparator = "\n";
            this.startTime = new Date().getTime();
            Object.assign(this, s);
            this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`);
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports;
        }
        isQuanX() {
            return "undefined" != typeof $task;
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon;
        }
        isLoon() {
            return "undefined" != typeof $loon;
        }
        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs");
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    s = this.path.resolve(process.cwd(), this.dataFile),
                    e = this.fs.existsSync(t),
                    i = !e && this.fs.existsSync(s);
                if (!e && !i) return {};
                {
                    const i = e ? t : s;
                    try {
                        return JSON.parse(this.fs.readFileSync(i));
                    } catch (t) {
                        return {};
                    }
                }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs");
                this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    s = this.path.resolve(process.cwd(), this.dataFile),
                    e = this.fs.existsSync(t),
                    i = !e && this.fs.existsSync(s),
                    o = JSON.stringify(this.data);
                e ? this.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o);
            }
        }
        lodash_get(t, s, e) {
            const i = s.replace(/\[(\d+)\]/g, ".$1").split(".");
            let o = t;
            for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e;
            return o;
        }
        lodash_set(t, s, e) {
            return Object(t) !== t
                ? t
                : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []),
                    (s
                        .slice(0, -1)
                        .reduce(
                            (t, e, i) =>
                                Object(t[e]) === t[e]
                                    ? t[e]
                                    : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}),
                            t
                        )[s[s.length - 1]] = e),
                    t);
        }
        getdata(t) {
            let s = this.getval(t);
            if (/^@/.test(t)) {
                const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t),
                    o = e ? this.getval(e) : "";
                if (o)
                    try {
                        const t = JSON.parse(o);
                        s = t ? this.lodash_get(t, i, "") : s;
                    } catch (t) {
                        s = "";
                    }
            }
            return s;
        }
        setdata(t, s) {
            let e = !1;
            if (/^@/.test(s)) {
                const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s),
                    h = this.getval(i),
                    a = i ? ("null" === h ? null : h || "{}") : "{}";
                try {
                    const s = JSON.parse(a);
                    this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i));
                } catch (s) {
                    const h = {};
                    this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i));
                }
            } else e = this.setval(t, s);
            return e;
        }
        getval(t) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.read(t);
            } else if (this.isQuanX()) {
                return $prefs.valueForKey(t);
            } else if (this.isNode()) {
                this.data = this.loaddata();
                return this.data[t];
            } else {
                return this.data && this.data[t] || null;
            }
        }
        setval(t, s) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.write(t, s);
            } else if (this.isQuanX()) {
                return $prefs.setValueForKey(t, s);
            } else if (this.isNode()) {
                this.data = this.loaddata();
                this.data[s] = t;
                this.writedata();
                return true;
            } else {
                return this.data && this.data[s] || null;
            }
        }
        initGotEnv(t) {
            this.got = this.got ? this.got : require("got");
            this.cktough = this.cktough ? this.cktough : require("tough-cookie");
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar();
            if (t) {
                t.headers = t.headers ? t.headers : {};
                if (typeof t.headers.Cookie === "undefined" && typeof t.cookieJar === "undefined") {
                    t.cookieJar = this.ckjar;
                }
            }
        }
        /**
        * @param {Object} options
        * @returns {String} 将 Object 对象 转换成 queryStr: key=val&name=senku
        */
        queryStr(options) {
            return Object.entries(options)
                .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
                .join('&');
        }
        getURLParams(url) {
            const params = {};
            const queryString = url.split('?')[1];
            if (queryString) {
                const paramPairs = queryString.split('&');
                paramPairs.forEach(pair => {
                    const [key, value] = pair.split('=');
                    params[key] = value
                });
            }
            return params;
        }
        isJSONString(str) {
            try {
                var obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        isJson(obj) {
            var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
            return isjson;
        }
        async sendMsg(message) {
            if (!message) return;
            if ($.isNode()) {
                await notify.sendNotify($.name, message)
            } else {
                $.msg($.name, '', message)
            }
        }
        async httpRequest(options) {
            let t = {
                ...options
            };
            if (!t.headers) {
                t.headers = {}
            }
            if (t.params) {
                t.url += '?' + this.queryStr(t.params);
            }
            t.method = t.method.toLowerCase();
            if (t.method === 'get') {
                delete t.headers['Content-Type'];
                delete t.headers['Content-Length'];
                delete t["body"]
            }
            if (t.method === 'post') {
                let contentType;

                if (!t.body) {
                    t.body = ""
                } else {
                    if (typeof t.body == "string") {
                        if (this.isJSONString(t.body)) {
                            contentType = 'application/json'
                        } else {
                            //contentType = 'application/x-www-form-urlencoded'
                        }
                    } else if (this.isJson(t.body)) {
                        t.body = JSON.stringify(t.body);
                        contentType = 'application/json';
                    }
                }
                if (!t.headers['Content-Type']) {
                    t.headers['Content-Type'] = contentType;
                }
                delete t.headers['Content-Length'];
            }
            if (this.isNode()) {
                this.initGotEnv(t);
                let httpResult = await this.got(t);
                if (this.isJSONString(httpResult.body)) {
                    httpResult.body = JSON.parse(httpResult.body)
                }
                return httpResult;
            }
            if (this.isQuanX()) {
                t.method = t.method.toUpperCase()
                return new Promise((resolve, reject) => {
                    $task.fetch(t).then(response => {
                        if (this.isJSONString(response.body)) {
                            response.body = JSON.parse(response.body)
                        }
                        resolve(response)
                    })
                })
            }
        }
        randomNumber(length) {
            const characters = '0123456789';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        }
        randomString(length) {
            const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        }
        timeStamp() {
            return new Date().getTime()
        }
        uuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        time(t) {
            let s = {
                "M+": new Date().getMonth() + 1,
                "d+": new Date().getDate(),
                "H+": new Date().getHours(),
                "m+": new Date().getMinutes(),
                "s+": new Date().getSeconds(),
                "q+": Math.floor((new Date().getMonth() + 3) / 3),
                S: new Date().getMilliseconds(),
            };
            /(y+)/.test(t) &&
                (t = t.replace(
                    RegExp.$1,
                    (new Date().getFullYear() + "").substr(4 - RegExp.$1.length)
                ));
            for (let e in s)
                new RegExp("(" + e + ")").test(t) &&
                    (t = t.replace(
                        RegExp.$1,
                        1 == RegExp.$1.length
                            ? s[e]
                            : ("00" + s[e]).substr(("" + s[e]).length)
                    ));
            return t;
        }
        msg(s = t, e = "", i = "", o) {
            const h = (t) =>
                !t || (!this.isLoon() && this.isSurge())
                    ? t
                    : "string" == typeof t
                        ? this.isLoon()
                            ? t
                            : this.isQuanX()
                                ? { "open-url": t }
                                : void 0
                        : "object" == typeof t && (t["open-url"] || t["media-url"])
                            ? this.isLoon()
                                ? t["open-url"]
                                : this.isQuanX()
                                    ? t
                                    : void 0
                            : void 0;
            this.isMute ||
                (this.isSurge() || this.isLoon()
                    ? $notification.post(s, e, i, h(o))
                    : this.isQuanX() && $notify(s, e, i, h(o)));
            let logs = ['', '==============📣系统通知📣=============='];
            logs.push(t);
            e ? logs.push(e) : '';
            i ? logs.push(i) : '';
            console.log(logs.join('\n'));
            this.logs = this.logs.concat(logs);
        }
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]),
                console.log(t.join(this.logSeparator));
        }
        logErr(t, s) {
            const e = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            e
                ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack)
                : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t);
        }
        wait(t) {
            return new Promise((s) => setTimeout(s, t));
        }
        done(t = {}) {
            const s = new Date().getTime(),
                e = (s - this.startTime) / 1e3;
            this.log(
                "",
                `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`
            )
            this.log()
            if (this.isNode()) {
                process.exit(1)
            }
            if (this.isQuanX()) {
                $done(t)
            }
        }
    })(t, s);
}