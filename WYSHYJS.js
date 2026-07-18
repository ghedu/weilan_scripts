/**
 * 网易生活研究社小程序 - 每日自动签到（精简 nonce 版 · 详细日志）
 *
 * 机制结论（经 5 轮逆向诊断确认）：
 *   doSign 接口的 token 为「客户端随机 nonce」，服务器凭 Cookie + signOperatingId 校验会话，
 *   并不对 token 内容做强校验（只要形状为字母数字、非 URL 形态即接受）。
 *   原脚本里的 ctoken 获取 + VM 执行是反调试诱饵，对签到结果无任何贡献，已整体移除。
 *
 * 依赖：axios（青龙 Node 环境通常自带；若缺失，脚本目录执行 npm i axios）
 * 配置：同目录 global_config.json（沿用你原有格式）
 * 定时：cron 15 9 * * *
 */

const APP_NAME = '网易生活研究社小程序';
const WX_APP_ID = 'wx91a054c39722497e';

// ==================== ⚙️ 全局配置区 ====================
const PUSH_ENABLED = true;   // 是否启用外部消息推送
const DELAY_MIN = 10;         // 账号间随机延迟下限（秒）
const DELAY_MAX = 35;         // 账号间随机延迟上限（秒）
const VERBOSE = true;         // 详细诊断日志（每步打印请求/响应），不需要可改 false
// =====================================================

const fs = require('fs');
const path = require('path');
const axios = require('axios');

let API_BASE = '';
let ACCOUNTS = [];

const configPath = path.join(__dirname, 'global_config.json');
try {
    if (!fs.existsSync(configPath)) {
        console.log('[❌ 错误] 未能在同目录下找到配置文件 global_config.json');
        process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    API_BASE = config.middle_platform || 'http://81.71.13.142:12800';
    if (config.accounts && Array.isArray(config.accounts)) {
        ACCOUNTS = config.accounts.filter(acc => acc.scripts && acc.scripts.wysh === true);
    }
} catch (e) {
    console.log(`[❌ 错误] 解析 global_config.json 失败: ${e.message}`);
    process.exit(1);
}

let pushModule = null;
if (PUSH_ENABLED) {
    try { pushModule = require('./testpush'); } catch (e) {}
}

let msg = '';
let SING_URL = '';
let gameCookie = '';
let signOperatingId = '';

function log(text) { console.log(text); msg += text + '\n'; }
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function timestampMs() { return new Date().getTime(); }
function getUA() {
    return `Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.75(0x18004b3e) NetType/WIFI Language/zh_CN miniProgram/${WX_APP_ID}`;
}

// 详细日志辅助
function logReq(method, url) {
    if (VERBOSE) log(`    🔍 请求: ${method} ${url}`);
}
function logRes(res, note) {
    if (!VERBOSE) return;
    let body;
    try { body = typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data); }
    catch (e) { body = '(不可序列化)'; }
    if (body.length > 300) body = body.slice(0, 300) + '...';
    log(`    📨 响应: HTTP ${res.status}${note ? ' | ' + note : ''} | ${body}`);
}

// 自生成 token nonce：9 位小写字母 + 数字，形状与诱饵一致，服务器接受
function genNonce(len = 9) {
    const s = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let r = '';
    for (let i = 0; i < len; i++) r += s[Math.floor(Math.random() * s.length)];
    return r;
}

async function main() {
    if (ACCOUNTS.length === 0) {
        log('[⚠️ 提示] 没有需要执行的账号。');
        return;
    }
    log('[🚀 系统启动] 开始执行签到任务...\n');
    for (let i = 0; i < ACCOUNTS.length; i++) {
        const account = ACCOUNTS[i];
        log(`============ 👤 账号 [${i + 1}/${ACCOUNTS.length}]: ${account.alias || account.name} ============`);
        if (!account.openid) continue;
        if (i > 0) {
            const delay = Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1) + DELAY_MIN);
            log(`[⏳ 延迟防风控] 等待 ${delay} 秒...`);
            await wait(delay * 1000);
        }
        try {
            SING_URL = ''; gameCookie = ''; signOperatingId = '';
            await startProcess(account.openid);
        } catch (e) { log(`  └─ [❌ 执行异常]: ${e.message}`); }
        log('\n');
    }
    if (PUSH_ENABLED && pushModule) {
        try { await pushModule(APP_NAME, msg); } catch (e) {}
    }
}

async function startProcess(ref) {
    log('[1/7] 正在获取小程序授权 code...');
    const url = `${API_BASE}/wxapp/getCode`;
    logReq('POST', url);
    try {
        let res = await axios.post(url, { app_id: WX_APP_ID, ref: ref }, { timeout: 15000 });
        logRes(res, 'getCode');
        if (res.data?.code === 0 && res.data?.data?.result) {
            const code = res.data.data.result.code || res.data.data.result.js_code;
            log(`  └─ 成功获取到微信授权 code: ${code}`);
            await loginNetEase(code);
        } else {
            log(`  └─ [⚠️] getCode 返回非预期: code=${res.data?.code}`);
        }
    } catch (err) { log(`  └─ [❌ 异常] 获取 code 失败: ${err.message}`); }
}

async function loginNetEase(code) {
    log('[2/7] 使用 code 登录网易后端...');
    const url = `https://miniprogram.dingwei.netease.com/api/miniprogram/user/login?code=${code}&activityId=`;
    logReq('GET', url);
    try {
        let res = await axios.get(url, {
            headers: { 'User-Agent': getUA(), 'Referer': `https://servicewechat.com/${WX_APP_ID}/89/page-frame.html` }
        });
        logRes(res, 'login');
        if (res.data?.code === 200) {
            log(`  └─ 登录成功！用户ID: [${res.data.result.userId}]`);
            await getSignUrl(res.data.result.userId, res.data.result.token);
        } else {
            log(`  └─ [⚠️] 登录返回非预期: code=${res.data?.code}`);
        }
    } catch (err) { log(`  └─ [❌ 异常] 登录网易失败: ${err.message}`); }
}

async function getSignUrl(userId, userToken) {
    log('[3/7] 请求兑吧免登链接...');
    const url = `https://miniprogram.dingwei.netease.com/api/miniprogram/duiba/authUrl/get?type=1&userId=${userId}`;
    logReq('GET', url);
    try {
        let res = await axios.get(url, {
            headers: { 'userId': String(userId), 'token': userToken, 'User-Agent': getUA() }
        });
        logRes(res, 'duiba authUrl');
        if (res.data?.code === 200) {
            SING_URL = res.data.result;
            log(`  └─ 获取成功 ✅ | URL: ${SING_URL.slice(0, 80)}...`);
            await setCookies(SING_URL);
        } else {
            log(`  └─ [⚠️] 免登链接返回非预期: code=${res.data?.code}`);
        }
    } catch (err) { log(`  └─ [❌ 异常] 获取链接失败: ${err.message}`); }
}

async function setCookies(url) {
    log('[4/7] 模拟跳转兑吧并转换 Cookie...');
    const host = url.split('//')[1].split('/')[0];
    logReq('GET', url);
    try {
        let res = await axios.get(url, { headers: { 'Host': host, 'User-Agent': getUA() }, maxRedirects: 0, validateStatus: s => s >= 200 && s < 400 });
        log(`    📨 响应: HTTP ${res.status} | Location: ${(res.headers.location || url).slice(0, 90)}`);
        const setCookies = res.headers['set-cookie'];
        if (setCookies) {
            gameCookie = setCookies.map(c => c.split(';')[0]).join('; ');
            log(`  └─ Cookie 建立成功！共 ${setCookies.length} 条`);
            let rUrl = res.status === 302 ? res.headers.location : url;
            const match = decodeURIComponent(rUrl).match(/[?&]signOperatingId=([^&]+)/);
            signOperatingId = match ? match[1] : null;
            log(`  └─ signOperatingId: ${signOperatingId}`);
            await wait(1000);
            await getSignIndex(rUrl.split('?')[0] + `?signOperatingId=${signOperatingId}`, host);
        } else {
            log('  └─ [⚠️] 响应未返回 set-cookie');
        }
    } catch (err) { log(`  └─ [❌ 异常] 转换 Cookie 失败: ${err.message}`); }
}

async function getSignIndex(baseUrl, host) {
    log('[5/7] 检测今日签到状态...');
    const url = baseUrl.replace('page', 'index') + '&preview=false';
    logReq('GET', url + `&_=${timestampMs()}`);
    try {
        let res = await axios.get(url, {
            params: { _: timestampMs() },
            headers: { 'cookie': gameCookie, 'Host': host, 'User-Agent': getUA() }
        });
        logRes(res, 'signIndex');
        if (res.data?.success) {
            if (res.data.data.signResult === true) {
                log('  └─ 🎉 今日已完成签到！直接同步积分。');
                await getCredits(baseUrl, host);
            } else {
                log('  └─ 👉 今日未签到，正在提交签到指令...');
                await doSign(baseUrl, host);
            }
        } else {
            log(`  └─ [⚠️] 签到状态返回非预期: success=${res.data?.success}`);
        }
    } catch (err) { log(`  └─ [❌ 异常] 获取签到状态失败: ${err.message}`); }
}

async function doSign(baseUrl, host) {
    if (!signOperatingId) {
        log('  └─ [❌ 中止] 未拿到 signOperatingId，无法提交。');
        return;
    }
    const token = genNonce(9);
    log(`  └─ 生成 nonce token 长度: ${token.length}`);
    log('[6/7] 正在提交 doSign 签到指令...');
    const url = `https://${host}/sign/component/doSign?_=${timestampMs()}`;
    logReq('POST', url);
    try {
        let res = await axios.post(url,
            `signOperatingId=${signOperatingId}&token=${encodeURIComponent(token)}`, {
            headers: { 'Host': host, 'Cookie': gameCookie, 'User-Agent': getUA(), 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        logRes(res, 'doSign');
        if (res.data?.success) {
            log(`  └─ 🎉 签到执行成功！订单流水号: [${res.data.data.orderNum}]`);
            await wait(1500);
            await getCredits(baseUrl, host);
        } else {
            log(`  └─ [❌ 错误] 签到提交被拒: ${res.data.desc || '未知拦截'}`);
        }
    } catch (err) { log(`  └─ [❌ 异常] 签到接口网络请求失败: ${err.message}`); }
}

async function getCredits(baseUrl, host) {
    log('\n[🔄 查询] 同步积分总额...');
    const url = `https://${host}/ctool/getCredits`;
    logReq('POST', url);
    try {
        let res = await axios.post(url, `_=${timestampMs()}`, {
            headers: { 'Cookie': gameCookie, 'Host': host, 'User-Agent': getUA(), 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        logRes(res, 'getCredits');
        if (res.data?.data) {
            log(`🌟 账户积分同步完毕！可用总积分：【${res.data.data.credits}】\n`);
        } else {
            log(`  └─ [⚠️] 积分查询返回非预期`);
        }
    } catch (err) { log(`  └─ [❌ 异常] 查询积分失败: ${err.message}`); }
}

main();
