/*
 @name WoolWeb 变量转换 
 @time ©2023-11-23
 @author https://github.com/smallfawn/
 @modify maybe is me
 @test ["广汽传祺",""]
*/
//只有超过两个账号才会转换 1个账号不转换
let WoolWeb_envSplitor = ["@", "\n"]
let WoolWeb_strSplitor = ["&", "#"]
let WoolWeb_keySplitter = ["="]

function test(QingLongValue, strSplitor, envSplitor) {
    let envValueArr = []
    if (QingLongValue) {
        if (QingLongValue.includes(WoolWeb_envSplitor[0])) {
            let userCookieList = QingLongValue.split(WoolWeb_envSplitor[0]);
            for (let userCookie of userCookieList) {
                if (userCookie) {
                    let userValueList = userCookie.split(WoolWeb_strSplitor[0]);
                    let userCookieStrArr = [];
                    for (let userValue of userValueList) {
                        let [, value] = userValue.split(WoolWeb_keySplitter[0]);
                        userCookieStrArr.push(value);
                    }
                    let userCookieStr = userCookieStrArr.join(strSplitor);
                    envValueArr.push(userCookieStr);
                }
            }
        } else {
            let userValueList = QingLongValue.split(WoolWeb_strSplitor[0]);
            let userCookieStrArr = [];
            for (let userValue of userValueList) {
                let [, value] = userValue.split(WoolWeb_keySplitter[0]);
                userCookieStrArr.push(value);
            }
            let userCookieStr = userCookieStrArr.join(strSplitor);
            envValueArr.push(userCookieStr);
        }
        console.log(`转换后的变量共[${envValueArr.length}]个`);
        return envValueArr.join(envSplitor);
    }
}
const { getEnvs, updateEnv11, delEnv } = require("./ql.js")
!(async () => {
    console.log(`WOOLWEB变量[WoolWeb_GacmotorV2]`);
    console.log(`将要更新的变量[gacmotorToken]`);
    let olddata1 = await getEnvs("WoolWeb_GacmotorV2")
    if (olddata1[0]) {
        let olddata2 = await getEnvs("gacmotorToken")
        if (olddata2[0]) {
            let newdata = test(olddata1[0].value, "&", "@")
            console.log(`转换完毕的变量集合[${newdata}]`)
            let data = olddata2[0].value + '@' + newdata
            console.log(`将要更新的数据[${data}]`)
            await updateEnv11(data, olddata2[0].id, null, olddata2[0].name)
            await delEnv(olddata1[0].id)
        } else {
            console.log(`不存在gacmotorToken变量 请手动创建 且变量值为1  转换完毕后删除1和后面的@  例如1@  即可`)
        }

    } else {
        console.log(`不存在WoolWeb_GacmotorV2变量 请用WoolWeb登录获取变量`)
    }


})()
