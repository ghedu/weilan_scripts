# Author: lindaye
# Update:2023-09-26
# 农好优
# 添加账号说明(青龙/本地)二选一
#   青龙: 青龙变量nhytoken 值{"phone":"xxxxxxxx","password":"xxxxx"} 一行一个(回车分割)
#   本地: 脚本内置ck方法ck_token = [{"phone":"xxxxxxxx","password":"xxxxx"},{"phone":"xxxxxxxx","password":"xxxxx"}]
# 软件版本
version = "0.0.1"
name = "农好优"
linxi_token = "nhytoken"
linxi_tips = '{"phone":"xxxxxxxx","password":"xxxxx"}'
import requests
import json
import os
import re
import time
from multiprocessing import Pool

# 变量类型(本地/青龙)
Btype = "青龙"
# 提现限制(元)
# Limit = 0
# 域名(无法使用时请更换)
domain = "http://wap.nonghaoyou.cn"
# 保持连接,重复利用
ss = requests.session()
headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.39 (0x18002733) NetType/WIFI Language/zh_CN",
    "Referer": "",
    "Origin": "",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
}


def user_info(i, ck):
    try:
        data = f"username={ck['phone']}&password={ck['password']}&xieyi=on"
        result = ss.post(domain + "/Public/login", headers=headers, data=data)
        # token = result.cookies['token']
        info = ss.get(domain + "/Member/index")
        name = re.findall(r'#FFF">(.*?)</a>', info.text)
        number = re.findall(r'my-number">(.*?)</div>', info.text)
        print(
            f"账号【{i+1}】{result.json()['info']} 用户:{name[0]} 余额:{number[0]} 积分:{number[1]} 预估收益:{number[2]}"
        )
    except Exception as e:
        print(f"账号【{i+1}】请检查账号({ck['phone']})密码是否正确!")


def do_read(i, ck):
    try:
        data = f"username={ck['phone']}&password={ck['password']}&xieyi=on"
        result = ss.post(domain + "/Public/login", headers=headers, data=data)
        result.json()['info']
        for j in range(10):
            data = {"uid": "11951"}
            result = ss.post(domain + "/Member/ad_video_api", headers=headers, data=data)
            if "签到已完成" not in result.text:
                result = result.json()
                if result["status"] == 1:
                    print(f"账号【{i+1}】签到成功-第{result['num']}次")
                    time.sleep(1)
                elif result["status"] == 0:
                    print(f"账号【{i+1}】签到失败-{result['info']}")
                    break
                else:
                    print(f"账号【{i+1}】签到异常-{result}")
            else:
                print(f"账号【{i+1}】今日签到任务已全部完成!")
                break
    except Exception as e:
        print(f"账号【{i+1}】请检查账号({ck['phone']})密码是否正确!{e}")


if __name__ == "__main__":
    print(
        f"""██╗     ██╗███╗   ██╗██╗  ██╗██╗      ███╗   ██╗██╗  ██╗██╗   ██╗
██║     ██║████╗  ██║╚██╗██╔╝██║      ████╗  ██║██║  ██║╚██╗ ██╔╝
██║     ██║██╔██╗ ██║ ╚███╔╝ ██║█████╗██╔██╗ ██║███████║ ╚████╔╝ 
██║     ██║██║╚██╗██║ ██╔██╗ ██║╚════╝██║╚██╗██║██╔══██║  ╚██╔╝  
███████╗██║██║ ╚████║██╔╝ ██╗██║      ██║ ╚████║██║  ██║   ██║   
╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝      ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   
    项目:{name}           BY-林夕          Verion: {version}(并发)
    Github仓库地址: https://github.com/linxi-520/LinxiPush
"""
    )
    if Btype == "青龙":
        if os.getenv(linxi_token) == None:
            print(f"青龙变量异常: 请添加{linxi_token}变量示例:{linxi_tips} 确保一行一个")
            exit()
        # 变量CK列表
        ck_token = [json.loads(line) for line in os.getenv(linxi_token).splitlines()]
    else:
        # 本地CK列表
        ck_token = [
            # 这里填写本地变量
        ]
        if ck_token == []:
            print(f"本地变量异常: 请添加本地ck_token示例:{linxi_tips}")

    # 创建进程池
    with Pool() as pool:
        # 并发执行函数
        print("==================获取账号信息=================")
        pool.starmap(user_info, list(enumerate(ck_token)))
        print("==================开始执行=================")
        pool.starmap(do_read, list(enumerate(ck_token)))
        print("==================获取账号信息=================")
        pool.starmap(user_info, list(enumerate(ck_token)))
        # 关闭进程池
        pool.close()
        # 等待所有子进程执行完毕
        pool.join()

        # 关闭连接
        ss.close
        # 输出结果
        print(f"================[{name}V{version}]===============")
