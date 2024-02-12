"""
项目 百事乐元 - 抽奖活动
最好手动抽一次，同意协议。
变量 token#l_id#备注     多账号换行  
变量名 bslycj
例如：aa084f61ece7b379cbe4515aee00d238d76,ofwefwqefhXy2_gwefwTs#88878311#大号

dhzdsx = 1/0 是 控制 组队逻辑的 默认随机组队
--------------更新/注意--说明-------------


注意 最好手动抽一次，同意协议。
1.1更新   随机组队
1.2 更新  组队判断/逻辑  time 2024年1月27日02:31:52
1.3  修复 组队红包奖励不到
"""
import os
import requests
from datetime import datetime, timezone, timedelta
import json
import time
import random

#---------简化的框架--------
dhzdsx = 1 # 设置为 0 表示按顺序组队，设置为 1 表示随机组队
# 配置参数
base_url = "https://hxxxy.gov.cn"  # 已修改为实际的基础URL
user_agent = "Mozilla/5.0 (Linux; Android 11; ONEPLUS A6000 Build/RKQ1.201217.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160049 MMWEBSDK/20231201 MMWEBID/2930 MicroMessenger/8.0.45.2521(0x28002D36) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android"

# 获取北京日期的函数
def get_beijing_date():  
    beijing_time = datetime.now(timezone(timedelta(hours=8)))
    return beijing_time.date()

def dq_time():
    dqsj, dysj = int(time.time()), datetime.fromtimestamp(dqsj).strftime('%Y-%m-%d %H:%M:%S')
    return dqsj, dysj

# 获取环境变量
def get_env_variable(var_name):
    value = os.getenv(var_name)
    if value is None:
        print(f'环境变量{var_name}未设置，请检查。')
        return None
    accounts = value.strip().split('\n')
    num_accounts = len(accounts)
    print(f'-----------本次账号运行数量：{num_accounts}-----------')
    print(f'-----------项目 百事乐元 - 抽奖活动-----脚本作者: QGh3amllamll 1.3 ------')
    return accounts

# 封装请求头
def create_headers(account_token):
    headers = {
        'host': 'pepcoinbhhpre.pepcoinbypepsico.com.cn',
        'accept': 'application/json, text/plain, */*',
        'user-agent': user_agent,
        'charset': 'utf-8',
        'content-type': 'application/json',
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'token': account_token,
        'Referer': 'https://servicewechat.com/wx1a72addb7ee74f67/124/page-frame.html'
    }
    return headers

def cj(account_token):#抽奖
    url = "https://pepcoinbhhpre.pepcoinbypepsico.com.cn/mp/draw"
    headers = create_headers(account_token)
    #print(headers)
    while True:
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            response_data = response.json()
            #print(response.json())

            # 检查响应的code
            if response_data.get('code') == 0:
                prize_name = response_data.get('data', {}).get('name')
                if prize_name == "现金红包":
                    amount = response_data.get('data', {}).get('amount', 0)
                    print(f"获得现金红包: {amount / 100} 元")
                    # 如果需要在获得红包后继续请求，保持这个循环；如果不需要，使用 break 退出循环
                elif prize_name:
                    print(f"获得奖品: {prize_name}")
                    #break  # 收到奖品后退出循环
                else:
                    print("响应中没有奖品名称。")
                    break
            else:
                print("抽奖次数超限")
                #print("抽奖完整响应内容:", response_data)
                break

            # 暂停 3 到 5 秒后继续下一次请求
            time.sleep(random.randint(3, 5))

        except requests.exceptions.RequestException as e:
            print(f"请求失败: {e}")
            return None

def hql_id(account_token): #获取iid

    try:
        token = account_token.split(',')[0]
    except IndexError:
        print("Token 提取失败或格式不正确")
        return

    url = "https://pepcoinnew.pepcoinbypepsico.com.cn/api/v1/wxapp/doGetUserInfo"
    headers = {
        'Host': 'pepcoinnew.pepcoinbypepsico.com.cn',
        'Connection': 'keep-alive',
        'Content-Length': '96',
        'charset': 'utf-8',
        'user-agent': user_agent,
        'content-type': 'application/json',
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'Referer': 'https://servicewechat.com/wx1a72addb7ee74f67/124/page-frame.html',
    }
    #print(headers)
    data = {
        "token": token,
        "provision": "2_0_6"
    }
    #print(data)
    try:
        response = requests.post(url, json=data, headers=headers)
        #print("响应状态码:", response.status_code)
        #print("响应内容:", response.text)

        if response.status_code == 200:
            # 解析响应内容
            response_data = json.loads(response.text)
            if response_data.get('code') == 0:
                l_id = response_data['data'].get('l_id', '未知')
                print("l_id:", l_id)
            else:
                print("操作未成功，响应 code 不为 0")
        else:
            print("请求可能遇到问题，检查状态码和响应内容")
    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")

def add_tmrw(account_token):#天猫会员任务
    url = "https://pepcoinbhhpre.pepcoinbypepsico.com.cn/mp/addTMallMember"
    headers = create_headers(account_token)
    #print(account_token)
    try:
        response = requests.get(url, headers=headers)  # 尝试使用GET方法
        response_data = response.json()  # 解析响应为JSON
        #print(response_data)  # 打印响应的JSON数据

        # 根据返回的code和data字段判断操作结果
        if response_data.get("code") == 0:
            if response_data.get("data") == 1:
                print("添加天猫会员任务成功，增加抽奖机会+1。")
            else:
                print("添加天猫会员任务失败。")
        else:
            print("请求异常，响应内容：" + str(response_data))

    except requests.exceptions.RequestException as e:
        print(f"请求异常：{e}")

def zd_jh(account_token):  # 判断组队机会
    url = "https://pepcoinbhhpre.pepcoinbypepsico.com.cn/mp/getMyTeam"
    headers = create_headers(account_token)

    try:
        response = requests.get(url, headers=headers)
        response_json = response.json()  # 解析响应为JSON
        if response_json.get('code') == 0:  # 根据 code 的值进行判断
            data = response_json.get('data', {})
            teamCount = data.get('teamCount', 0)  # 确保默认值为0
            # 其他信息可以根据需要返回
            return {"teamCount": teamCount}
        else:
            print("不是0 打印", response_json)
            return None
    except requests.exceptions.RequestException as e:
        print(f"请求异常: {e}")
        return None


def post_join_team(dc_iid, zd_token, account_no):  # 组队逻辑
    url = "https://pepcoinbhhpre.pepcoinbypepsico.com.cn/mp/postJoinTeam"
    headers = create_headers(zd_token)
    data = {"inviteUser": dc_iid}  # 使用轮流作队长的IID

    try:
        response = requests.post(url, json=data, headers=headers)
        response_data = response.json()  # 解析响应为JSON

        code = response_data.get("code")
        data_value = response_data.get("data")
        if code == 0:
            if isinstance(data_value, dict) and 'name' in data_value:
                # 不管奖品价值多少，只要有奖品就退出组队
                name = data_value.get('name', '')
                #amount = data_value.get('amount', 0) / 100  # 转换为元，如果没有amount则默认为0
                print(f"组队奖品: {name} ")
                return "exit_team"
            elif data_value == 5:
                print(f"{account_no} 不能加入自己的队伍。")
            elif data_value == 4:
                print(f"{account_no} 已经在队伍里了。")              
            elif data_value == 3:
                print(f"{account_no} 和组过队了，组队失败。")             
            elif data_value == 2:
                print(f"组长没有次数，退出帮组队")
                return "exit_team"  # 组长没有次数时也退出组队
            elif data_value == 1:
                print(f"{account_no} 今天组队次数已经使用完。退出工具人列表")
                return "yddm"
            elif data_value == 0:
                print(f"{account_no} 加入队伍成功。")
            else:
                print(f"未知响应数据: {response_data}")
        else:
            print(f"未知响应: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"请求失败: {e}")

    # 每次请求后暂停 1 到 2 秒
    time.sleep(random.randint(1, 2))
    return True  # 默认情况下，继续组队流程


def cj_prizes(account_token, page=1):  # 抽奖的奖品信息
    """获取我的奖品信息"""
    total_cash = 0
    url = f"https://pepcoinbhhpre.pepcoinbypepsico.com.cn/mp/getMyPrizes?page={page}"
    headers = create_headers(account_token)
    try:
        response = requests.get(url, headers=headers)
        response_data = response.json()  # 解析响应为JSON

        if response_data.get("code") == 0 and "data" in response_data:
            prizes = response_data["data"]
            for prize in prizes:
                act_time = prize.get("actTime")
                prize_name = prize.get("prizeName")
                # 特别判断现金红包
                if "现金红包" in prize_name:
                    cash_amount = float(prize_name.split('元')[0])  # 提取现金金额
                    total_cash += cash_amount
                    print(f"抽奖 ：{prize_name}，时间：{act_time}")

        else:
            print("获取奖品信息失败或没有奖品。")
        return total_cash  # 正常情况下返回总金额

    except requests.exceptions.RequestException as e:
        print(f"请求异常：{e}")
        return total_cash  # 异常情况下返回总金额

def zd_prize(account_token):  # 获取团队奖品信息
    """获取团队奖品信息"""
    total_cash = 0
    url = "https://pepcoinbhhpre.pepcoinbypepsico.com.cn/mp/getTeamPrize"
    headers = create_headers(account_token)
    try:
        response = requests.get(url, headers=headers)
        response_data = response.json()  # 解析响应为JSON

        if response_data.get("code") == 0 and "data" in response_data:
            team_prizes = response_data["data"]
            for prize in team_prizes:
                prize_name = prize.get("prizeName") or "未知奖品"
                grant_time = prize.get("grantTime")
                if "现金红包" in prize_name:
                    cash_amount = float(prize_name.split('元')[0])  # 提取现金金额
                    total_cash += cash_amount
                    print(f"组队 ：{prize_name}，时间：{grant_time}")
        else:
            print("获取团队奖品信息失败或没有奖品。")
        return total_cash  # 正常情况下返回总金额

    except requests.exceptions.RequestException as e:
        print(f"请求异常：{e}")
        return total_cash  # 异常情况下返回总金额


#本地测试用 
os.environ['bslyck'] = '''
b4be6583df0a36189ccd5de8fbb2586d8fc9978aed32b76a4f0a192748954f6d,oKW2E4gsVKSglJ8uRXxbqOcsQEV0#60849318#年年有鱼
f7238332a969ab3eaefa239251a5b013c8b9a9fa11c6e258b169fe7db1935e0f,oKW2E4ks8EGXRgIc8F0r8wdjsfTA#29585731#肖
a9fada7e3b7742bcfbf730998dc6ed91beb2f8ac5a886e293b9ccfaebd12f13e,oKW2E4nsPpwt_slr374wt16M0dFY#60575752#肖m
bb5434611f76e9fc21e30ace47cc2b484c3a3b1989b3545e34926add6b4b4865,oKW2E4vevU10lTPd5DH_xSutywr4#59675230#肖小号
8f5d8860bcbf247ab9873606b787ab7b73607e5256c651f189a826d78af6ed77,oKW2E4jkvl-JqnXUnApH0SDOYaxQ#28619319#一号
0040f0a28c1eee17b6d0d9940f7d42434a4daeb32407145b080b6bfe3350bd52,oKW2E4i8BQ4zNcyZckcenzutLvT4#28619141#二号
6d54cd1f4f1108a5d53ba037b177c2cee5d5db1da73cb9e755ddc163d2876580,oKW2E4icHTyWIyclxiPs23QSBlSE#51155635#三号
d874bc27697bbd641c82cd1ea4c262a8a54609c90f2ab71b57a2d409e5a67d23,oKW2E4t49T-eRsSi4TtRW8ijagRs#55853594#四号
06e7d8a4cc050b8d0e2fea28d9ec1ffda72b572c09b2364d1b7754257232760e,oKW2E4grcCxTYpf4Ssoy7YSBy6j0#55853586#五号
aa084f61ece7b3796832dea6aac40ebccc0c90be4548f65b5c86aee00d238d76,oKW2E4m5hEya_VlTPXy2_LydfwTs#28570311#大号
f8311051ef09a9a2366657f184768b7d8a0f162ce0e7331e138fadab00ccde5e,oKW2E4qsc4FTub5-PQIqpGuJqWPk#60981588#四月天
cf6b7fc0f03fefaa0fcaab1662e91406af6d2b6be0f52b05baa12884e3a5e439,oKW2E4q-6I_w5ttkbaFvpVkVRYM8#60981744#曹mama
e0d82a6bc6904a82efe911c4ad15c8bac87c2258ca8c9caf7cd93b8935ed821e,oKW2E4otKMm3X3KYOw1vm-8DZCd0#60981930#圈圈
3f25550b46154a644a35c59ec9c8cad22e5883f73fdb44c6014d7d8d3353f5c5,oKW2E4nS4Iuc_cqwDHBwCysDulvs#60982344#哈哈妈
b0821cbc660357bf5f676304c3157e82f2f6bce341368f625885b03fd8142221,oKW2E4qddmsFMw0Rs2JhDqhG_CLs#60982114#喵啊
d190283ecc6c467641c92ec9b60b1a2296d7ca7dff25c0836334cb32e78bac7c,oKW2E4t0HQPgpqQqdO5psQYLk9AU#60982095#五一
49d492e7b45f2aa5aad32abdaf465a2025e8aa76efb2e6c590db1ccb0c188202,oKW2E4hIqSvd9L69UyFnisEEHWCs#51921319#米恩
7773f2ebd7558e7083a7665cb9864a390f23f5c4c4b050945c137bca8d104e16,oKW2E4idZZcVsbNwxPJGWzItmVfg#25807121#小蜗
ee9a5a8d5391250b733c0ea1a732897cffbb51f2c6b7e543c5d6d8f3a8009e3b,oKW2E4is7_nIk3z4JScYT2uBN6QI#25807157#米迪亚
9fd361fdab2662eb5e2a3ff8897144d95e294b32f08ae2bcb1735bf461359bd3,oKW2E4q4G_6iNdSkVLtCWOSA6RBI#29984965#嘟嘟
9e4d743e6e6fec0fca1cb346fa9f5abe761b53ac99e4115fb71e5ee06cbbc755,oKW2E4oRAtJFXdYbBfE-663NAjjM#58694788#Crush
d20f565c72ccc922a98fb20c842accdad22599831f40ec9bbfa0a1f982ae3c6c,oKW2E4j4VKmS_nHQeLGIt71BRP5o#51920512#liar
8afadefd26541a8089247a09eeff592cd8d43ae3421d750384a4885b254c3be8,oKW2E4tiqd_ANmLMRClytEeQuwiE#25807177#无了
c9f463e009d47aea4872339edec6a8106b6c69623943a9ced24c46462431042d,oKW2E4lgfKJfwnziB907o6bS7ZzM#58694787#绵绵
e1f61529ad585c868739a20897d172d0476565e3b9f2b24e7237e149565817f2,oKW2E4qz2dqXP6-Xv149CdV7T92Y#25807241#喵喵
47391894896de6b96de33e551ef7a05bfaae50fc7b23fc3ee8aac405726a6071,oKW2E4lAwFGgMqJkfuu3b4YeniB0#51924740#Aurora
3fd832020a27f0c1c44f252d36887618dac791c7da963cfc69e087ed6fcc52d3,oKW2E4v4JPUDJnRkSm1e84iVYVqE#51921141#Yolk
5d773edbefe009c1b51d863c62c7dd0f39ee7bfb2ab3c7bb60df310abe47bf9d,oKW2E4ks8EGXRgIc8F0r8wdjsfTA#29585731#肖
20d3d93f36992033e7780c7d520ba3a573317a6d1bceb362ac19f1a1945547ff,oKW2E4nsPpwt_slr374wt16M0dFY#60575752#肖m
9d24d7434834b7503795eac898d9a84acb2ce60f3e038a949b35de134b31f434,oKW2E4vevU10lTPd5DH_xSutywr4#59675230#肖小号
877668debcb4083978d119ab3cca9296783514299c4cd253347ac81b148accde,oKW2E4ip-8OYYlqwy2GtH5oDQeHU#4803375#ali
7abf6304e0092d1402962fddc787deb9bfb551688f56a030030b4442da3d02ae,oKW2E4sTgMqpjJ8EVMwj5oGGgd80#5412577#小丽
8c31ea0f1284c6a6a92bcca44014825176ff9c7b5daf9ed5fd9521ec97cebac3,oKW2E4gsaa93X4DdJ-PDdty5L154#61314474#zmq
ec48f1dab6389fc8036864b18d1b1262648ec708724653a0738eea30d44cc47a,oKW2E4kqkfzyk4OGChCGMqz_Ds48#61333515#喜莲
5fac6b63a8d9010747e8fd0762b2fdfa4d9e1194fdaa2cd0843bd9ee75e73e4b,oKW2E4rcHeCGWX03QCZ_6fm8n0Ss#58568875#桐心
acd01834557b13957964bc4f7d2a7b6301772e86064aa9332c2a859860776e82,oKW2E4tZ90OjIah-dL022tISZY6Q#51206666#小黑1
47e3ab381ed489780bd95775e94ba84df63bd24c8c9baeeb868c3d08e888da43,oKW2E4leoSbqQgVfvOxe2C2E9umg#61003023#小黑2
'''
#本地测试用 
def main():  # 这个没有问题
    var_name = 'bslyck'
    tokens = get_env_variable(var_name)
    if not tokens:
        print(f'环境变量{var_name}未设置，请检查。')
        return

    total_accounts = len(tokens)
    team_counts = {}  # 存储每个账号的团队数量
    accounts_with_teams = []  # 存储团队数量大于0的账号

    # 首先遍历所有账号执行抽奖逻辑和获取团队数量
    for i in range(total_accounts):
        parts = tokens[i].split('#')
        account_token = parts[0]
        dc_iid = parts[1]
        account_no = parts[2]  # 提取账号名称

        # 抽奖逻辑
        print(f'------账号 {i+1}/{total_accounts} {account_no} 抽奖-------')
        cj(account_token)

        # 获取团队数量
        team_info = zd_jh(account_token)
        print(f"账号 {account_no} 的组队信息: {team_info}")  # 调试打印

        if team_info and 'teamCount' in team_info:
            team_count = team_info['teamCount']
            team_counts[account_no] = team_count
            if team_count > 0:
                accounts_with_teams.append(account_no)  # 仅存储团队数量大于0的账号

        print(f"当前账号 {account_no} 处理后的可以组队id: {accounts_with_teams}")  # 调试打印
    print("\n所有账号的抽奖和团队数量检查完成，开始组队操作")

    # 组队操作
    print("开始组队操作")
    for account_no in accounts_with_teams:  # 队长按顺序进行
        i = [i for i, part in enumerate(tokens) if part.split('#')[2] == account_no][0]
        parts = tokens[i].split('#')
        account_token = parts[0]
        dc_iid = parts[1]

        print(f'------账号 {i+1}/{total_accounts} {account_no}组长{dc_iid} 开始组队-------')
        other_accounts = [t.split('#')[2] for t in tokens if t.split('#')[2] != account_no]

        # 尝试与排序后的其他账号组队
        for zd_account_no in other_accounts:
            if zd_account_no in accounts_with_teams:
                result = post_join_team(dc_iid, [part for part in tokens if part.split('#')[2] == zd_account_no][0].split('#')[0], zd_account_no)
                if result == "exit_team":  # 如果有组队奖品，可以退出组队
                    break  # 退出当前组队循环
                elif result == "yddm":
                    accounts_with_teams.remove(zd_account_no)  # 移除已用完次数的账号
                elif result is False:
                    break  # 如果组长没有次数，终止循环

    print("所有账号的组队操作完成")

    for i in range(total_accounts):
        parts = tokens[i].split('#')
        account_token = parts[0]
        account_no = parts[2]

        # 查看奖品
        print(f'------账号 {i+1}/{total_accounts} {account_no} 查看奖品-------')
        cj_cash = cj_prizes(account_token, 1)
        zd_cash = zd_prize(account_token)
        print(f"账号 {account_no} 抽奖{round(cj_cash, 2)}元 组队{round(zd_cash, 2)}元 总计：{round(cj_cash + zd_cash, 2)}元")

if __name__ == "__main__":
    main()
'''
def main():  #这个没有问题
    var_name = 'bslycj'
    tokens = get_env_variable(var_name)
    if not tokens:
        print(f'环境变量{var_name}未设置，请检查。')
        return

    total_accounts = len(tokens)
    team_counts = {}  # 存储每个账号的团队数量
    accounts_with_teams = []  # 存储团队数量大于0的账号

    # 首先遍历所有账号执行抽奖逻辑和获取团队数量
    for i in range(total_accounts):
        parts = tokens[i].split('#')
        account_token = parts[0]
        dc_iid = parts[1]
        account_no = parts[2]  # 提取账号名称

        # 抽奖逻辑
        print(f'------账号 {i+1}/{total_accounts} {account_no} 抽奖-------')
        add_tmrw(account_token)
        cj(account_token)

        # 获取团队数量
        # 获取团队数量
        team_info = zd_jh(account_token)
        print(f"账号 {account_no} 的组队信息: {team_info}")  # 调试打印

        if team_info and 'teamCount' in team_info:
            team_count = team_info['teamCount']
            team_counts[account_no] = team_count
            if team_count > 0:
            #if team_count > -1:
                accounts_with_teams.append(account_no)  # 仅存储团队数量大于0的账号

        print(f"当前账号 {account_no} 处理后的 可以组队id: {accounts_with_teams}")  # 调试打印
    print()
    print()
    print()
    print("所有账号的抽奖和团队数量检查完成，开始组队操作")


    # 组队操作
    print("开始组队操作")

    for account_no in accounts_with_teams:  # 队长按顺序进行
        i = [i for i, part in enumerate(tokens) if part.split('#')[2] == account_no][0]
        parts = tokens[i].split('#')
        account_token = parts[0]
        dc_iid = parts[1]

        print(f'------账号 {i+1}/{total_accounts} {account_no}组长{dc_iid} 开始组队-------')

        # 创建除了当前队长之外的账号列表
        other_accounts = [t.split('#')[2] for t in tokens if t.split('#')[2] != account_no]
        
        # 根据 dhzdsx 的值决定队友选择方式
        if dhzdsx == 1:
            random.shuffle(other_accounts)  # 如果 dhzdsx 为 1，随机排序队友

        # 尝试与排序后的其他账号组队

        for zd_account_no in other_accounts:
            if zd_account_no in accounts_with_teams:
                # 尝试组队
                result = post_join_team(dc_iid, [part for part in tokens if part.split('#')[2] == zd_account_no][0].split('#')[0], zd_account_no)
                if result is False:
                    break  # 如果返回 False，终止循环
    print("所有账号的组队操作完成")

    for i in range(total_accounts):
        parts = tokens[i].split('#')
        account_token = parts[0]
        account_no = parts[2]

        # 查看奖品
        print()
        print(f'------账号 {i+1}/{total_accounts} {account_no} 查看奖品-------')
        cj_cash = cj_prizes(account_token, 1)
        zd_cash = zd_prize(account_token)

        #print(f"账号 {account_no} 抽奖现金红包金额：{cj_cash}元")
        #print(f"账号 {account_no} 组队现金红包金额：{zd_cash}元")
        #print(f"账号 {account_no} 总计现金红包金额：{cj_cash + zd_cash}元")
        print(f"账号 {account_no} 抽奖{round(cj_cash, 2)}元 组队{round(zd_cash, 2)}元 总计：{round(cj_cash + zd_cash, 2)}元")


if __name__ == "__main__":
    main()






def main():  #固定组队
    var_name = 'cscs'
    tokens = get_env_variable(var_name)
    if not tokens:
        print(f'环境变量{var_name}未设置，请检查。')
        return

    total_accounts = len(tokens)
    team_counts = {}  # 存储每个账号的团队数量
    accounts_with_teams = []  # 存储团队数量大于0的账号

    # 首先遍历所有账号执行抽奖逻辑和获取团队数量
    for i in range(total_accounts):
        parts = tokens[i].split('#')
        account_token = parts[0]
        dc_iid = parts[1]
        account_no = parts[2]  # 提取账号名称

        # 抽奖逻辑
        print(f'------账号 {i+1}/{total_accounts} {account_no} 抽奖-------')
        add_tmrw(account_token)
        cj(account_token)

        # 获取团队数量
        # 获取团队数量
        team_info = zd_jh(account_token)
        #print(f"账号 {account_no} 的组队信息: {team_info}")  # 调试打印

        if team_info and 'teamCount' in team_info:
            team_count = team_info['teamCount']
            team_counts[account_no] = team_count
            if team_count > 0:
                accounts_with_teams.append(account_no)  # 仅存储团队数量大于0的账号

        #print(f"当前账号 {account_no} 处理后的 可以组队id: {accounts_with_teams}")  # 调试打印
    print()
    print()
    print()
    print("所有账号的抽奖和团队数量检查完成，开始组队操作")


    # 组队操作
    print("开始组队操作")
    random.shuffle(accounts_with_teams)  # 打乱账号顺序
    for account_no in accounts_with_teams:
        i = [i for i, part in enumerate(tokens) if part.split('#')[2] == account_no][0]
        parts = tokens[i].split('#')
        account_token = parts[0]
        dc_iid = parts[1]

        print(f'------账号 {i+1}/{total_accounts} {account_no}组长{dc_iid} 开始组队-------')
        for j in range(total_accounts):
            if tokens[j].split('#')[2] != account_no and tokens[j].split('#')[2] in accounts_with_teams:
                zd_token = tokens[j].split('#')[0]
                zd_account_no = tokens[j].split('#')[2]
                post_join_team(dc_iid, zd_token, zd_account_no)

    print("所有账号的组队操作完成")

    for i in range(total_accounts):
        parts = tokens[i].split('#')
        account_token = parts[0]
        account_no = parts[2]

        # 查看奖品
        print()
        print(f'------账号 {i+1}/{total_accounts} {account_no} 查看奖品-------')
        cj_cash = cj_prizes(account_token, 1)
        zd_cash = zd_prize(account_token)

        #print(f"账号 {account_no} 抽奖现金红包金额：{cj_cash}元")
        #print(f"账号 {account_no} 组队现金红包金额：{zd_cash}元")
        #print(f"账号 {account_no} 总计现金红包金额：{cj_cash + zd_cash}元")
        print(f"账号 {account_no} 抽奖{round(cj_cash, 2)}元 组队{round(zd_cash, 2)}元 总计：{round(cj_cash + zd_cash, 2)}元")


if __name__ == "__main__":
    main()


'''    