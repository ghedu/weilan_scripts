# Author: lindaye
# Update:2023-11-26
# 文博大会答题
# 活动入口：TG内部群
# 添加账号说明(青龙/本地)二选一
#   青龙: 青龙变量wbtoken 值{"ck":"xxxxtokenxxxx","uuid":"xxx","sign":"xxx"} 一行一个(回车分割)
#   本地: 脚本内置ck方法ck_token = [{"ck":"xxxxtokenxxxx","uuid":"xxx","sign":"xxx"},{"ck":"xxxxtokenxxxx","uuid":"xxx","sign":"xxx"}]
# 软件版本
version ="0.0.1"#line:1
name ="文博大会答题"#line:2
linxi_token ="wbtoken"#line:3
linxi_tips ='{"ck":"xxxxtokenxxxx","uuid":"xxx","sign":"xxx"}'#line:4
import requests #line:5
import json #line:6
import os #line:7
import re #line:8
import time #line:9
from random import randint ,choice #line:10
from multiprocessing import Pool #line:11
Btype ="青龙"#line:14
domain ='https://wbdh.jiiimo.cn/api'#line:16
turl ="http://wbdt.lieren.link"#line:17
ss =requests .session ()#line:19
headers ={'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.39 (0x18002733) NetType/WIFI Language/zh_CN','Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}#line:23
def user_info (OO00OO0OOO0O00OO0 ,OOO00OOOO0OOO0000 ):#line:25
    headers ['token']=OOO00OOOO0OOO0000 ['ck']#line:26
    OOO0OO0000000O0OO =ss .post (domain +"/user/info",headers =headers ,data ={"uuid":OOO00OOOO0OOO0000 ['uuid'],"sign":OOO00OOOO0OOO0000 ['sign']}).json ()#line:27
    if OOO0OO0000000O0OO ['code']==0 :#line:28
        print (f"账号【{OO00OO0OOO0O00OO0+1}】用户:{OOO0OO0000000O0OO['data']['nickname']} 余额:{OOO0OO0000000O0OO['data']['balance']}元 积分:{OOO0OO0000000O0OO['data']['point']} 签到:{OOO0OO0000000O0OO['data']['days']}天")#line:29
    else :#line:30
        print (f"账号【{OO00OO0OOO0O00OO0+1}】请检查你的CK是否正确!")#line:31
def do_read (O000OOO00O00O00OO ,O000O0OOO0OOO0O0O ):#line:35
    headers ['token']=O000O0OOO0OOO0O0O ['ck']#line:36
    OOOO000OOO0O0O00O =ss .post (domain +"/home/checkin",headers =headers ,data ={"uuid":O000O0OOO0OOO0O0O ['uuid'],"sign":O000O0OOO0OOO0O0O ['sign']}).json ()#line:37
    if OOOO000OOO0O0O00O ['code']==0 :#line:38
        print (f"账号【{O000OOO00O00O00OO+1}】今日签到: {OOOO000OOO0O0O00O}")#line:39
    else :#line:40
        print (f"账号【{O000OOO00O00O00OO+1}】今日签到: {OOOO000OOO0O0O00O['msg']}")#line:41
    OOOO000OOO0O0O00O =ss .post (domain +"/home/question",headers =headers ,data ={"uuid":O000O0OOO0OOO0O0O ['uuid'],"sign":O000O0OOO0OOO0O0O ['sign']}).json ()#line:42
    if OOOO000OOO0O0O00O ['code']==0 :#line:43
        O0O00OOOO000O0OOO =OOOO000OOO0O0O00O ['data']['id']#line:44
        OOOO000000O0OO0OO =OOOO000OOO0O0O00O ['data']['mid']#line:45
        while True :#line:46
            OOOO000OOO0O0O00O =ss .post (domain +"/question/get",headers =headers ,data ={"qid":O0O00OOOO000O0OOO ,"mid":OOOO000000O0OO0OO ,"uuid":O000O0OOO0OOO0O0O ['uuid'],"sign":O000O0OOO0OOO0O0O ['sign']}).json ()#line:47
            O0O00OOOO000O0OOO =""#line:48
            if OOOO000OOO0O0O00O ['code']==0 :#line:49
                O0OOO0OOOOOO00O00 =OOOO000OOO0O0O00O ['data']['title']#line:50
                O0000O0000OO0OOO0 =OOOO000OOO0O0O00O ['data']['options']#line:51
                print (f"账号【{O000OOO00O00O00OO+1}】获取题目成功[{OOOO000OOO0O0O00O['data']['number']}/{OOOO000OOO0O0O00O['data']['totalNumber']}]: 题目:{O0OOO0OOOOOO00O00}\n答案:{O0000O0000OO0OOO0}")#line:52
                OO0OO00OO0O00O00O =OOOO000OOO0O0O00O ['data']['id']#line:53
                O00000OO0OOOO0OO0 =OOOO000OOO0O0O00O ['data']['wyy']#line:54
                OO0000OO00OOOO0OO =OOOO000OOO0O0O00O ['data']['wyy_point']#line:55
                OO0000OOOO000OO0O =["A","B","C"]#line:56
                OO0O000OOOO0O0O0O =search (O0OOO0OOOOOO00O00 ,O0000O0000OO0OOO0 )#line:57
                if OO0O000OOOO0O0O0O ==4 :#line:58
                    OOO000OO0O00OOO00 =choice (OO0000OOOO000OO0O )#line:59
                else :#line:60
                    OOO000OO0O00OOO00 =OO0000OOOO000OO0O [OO0O000OOOO0O0O0O ]#line:61
                OOOO000OOO0O0O00O =ss .post (domain +"/question/post",headers =headers ,data ={"id":OO0OO00OO0O00O00O ,"select":OOO000OO0O00OOO00 ,"wyy":O00000OO0OOOO0OO0 ,"wyy_point":OO0000OO00OOOO0OO ,"uuid":O000O0OOO0OOO0O0O ['uuid'],"sign":O000O0OOO0OOO0O0O ['sign']}).json ()#line:62
                if OOOO000OOO0O0O00O ['code']==0 :#line:63
                    if OO0O000OOOO0O0O0O ==4 :#line:64
                        upload (O0OOO0OOOOOO00O00 ,O0000O0000OO0OOO0 [OOO000OO0O00OOO00 ],False )#line:65
                    if OOO000OO0O00OOO00 ==list (OOOO000OOO0O0O00O ['data']['answer'].keys ())[0 ]:#line:66
                        print (f"账号【{O000OOO00O00O00OO+1}】回答正确,答案为: {O0000O0000OO0OOO0[OOO000OO0O00OOO00]}")#line:67
                    else :#line:68
                        print (f"账号【{O000OOO00O00O00OO+1}】回答错误,答案为: {O0000O0000OO0OOO0[OOO000OO0O00OOO00]}")#line:69
                        if OO0O000OOOO0O0O0O !=4 :#line:70
                            upload (O0OOO0OOOOOO00O00 ,O0000O0000OO0OOO0 [OOO000OO0O00OOO00 ],True )#line:71
                    time .sleep (2 )#line:72
                else :#line:73
                    print (f"账号【{O000OOO00O00O00OO+1}】回答异常: {OOOO000OOO0O0O00O}")#line:74
                    break #line:75
            else :#line:76
                print (f"账号【{O000OOO00O00O00OO+1}】获取题目失败: {OOOO000OOO0O0O00O['msg']}")#line:77
                break #line:78
    else :#line:79
        print (f"账号【{O000OOO00O00O00OO+1}】获取首页题目失败: {OOOO000OOO0O0O00O}")#line:80
def search (OO000OO0000OO0000 ,OOOOO0OO000000000 ):#line:82
    for OOOO00O0O0OO00OO0 in range (4 ):#line:83
        try :#line:84
            O0OO0O0O0OOO0O0O0 =ss .get (turl +"/search?question="+OO000OO0000OO0000 ).json ()#line:85
            if O0OO0O0O0OOO0O0O0 ["status"]=='200':#line:86
                try :#line:87
                    return OOOOO0OO000000000 .index (O0OO0O0O0OOO0O0O0 ["content"])#line:88
                except :#line:89
                    return randint (0 ,2 )#line:90
            else :#line:91
                return 4 #line:92
        except :#line:93
            print (f"[题库服务器异常]: 搜索题目失败，即将自动尝试当前{OOOO00O0O0OO00OO0+1}次!")#line:94
            time .sleep (1 )#line:95
    return 4 #line:96
def upload (O0000OOO000OOOOO0 ,OO0O00OOO00OO000O ,O0OOOOOO0O00000O0 ):#line:98
    for OOOO000OOOOOO0000 in range (4 ):#line:99
        try :#line:100
            if O0OOOOOO0O00000O0 :#line:101
                O0000OOOO0OO000OO =ss .get (turl +"/upload?question="+O0000OOO000OOOOO0 +f"&answer={OO0O00OOO00OO000O}&update={O0OOOOOO0O00000O0}").json ()#line:102
                print (f"上传题库服务器(更新答案):{O0000OOOO0OO000OO['msg']}")#line:103
            else :#line:104
                O0000OOOO0OO000OO =ss .get (turl +"/upload?question="+O0000OOO000OOOOO0 +f"&answer={OO0O00OOO00OO000O}").json ()#line:105
                print (f"上传题库服务器(新增题目):{O0000OOOO0OO000OO['msg']}")#line:106
            return True #line:107
        except :#line:108
            print (f"[上传题库服务器异常]: 上传题目或题目更新失败，即将自动尝试当前{OOOO000OOOOOO0000+1}次!")#line:109
            time .sleep (1 )#line:110
    return False #line:111
if __name__ =="__main__":#line:113
    print (f"""██╗     ██╗███╗   ██╗██╗  ██╗██╗      ██████╗ ███████╗███╗   ███╗ ██████╗ 
██║     ██║████╗  ██║╚██╗██╔╝██║      ██╔══██╗██╔════╝████╗ ████║██╔═══██╗
██║     ██║██╔██╗ ██║ ╚███╔╝ ██║█████╗██║  ██║█████╗  ██╔████╔██║██║   ██║
██║     ██║██║╚██╗██║ ██╔██╗ ██║╚════╝██║  ██║██╔══╝  ██║╚██╔╝██║██║   ██║
███████╗██║██║ ╚████║██╔╝ ██╗██║      ██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝
╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ 
    项目:{name}           BY-林夕          Verion: {version}(并发)
    Github仓库地址: https://github.com/linxi-520/LinxiPush
""")#line:122
    if Btype =="青龙":#line:123
        if os .getenv (linxi_token )==None :#line:124
            print (f'青龙变量异常: 请添加{linxi_token}变量示例:{linxi_tips} 确保一行一个')#line:125
            exit ()#line:126
        ck_token =[json .loads (OO00O0OOOOO000O00 )if "&"in O00OOOOOO00O0OO0O else json .loads (O00OOOOOO00O0OO0O )for O00OOOOOO00O0OO0O in os .getenv (linxi_token ).splitlines ()for OO00O0OOOOO000O00 in re .findall (r'{.*?}',O00OOOOOO00O0OO0O )]#line:129
    else :#line:130
        ck_token =[]#line:134
        if ck_token ==[]:#line:135
            print (f'本地变量异常: 请添加本地ck_token示例:{linxi_tips}')#line:136
    with Pool ()as pool :#line:139
        print ("==================获取账号信息=================")#line:141
        pool .starmap (user_info ,list (enumerate (ck_token )))#line:142
        print ("==================开始执行任务=================")#line:143
        pool .starmap (do_read ,list (enumerate (ck_token )))#line:144
        print ("==================获取账号信息=================")#line:145
        pool .starmap (user_info ,list (enumerate (ck_token )))#line:146
        pool .close ()#line:150
        pool .join ()#line:152
        ss .close #line:155
        print (f"================[{name}V{version}]===============") 