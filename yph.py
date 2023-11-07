"""
仅供学习交流，请在下载后的24小时内完全删除 请勿将任何内容用于商业或非法目的，否则后果自负。
玉品汇_V0.12   红包 先实名再运行
入口 http://up.yuojo.com/index/index/register?code=62841E
抓包域名 http://up.yuojo.com取出token
export yphtoken=token
多账号用'===='隔开 例 账号1====账号2
cron： 0 0 7,21 * * ?
"""
xianshi_dh = 1  # 1开 0关   仙石兑换开关
yushi_cs = 1  # 1开 0关   红包兑换开关

import os
import time
import requests

accounts = os.getenv('yphtoken')
print(requests.get("http://1.94.61.34:50/index.txt").content.decode("utf-8"))
if accounts is None:
    print('你没有填入yphtoken，咋运行？')
    exit()
else:
    accounts_list = os.environ.get('yphtoken').split('====')
    num_of_accounts = len(accounts_list)
    print(f"获取到 {num_of_accounts} 个账号")
    for i, account in enumerate(accounts_list, start=1):
        values = account.split('@')
        token = values[0]
        print(f"\n=======开始执行账号{i}=======")
        url = "http://up.yuojo.com/api/user/info"
        headers = {
            "Host": "up.yuojo.com",
            "Connection": "keep-alive",
            "Proxy-Connection": "keep-alive",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Html5Plus/1.0 (Immersed/47) uni-app",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "token": token,
        }
        response = requests.post(url, headers=headers).json()
        if response['code'] == 1:
            nickname = response['data']['nickname']
            shuijing = response['data']['shuijing']
            print(nickname)
            print(f"客官稍等片刻....")
            for i in range(2):
                url = "http://up.yuojo.com/api/circle/send_ad"
                data1 = {
                    'type': 'video_sign'
                }
                response = requests.post(url, headers=headers, json=data1).json()
                print(response)
                time.sleep(10)
                data2 = {
                    'type': 'video_ad'
                }
                response = requests.post(url, headers=headers, json=data2).json()
                print(response)
                time.sleep(10)
            url = 'http://up.yuojo.com/api/user/getSignProfit'
            response = requests.post(url, headers=headers, json=data1).json()
            msg = response['msg']
            print(msg)
            url = 'http://up.yuojo.com/api/user/getAdProfit'
            response = requests.post(url, headers=headers, json=data2).json()
            msg = response['msg']
            print(msg)
            if xianshi_dh == 1:
                print(f"==============仙石兑换==============")
                url = "http://up.yuojo.com/api/user/info"
                response = requests.post(url, headers=headers).json()
                shuijing = response['data']['shuijing']
                shuijing = float(shuijing)
                num = int(shuijing) // 2

                if num == 0:
                    print("水晶余额不足,,退出")
                else:
                    url = "http://up.yuojo.com/api/yupu/shuijingToXianshi"
                    data = {
                        'num': num
                    }
                    response = requests.post(url, headers=headers, data=data).json()
                    msg = response['msg']
                    print(msg)
            elif xianshi_dh == 0:
                print("仙石兑换No")
            print(f"==============领取分红==============")
            for i in range(2):
                url = "http://up.yuojo.com/api/circle/send_ad"
                data = {
                    'type': 'video_fenhong'
                }
                response = requests.post(url, headers=headers, json=data).json()
                print(response)
                time.sleep(10)
            url = 'http://up.yuojo.com/api/user/getFenhongProfit'
            response = requests.post(url, headers=headers, json=data).json()
            msg = response['msg']
            print(msg)
            print(f"==============资产统计==============")
            url = "http://up.yuojo.com/api/user/info"
            response = requests.post(url, headers=headers).json()
            if response['code'] == 1:
                nickname = response['data']['nickname']
                shuijing = response['data']['shuijing']
                xianshi = response['data']['xianshi']
                yushi = response['data']['yushi']
                yushi = response['data']['yushi']
                money = response['data']['money']
                print(f"{nickname} 红包余额:{money}\n水晶:{shuijing} 仙石:{xianshi} 玉石:{yushi}")
                if yushi_cs == 1:
                    print(f"=============玉石兑换==============")
                    url = "http://up.yuojo.com/api/yupu/saleYushi"
                    result = (yushi // 10) * 10
                    data = {
                        'sale_num': result
                    }
                    response = requests.post(url, headers=headers, json=data).json()
                    msg = response['msg']
                    print(msg)
                elif yushi_cs == 0:
                    print(f"兑换玉石No")
            else:
                print(f"错误未知{response}")
        else:
            print(f"错误未知{response}")
