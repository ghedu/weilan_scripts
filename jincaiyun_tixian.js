
const cash = 500;
let ckName = "JinCaiYunTouLu";
const waitTime =  50; 

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
    }
    async main() {
        await this.login_activity();
        for (let i = 0; i < 10; i++) {
            let v = await this.get_captcha();
            if (v.code == 0) {
                break;
            }
        }
        this.BeiJingTime = await this.getTime_china()
        this.BeiJingTime = Number(this.BeiJingTime)
        let date = new Date(this.BeiJingTime)
        const hour = this.isInTimeRange(this.BeiJingTime)
        if (hour) {
            if (hour == 9) {
                const morning9 = new Date(this.BeiJingTime);
                morning9.setHours(9, 0, 0, 0);
                let waitTime9 = morning9.getTime() - date.getTime()
                console.log(`距离提现还剩` + waitTime9 + `毫秒`)
                await $.wait(waitTime9 + Number(waitTime))
                await this.task_exchange()
            } else if (hour == 21) {
                const evening9 = new Date(this.BeiJingTime);
                evening9.setHours(21, 0, 0, 0);
                let waitTime21 = evening9.getTime() - date.getTime()
                console.log(`距离提现还剩` + waitTime21 + `毫秒`)
                await $.wait(waitTime21 + Number(waitTime))
                await this.task_exchange()
            } else if (hour == 17) {
                const evening17 = new Date(this.BeiJingTime);
                evening17.setHours(17, 0, 0, 0);
                let waitTime17 = evening17.getTime() - date.getTime()
                console.log(`距离提现还剩` + waitTime17 + `毫秒`)
                await $.wait(waitTime17 + Number(waitTime))
                await this.task_exchange()
            }
        }

    }
    isInTimeRange(timestamp) {
        // 将时间戳转换为Date对象
        const date = new Date(timestamp); // 注意时间戳单位是毫秒
        const hour = date.getHours();
        if (hour == 8 && hour < 9) {
            return 9
        } else if (hour == 20 && hour < 21) {
            return 21
        } else if (hour == 16 && hour < 17) {
            return 17
        }
    }
    async get_captcha() {
        try {
            let { body: result } = await this.taskH5Request("post", `https://op-api.cloud.jinhua.com.cn/api/captcha/get`, { "module": "benefit", "activity_id": 1 })
            //console.log(options);
            //console.log(result);
            if (result.code == 0) {
                $.log(`第[${this.index}]滑块获取成功`)
                let { body: b64_tgResult } = await $.httpRequest({ "method": "get", url: "http://api.onecc.cc/api/urltob64?url=" + encodeURIComponent(result.data.jigsawImageUrl) })
                let b64_tg = b64_tgResult.data
                let { body: b64_bgResult } = await $.httpRequest({ "method": "get", url: "http://api.onecc.cc/api/urltob64?url=" + encodeURIComponent(result.data.originalImageUrl) })
                let b64_bg = b64_bgResult.data
                let x = await this.ocr(b64_tg, b64_bg)

                let points = this.encryptData(x, result.data.secretKey)
                //console.log(points)
                let resultCaptcha = await this.check_captcha(points, result.data.token)

                return resultCaptcha
            } else {
                $.log(`第[${this.index}]滑块获取失败`)
            }

        } catch (e) {
            console.log(e);
        }
    }
    async ocr(tg, bg) {
        //console.log(bg)
        let bodyStr = JSON.stringify({ 'target_img': tg, 'bg_img': bg })
        let body = Buffer.from(bodyStr, 'utf-8').toString('base64');
        try {
            let options = {
                "method": "post", url: "http://ocr.onecc.cc/slide/match/b64/json",
                body: body
            }
            let { body: result } = await $.httpRequest(options)
            //console.log(options);
            //console.log(result);
            if (result.status == 200) {
                $.log(`第[${this.index}]滑块识别结果`)
                console.log(result.result["target"][0])
                return result.result["target"][0]
            } else {
                $.log(`第[${this.index}]滑块识别失败`)
                return false
            }

        } catch (e) {
            console.log(e);
        }
    }
    async getTime_china() {

        let { body: result } = await $.httpRequest({ method: "get", url: `https://m.tsa.cn/api/time/getCurrentTime` })
        return result
    }
    encryptData(x, key) {
        const CryptoJS = require("crypto-js")
        function aesEncrypt(e, r) {
            var n = CryptoJS.enc.Utf8.parse(r),
                o = CryptoJS.enc.Utf8.parse(e),
                s = CryptoJS.AES.encrypt(o, n, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7,
                });
            return s.toString();
        }
        return aesEncrypt(JSON.stringify({ x: x, y: 5 }), key)
    }
    async check_captcha(point, cap_token) {
        try {
            //console.log("post", `https://op-api.cloud.jinhua.com.cn/api/captcha/check`, { "module": "benefit", "activity_id": 1, "point": encodeURIComponent(point), "cap_token": cap_token })
            let { body: result } = await this.taskH5Request("post", `https://op-api.cloud.jinhua.com.cn/api/captcha/check`, { "module": "benefit", "activity_id": 1, "point": point, "cap_token": cap_token })
            //console.log(options);
            if (result.code == 0) {
                console.log(`第[${this.index}]验证成功`);

            }
            return result
            //result.code == 0 ? $.log(`阅读成功获得[${result.data.credits}]金豆`) : $.log(`阅读失败`)
        } catch (e) {
            console.log(e);
        }
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
            //"Cookie": `acw_tc=368c632ad8b8822587388ffcfeb6692652c9238b27ae47de51454879421cfa1f`,
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

    async task_exchange() {
        try {
            let optionId = 19
            if (cash == 500) {
                optionId = 2
            } else if (cash == 100) {
                optionId = 19
            } else if (cash == 1000) {
                optionId = 3
            } else if (cash == 3000) {
                optionId = 29
            } else if (cash == 5000) {
                optionId = 5
            } else if (cash == 8000) {
                optionId = 17
            } else if (cash == 10000) {
                optionId = 18
            }

            let { body: result } = await this.taskH5Request("post", `https://op-api.cloud.jinhua.com.cn/api/welfare/cash/exchange`, {
                "cash": cash,
                "optionId": optionId
            })
            //console.log(options);
            if (result.code == 0) {
                $.log(`第[${this.index}]提现成功`)

            } else {
                //console.log(options);
                $.log(`第[${this.index}]提现失败 ${JSON.stringify(result)}`)
            }
            $.log(`当前时间戳[${new Date()}]`)
            //result.code == 0 ? $.log(`阅读成功获得[${result.data.credits}]金豆`) : $.log(`阅读失败`)
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
                $.log(`第[${this.index}]登录活动成功`)
            }
        } catch (e) {
            console.log(e);
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
            let sign = crypto.createHash('sha256').update(m + l).digest('hex')
            return sign
        };
        return getApiSign(device, nonce, timestamp, auth, token, data, key)
    }
}

async function start() {
    
}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
    //await $.sendMsg($.logs.join("\n"))
})()
    .catch((e) => console.log(e))
    .finally(() => $.done());

//********************************************************
/**
 * 变量检查与处理
 * @returns
 */
async function checkEnv() {
    let userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || "";

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
                    params[key] = decodeURIComponent(value);
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
                            contentType = 'application/x-www-form-urlencoded'
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