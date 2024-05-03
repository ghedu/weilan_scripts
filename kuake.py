//夸克网盘签到
//变量：cookie

import requests
import json
import notify
 
def check_request_response(response):
    """检查请求是否成功，并返回响应数据或打印错误信息"""
    if not response.ok:
        print(f"请求失败，状态码: {response.status_code}")
        return None
    return response.json()
 
def quark_sign_in(cookie):
    state_url = "https://drive-m.quark.cn/1/clouddrive/capacity/growth/info?pr=ucpro&fr=pc&uc_param_str="
    headers = {'Cookie': cookie}
     
    # 获取签到状态
    state_response = requests.get(state_url, headers=headers)
    response_data = check_request_response(state_response)
    if not response_data:
        return False
     
    sign = response_data["data"]["cap_sign"]
     
    if sign["sign_daily"]:
        number = sign["sign_daily_reward"] / (1024 * 1024)
        progress = round(sign["sign_progress"] / sign["sign_target"] * 100, 2)
        message = f"今日已签到获取{number}MB，进度{progress}%"
        print(message)
        return message
     
    # 执行签到
    sign_url = "https://drive-m.quark.cn/1/clouddrive/capacity/growth/sign?pr=ucpro&fr=pc&uc_param_str="
    params = {"sign_cyclic": True}
    headers = {'Content-Type': 'application/json', 'Cookie': cookie}
    sign_response = requests.post(sign_url, headers=headers, json=params)
     
    data_response = check_request_response(sign_response)
    if not data_response:
        return None
     
    mb = data_response["data"]["sign_daily_reward"] / 2048
    print(json.dumps(data_response))
    return f"签到成功，获取到{mb}MB!"
 
def main():
    # 定义多个 cookie，每个 cookie 带有名称作为键
    cookies = {
        "cookie1": "",
                "cookie2": "",
                # 继续添加更多 cookie
    }
 
    # 定义用于存储签到结果的字典
    sign_results = {}
 
    # 循环遍历每个 cookie 并调用签到函数
    for name, cookie in cookies.items():
        print(f"正在签到 {name} ...")
        sign_message = quark_sign_in(cookie)
        if sign_message:
            sign_results[name] = sign_message
        else:
            sign_results[name] = "签到失败"
            notify.send("夸克盘签到异常", f"{name} 的签到失败!") 
     
    # 输出所有账户的签到结果
    print("\n签到结果：")
    for name, message in sign_results.items():
        print(f"{name}: {message}")
     
    # 汇总所有签到信息
    summary_message = "\n".join([f"{name}: {message}" for name, message in sign_results.items()])
     
    # 使用 notify.send 发送汇总信息通知
    notify.send("夸克盘签到汇总", summary_message)
 
if __name__ == "__main__":
    main()