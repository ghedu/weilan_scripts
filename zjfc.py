"""

项目名称 浙江福彩
变量 Authorization
变量名 zjfcau
多账号   换行/回车


export zjfcau='' 
Authorization 
在关注浙江福彩后-工具栏 服务工具-有奖互动 
然后开启抓包 点去抽奖或者     我的奖品搜front/api/getOrderList

脚本作者: QGh3amllamll
版本1.1
"""

import os
import requests
import time
import json

from random import randint

from datetime import datetime, timezone, timedelta

#---------------------脚本控制中心-------------

QGh3amllamll_jh = 0    # 控制增加机会功能，0为开启，1为关闭
QGh3amllamll_cj = 0  # 控制抽奖功能，0为开启，1为关闭


#---------------------脚本控制中心-------------
# 配置参数
base_url = "https://apimeans.luckyop.com/front/api/"
merchant_id = "628"
user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.43(0x18002b29) NetType/WIFI Language/zh_CN"

        # 增加彩票抽奖机会 
def create_order(token, merchant_id, user_agent,index):# 增加彩票抽奖机会 

    create_order_url = f"{base_url}createOrder/"
    headers = {
        'Authorization': token,
        'merchantId': merchant_id,
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': user_agent,
        'sign': '6d4141c115e28975770a13cf5edf4f72',
    }
    data = '{"actId":698740515,"standardId":33339,"commodityNum":1}'


    resp = requests.post(create_order_url, headers=headers, data=data)
    response_json = resp.json()

    if response_json["status"] == 200 and "orderCode" in response_json["payload"]:
        print(f"账号{index}：抽奖机会+1")
    elif "error" in response_json and "今日抽奖机会发放已达上限!" in response_json["error"]:
        print(f"账号{index}：今日抽奖机会发放已达上")
        return  # 跳过这个任务

    time.sleep(0.5)

def get_lottery_info(token, merchant_id, user_agent):# 获取彩票信息

    get_lottery_info_url = f"{base_url}get_lottery_info/698740460"
    headers = {
        'Authorization': token,
        'merchantId': merchant_id,
        'User-Agent': user_agent,
        'sign': '3e9f34f0f5a6c8462e77a95107132292'
    }
    try:
        response = requests.get(get_lottery_info_url, headers=headers)
        if response.status_code == 200:
            #print("获取彩票信息成功:", response.json())
            #print("获取彩票信息成功:")
            print()
        else:
            print(f"获取彩票信息失败，状态码：{response.status_code}, 响应：{response.text}")
    except requests.RequestException as e:
        print(f"网络请求异常: {e}")

def lottery_draw(token, merchant_id, user_agent):#抽奖

    #base_url = 'https://apimeans.luckyop.com/'  
    lottery_draw_url = "https://apimeans.luckyop.com/front/api/lottery_draw"
    headers = {
        'Authorization': token,
        'merchantId': merchant_id, 
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': user_agent,  
        'sign': '711eecb0d05dcd3c29d2e14cb67c8a8b'
    }
    data = '{"actId":698740460}'  # 将字典转换成JSON字符串


    try:
        response = requests.post(lottery_draw_url, headers=headers, data=data)
        if response.status_code == 200:
            response_json = response.json()
            if response_json['status'] == 200:
                prize_name = response_json['payload']['prizeName']
                print(prize_name)
                return True  # 表示抽奖成功
            else:
                print(response_json['error'])
                return False  # 表示抽奖失败或达到次数上限
        else:
            print(f"抽奖失败，状态码：{response.status_code}, 响应：{response.text}")
            return False  # 表示请求出错
    except requests.RequestException as e:
        print(f"网络请求异常: {e}")
        return False  # 网络异常

    return False  # 默认返回False

def get_beijing_date():# 获取北京日期的函数

    beijing_time = datetime.now(timezone(timedelta(hours=8)))
    return beijing_time.date()

def get_order_list(token, merchant_id, user_agent, index, comment):# 获取中奖数据的函数
    get_order_list_url = "https://apimeans.luckyop.com/front/api/getOrderList"
    headers = {
        'Authorization': token,
        'merchantId': merchant_id,
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': user_agent,
        'sign': 'f83d026dcf500bc6b319c745102cf895'
    }
    data = '{"actId":"698740460","reloadHook":false,"currentPage":1,"actType":"1,3,2,4,5,20","status":"","fishState":"","proTypes":"","orderState":""}'

    try:
        response = requests.post(get_order_list_url, headers=headers, data=data)
        if response.status_code == 200:
            response_json = response.json()
            print("获取订单列表成功:")
            # 初始化金额统计
            total_amount = 0
            today_amount = 0
            # 获取今天的日期
            today = get_beijing_date()
            
            if 'payload' in response_json and 'list' in response_json['payload']:
                for item in response_json['payload']['list']:
                    pro_standard_name = item.get('proStandardName', '未知')
                    order_time = item.get('orderTime', '未知')
                    #print(f"奖品名: {pro_standard_name}, 中奖时间: {order_time}")
                    
                    # 提取金额并进行统计
                    if '元微信红包' in pro_standard_name:
                        amount = float(pro_standard_name.split(" ")[1].replace('元微信红包', ''))
                        total_amount += amount
                        # 今日金额
                        if str(today) in order_time:
                            today_amount += amount
               # print(f"账号{index}🤪{comment} ：今日金额: {today_amount}元---总共金额: {total_amount}元")
                print(f"账号{index}🤪{comment} ：今日金额: {round(today_amount, 2)}元---总共金额: {round(total_amount, 2)}元")

               # print(f"总共中奖金额: {total_amount}元")
               # print(f"今日中奖金额: {today_amount}元")
            else:
                print("响应中没有找到期望的数据")
        else:
            print(f"获取订单列表失败，状态码：{response.status_code}, 响应：{response.text}")
    except requests.RequestException as e:
        print(f"网络请求异常: {e}")




def get_env_variable(var_name):
    value = os.getenv(var_name)
    if value is None:
        print(f'环境变量{var_name}未设置，请检查。')
        return None

    accounts = value.strip().split('\n')
    # 打印账号数量
    num_accounts = len(accounts)
    print(f'-----------本次账号运行数量：{num_accounts}-----------')

    return accounts




def main():
    tokens = get_env_variable('zjfcau')
    if not tokens:
        print('环境变量 zjfccp 未设置，请检查。')
        return

    print(f'找到 {len(tokens)} 个账号的令牌。')

    exceeded_accounts = set()  # 用于存储达到抽奖次数上限的账号索引

    for _ in range(12):  # 假设您想要运行10次，但这里可能需要调整
        for index, token_with_comment in enumerate(tokens, start=1):
            if index in exceeded_accounts:
                continue  # 如果此账号已达到抽奖次数上限，跳过当前账号的处理

            parts = token_with_comment.split('#')
            token = parts[0].strip()
            comment = parts[1].strip() if len(parts) > 1 else "无备注"

            print(f"------账号{index}  {comment} 处理中-----")
        #旧版本控制中心
            #create_order(token, merchant_id, user_agent, index)
            #get_lottery_info(token, merchant_id, user_agent)
            #success = lottery_draw(token, merchant_id, user_agent)
            #if not success:
            #    exceeded_accounts.add(index)  # 添加到达到上限的账号集合中
            #    continue
         #改版本控制中心

            if QGh3amllamll_jh == 0:
                create_order(token, merchant_id, user_agent, index)  # 增加机会

            get_lottery_info(token, merchant_id, user_agent)  # 看信息

            if QGh3amllamll_cj == 0:
                success = lottery_draw(token, merchant_id, user_agent)  # 抽奖
                if not success:
                    exceeded_accounts.add(index)  # 添加到达到上限的账号集合中
            else:
                
                pass




            time.sleep(randint(1, 2))
    print("-" * 48)  # 打印分隔线
    print("-" * 48)  # 打印分隔线
    print("--浙江福彩--，开始获取今日中奖数据。")

 
    for index, token_with_comment in enumerate(tokens, start=1):
        # 不再检查账号是否达到上限
        parts = token_with_comment.split('#')
        token = parts[0].strip()
        comment = parts[1].strip() if len(parts) > 1 else "无备注"

        get_order_list(token, merchant_id, user_agent, index, comment)

if __name__ == "__main__":
    main()
