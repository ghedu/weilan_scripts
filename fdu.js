/**
 * cron 5 15 * * *  V3.js
 * Show:疯读小说
 * 变量名:CrazyReader
 * 变量值:https://fiction.fengduxiaoshuo.com/a/fict/h5api/task/multFinish?_token=后面的token
 *  多账户@分割
 * scriptVersionNow = "0.0.1";
 */
//基本API
/**
 * https://fiction.fengduxiaoshuo.com/a/fict/h5api/task/multFinish?_token=9c98184d-5b4b-4607-86bc-054bbb04edc1&_ts=1700193759&_sv=v1&_sign=YzJmYmQ1ZmE1N2U3YTRlNmU2YzdjNGQyYzc4ZGY0Mj
 * body为{"task_ids":["61654772"],"extra":"{\"ad_base_info\":\"azExcGdkcmN6eWJkYTBqYQrg/XbL6YWKnDHIJyo31tguHVZgryCemyi3+6XUzpTG1/5NWtKq8C2gLDOU3coCmBLbgVlEpU6KxXk9EZOx1+gckacwpSkvJTDNvZ7bSYUq7xHTxIgfru5zuc1As4/J+Wf3meCPHEcm3CQT9/npiH27rOOhvrEXf2yFq+nr6XP69huZ6PPNNu+tN9cfkcaum/OHDM7xo9cs6E7F9e3/Wv+LVV8O4k1nOfHqG+c29tkaxJjwD2DFAZjc3TVhj5XevVItOPLh2WpI0yBjkFKPcZu60JmvG/c9tL7z9qu6/ukMv3xFLkiOE5WuuaWK54aG7aDg/QTwzqev505IAp7IhMQ=\"}"}
 * 根据task ids来判断任务ID 其他不重要
 * //任务列表ID 
 * https://fiction.fengduxiaoshuo.com/a/fict/h5api/incentive/center?exp_groups=DIV_CASH_LISTEN_0107%3A2&exp_groups=DIV_CASH_V13_SHELF_0225%3A1&exp_groups=DIV_CASH_V20_PUSH_0422%3A1&exp_groups=DIV_CASH_V24_BIG_0527%3A1&exp_groups=DIV_CASH_V25_DAILY_0610%3A1&exp_groups=DIV_CASH_V26_STORE_V2_0624%3A1&exp_groups=DIV_CASH_V27_CALENDAR_0701%3A2&exp_groups=DIV_CASH_RANK_NO_DANSHU_0812%3A1&exp_groups=DIV_SHAKE_REWARD%3A1&exp_groups=DIV_CASH_XUANFU_XIAOMI_1014%3A1&exp_groups=DIV_CASH_WEIXIN_1104%3A1&exp_groups=DIV_open_packet_everyday_9%3A1&exp_groups=DIV_coin_ecpm_diff_0414%3A1&exp_groups=DIV_CASH_SURPRISE_20220718%3A2&exp_groups=DIV_DOUYIN_REWARD_20220816%3A2&gender=0&api_version=cash_v8&is_H5=1&open_page=1&audio_version=audio_v3&activation_day=2&_token=9c98184d-5b4b-4607-86bc-054bbb04edc1&_ts=1700197499&_sv=v1&_sign=NTJmODdjZTMxMDBiNDU3MzE1Y2I0NDdiYzBhM2QyOD
 */
const $ = new Env("疯读小说");
const notify = $.isNode() ? require('./sendNotify') : '';
let ckName = "CrazyReader";
let envSplitor = ["@", "\n"]; //多账号分隔符
let strSplitor = "&"; //多变量分隔符
let userIdx = 0;
let userList = [];
class UserInfo {
    constructor(str) {
        this.index = ++userIdx;
        this.token = str.split(strSplitor)[0]; //单账号多变量分隔符
        this.ckStatus = true;
        this.taskList = [
            { name: "拆红包", taskID: [1033081, 104330, 63010612, 7313561] },
            { name: "存钱罐", taskID: 61114292 },
            { name: "签到", taskID: 614732 },
            { name: "开宝箱", taskID: [1412432, 2242612,] },
            { name: "金币球", taskID: [61654772, 41000512, 1019781] },
            { name: "书城", taskID: 100580 },
            { name: "看直播", taskID: 21018572 },
            //{ name: "听书", taskID: [139241, 1304512, 27881, 27981, 141241, 716812] },
            //{ name: "阅读", taskID: [54091, 189661, 704892, 80221, 26981, 80821,] },
            { name: "摇一摇", taskID: 20882332 },
            { name: "签到", taskID: 614732 },
            { name: "看推荐书", taskID: 26281 },
            { name: "看视频赚金币", taskID: 41924672 }
        ]
    }
    getSign(timestamp,taskid) {
        const crypto = require("crypto")
        let a = `POST&/a/fict/h5api/task/multFinish&_sv=v1&_token=${this.token}&_ts=${timestamp}&json={"task_ids":[${taskid}]}&B1w2OjLnERw6fXfl`
        //console.log(a)
        let sign = crypto.createHash('md5').update(a).digest('hex');
        sign = Buffer.from(sign).toString('base64');
        //console.log(sign)
        sign = sign.slice(0, -2);
                //console.log(sign)
        return sign

    }
    async main() {
        for (let i of this.taskList) {
            console.log(`执行${i.name}任务`);
            if (Array.isArray(i.taskID)) {
                for (let o of i.taskID) {
                    await this.multFinish(o)
                }
            } else {
                await this.multFinish(i.taskID)

            }
        }
    }
    //
    async multFinish(taskid) {
        try {
            let timestamp = Math.floor(new Date().getTime() / 1000);
            let sign = this.getSign(timestamp,taskid)
            let options = {

                url: `https://fiction.fengduxiaoshuo.com/a/fict/h5api/task/multFinish?_token=${this.token}&_ts=${timestamp}&_sv=v1&_sign=${sign}`,
                headers: {
                    "Host": "fiction.fengduxiaoshuo.com",
                    "Connection": "keep-alive",
                    //"Content-Length": 423,
                    "Pragma": "no-cache",
                    "Cache-Control": "no-cache",
                    "Accept": "application/json, text/plain, /",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Lite Build/QKQ1.190910.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Origin": "https://fiction-biz.cdn.cootekservice.com",
                    "X-Requested-With": "com.cootek.crazyreader",
                    "Sec-Fetch-Site": "cross-site",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Dest": "empty",
                    "Referer": "https://fiction-biz.cdn.cootekservice.com/web/matrix_project/crazy_reader/welfare_center_cash_v8/index.html?from=tab&false",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
                },
                body: JSON.stringify({ "task_ids": [taskid] })
            },
                result = await httpRequest(options);
            //console.log(options);
            console.log(result);
            if(result.result_code == "2000"){
              console.log(`任务执行完成`+JSON.stringify(result.result.tasks[0]))
            }
        } catch (e) {
            console.log(e);
        }
    }



}

async function start() {
    let taskall = [];
    for (let user of userList) {
        if (user.ckStatus) {
            taskall.push(await user.main());
        }
    }
    await Promise.all(taskall);
}

!(async () => {
    if (!(await checkEnv())) return;
    if (userList.length > 0) {
        await start();
    }
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
        for (let n of userCookie.split(e)) n && userList.push(new UserInfo(n));
    } else {
        console.log("未找到CK");
        return;
    }
    return console.log(`共找到${userList.length}个账号`), true; //true == !0
}

/////////////////////////////////////////////////////////////////////////////////////
function httpRequest(options, timeout = 5 * 1000) {
    method = options.method
        ? options.method.toLowerCase()
        : options.body
            ? "post"
            : "get";
    return new Promise((resolve) => {
        setTimeout(() => {
            $[method](options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(JSON.stringify(err));
                        $.logErr(err);
                    } else {
                        try {
                            data = JSON.parse(data);
                        } catch (error) { }
                    }
                } catch (e) {
                    console.log(e);
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        }, timeout);
    });
}
// prettier-ignore
function Env(t, s) { return new (class { constructor(t, s) { (this.name = t), (this.data = null), (this.dataFile = "box.dat"), (this.logs = []), (this.logSeparator = "\n"), (this.startTime = new Date().getTime()), Object.assign(this, s), this.log("", `\ud83d\udd14${this.name},\u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getScript(t) { return new Promise((s) => { this.get({ url: t }, (t, e, i) => s(i)) }) } runScript(t, s) { return new Promise((e) => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); (o = o ? 1 * o : 20), (o = s && s.timeout ? s.timeout : o); const [h, a] = i.split("@"), r = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": h, Accept: "*/*" }, }; this.post(r, (t, s, i) => e(i)) }).catch((t) => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s); if (!e && !i) return {}; { const i = e ? t : s; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { (this.fs = this.fs ? this.fs : require("fs")), (this.path = this.path ? this.path : require("path")); const t = this.path.resolve(this.dataFile), s = this.path.resolve(process.cwd(), this.dataFile), e = this.fs.existsSync(t), i = !e && this.fs.existsSync(s), o = JSON.stringify(this.data); e ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(s, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, s, e) { const i = s.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (((o = Object(o)[t]), void 0 === o)) return e; return o } lodash_set(t, s, e) { return Object(t) !== t ? t : (Array.isArray(s) || (s = s.toString().match(/[^.[\]]+/g) || []), (s.slice(0, -1).reduce((t, e, i) => Object(t[e]) === t[e] ? t[e] : (t[e] = Math.abs(s[i + 1]) >> 0 == +s[i + 1] ? [] : {}), t)[s[s.length - 1]] = e), t) } getdata(t) { let s = this.getval(t); if (/^@/.test(t)) { const [, e, i] = /^@(.*?)\.(.*?)$/.exec(t), o = e ? this.getval(e) : ""; if (o) try { const t = JSON.parse(o); s = t ? this.lodash_get(t, i, "") : s } catch (t) { s = "" } } return s } setdata(t, s) { let e = !1; if (/^@/.test(s)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(s), h = this.getval(i), a = i ? ("null" === h ? null : h || "{}") : "{}"; try { const s = JSON.parse(a); this.lodash_set(s, o, t), (e = this.setval(JSON.stringify(s), i)) } catch (s) { const h = {}; this.lodash_set(h, o, t), (e = this.setval(JSON.stringify(h), i)) } } else e = this.setval(t, s); return e } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? ((this.data = this.loaddata()), this.data[t]) : (this.data && this.data[t]) || null } setval(t, s) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, s) : this.isQuanX() ? $prefs.setValueForKey(t, s) : this.isNode() ? ((this.data = this.loaddata()), (this.data[s] = t), this.writedata(), !0) : (this.data && this.data[s]) || null } initGotEnv(t) { (this.got = this.got ? this.got : require("got")), (this.cktough = this.cktough ? this.cktough : require("tough-cookie")), (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()), t && ((t.headers = t.headers ? t.headers : {}), void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, s = () => { }) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }) : this.isQuanX() ? $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, s) => { try { const e = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(e, null), (s.cookieJar = this.ckjar) } catch (t) { this.logErr(t) } }).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h, } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t))) } post(t, s = () => { }) { if ((t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), delete t.headers["Content-Length"], this.isSurge() || this.isLoon())) $httpClient.post(t, (t, e, i) => { !t && e && ((e.body = i), (e.statusCode = e.status)), s(t, e, i) }); else if (this.isQuanX()) (t.method = "POST"), $task.fetch(t).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: e, ...i } = t; this.got.post(e, i).then((t) => { const { statusCode: e, statusCode: i, headers: o, body: h } = t; s(null, { status: e, statusCode: i, headers: o, body: h }, h) }, (t) => s(t)) } } time(t) { let s = { "M+": new Date().getMonth() + 1, "d+": new Date().getDate(), "H+": new Date().getHours(), "m+": new Date().getMinutes(), "s+": new Date().getSeconds(), "q+": Math.floor((new Date().getMonth() + 3) / 3), S: new Date().getMilliseconds(), }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (new Date().getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in s) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? s[e] : ("00" + s[e]).substr(("" + s[e]).length))); return t } msg(s = t, e = "", i = "", o) { const h = (t) => !t || (!this.isLoon() && this.isSurge()) ? t : "string" == typeof t ? this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : void 0 : "object" == typeof t && (t["open-url"] || t["media-url"]) ? this.isLoon() ? t["open-url"] : this.isQuanX() ? t : void 0 : void 0; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(s, e, i, h(o)) : this.isQuanX() && $notify(s, e, i, h(o))), this.logs.push("", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="), this.logs.push(s), e && this.logs.push(e), i && this.logs.push(i) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, s) { const e = !this.isSurge() && !this.isQuanX() && !this.isLoon(); e ? this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name},\u9519\u8bef!`, t) } wait(t) { return new Promise((s) => setTimeout(s, t)) } done(t = {}) { const s = new Date().getTime(), e = (s - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name},\u7ed3\u675f!\ud83d\udd5b ${e}\u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } })(t, s) }