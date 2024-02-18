'''
安卓抓包，苹果闪退
貌似人脸实名才能抽奖
'''
# !/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import requests
import random
import string
import time


# 多号用@，格式：token#备注@token#备注
token_all = '45ddafc4a088a8969afb8ec6a11ff955#蔚蓝'


api_url = 'https://app.eyh.cn/gateway/api'

def random_comment():
    try:
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Origin': 'http://8.134.161.222:3002',
            'Pragma': 'no-cache',
            'Referer': 'http://8.134.161.222:3002/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        }

        json_data = {
            'prompt': '给一句励志的话',
            'options': {},
            'systemMessage': "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
            'temperature': 0.8,
            'top_p': 1,
        }
        response = requests.post('http://8.134.161.222:3002/api/chat-process', headers=headers, json=json_data, verify=False).text
        comment = json.loads(response.split('\n')[-1])
        return comment['text']
    except:
        print('gpt生成评论失败，不进行评论')


def generate_random_id():
    random_chars = ''.join(random.choices(string.ascii_uppercase, k=6))
    current_time_millis = int(time.time() * 1000)
    unique_id = random_chars + str(current_time_millis)
    return unique_id

def get_task_list():
    data = {
        "service": "media",
        "api": "spreadActivity/getAppUserSpreadActivity",
        "data": {"content": "null"},
        "userDevice": {
            "os": "9",
            "deviceBrand": "Xiaomi",
            "deviceId": "539d3978e1ece976",
            "equipmentId": "539d3978e1ece976",
            "deviceType": "Xiaomi MI 6",
            "device": "android",
            "clientVersion": "5.0.1"
        },
        "traceId": f"{generate_random_id()}",
        "token": f"{token}"
    }
    headers = {
        "Accept": "application/json",
        "Accept-Language": "zh-cn",
        "Connection": "Keep-Alive",
        "Content-Length": str(len(json.dumps(data))),
        "Content-Type": "application/json; Charset=UTF-8",
        "Host": "app.eyh.cn",
        "Referer": "https://app.eyh.cn/gateway/api",
        "User-Agent": "okhttp/5.0.0-alpha.2"
    }
    response = requests.post(url=api_url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        response_data = response.json()
        try:
            task_list = [task['articleId'] for task in response_data['data']['spreadArticleVoList']]
            return task_list
        except:
            print(response_data)
    else:
        print(response.text)

def complete_comment_task():
    data = {
        "service": "media",
        "api": "article/saveComment",
        "data": {
            "articleId": int(article_id),
            "content": f"{random_comment()}",
            "isSpreadActivity": "1"
        },
        "userDevice": {
            "os": "9",
            "deviceBrand": "Xiaomi",
            "deviceId": "539d3978e1ece976",
            "equipmentId": "539d3978e1ece976",
            "deviceType": "Xiaomi MI 6",
            "device": "android",
            "clientVersion": "5.0.1"
        },
        "traceId": f"{generate_random_id()}",
        "token": f"{token}"
    }
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": str(len(json.dumps(data))),
        "Host": "app.eyh.cn",
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip",
        "User-Agent": "okhttp/5.0.0-alpha.2"
    }
    response = requests.post(url=api_url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        print("评论完成")

def complete_like_task():
    data = {
        "service": "media",
        "api": "article/savePraiseLog",
        "data": {
            "articleId": int(article_id),
            "isSpreadActivity": "1",
            "content": "null"
        },
        "userDevice": {
            "os": "9",
            "deviceBrand": "Xiaomi",
            "deviceId": "539d3978e1ece976",
            "equipmentId": "539d3978e1ece976",
            "deviceType": "Xiaomi MI 6",
            "device": "android",
            "clientVersion": "5.0.1"
        },
        "traceId": f"{generate_random_id()}",
        "token": f"{token}"
    }
    headers = {
        "Accept": "application/json",
        "Accept-Language": "zh-cn",
        "Connection": "Keep-Alive",
        "Content-Length": str(len(json.dumps(data))),
        "Content-Type": "application/json; Charset=UTF-8",
        "Host": "app.eyh.cn",
        "Referer": "https://app.eyh.cn/gateway"
    }
    response = requests.post(url=api_url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        print(response.json())

def complete_read_task():
    data = {
        "service": "media",
        "api": "column/readArticle",
        "data": {
            "articleId": int(article_id),
            "isSpreadActivity": "1",
            "content": "null"
        },
        "userDevice": {
            "os": "9",
            "deviceBrand": "Xiaomi",
            "deviceId": "539d3978e1ece976",
            "equipmentId": "539d3978e1ece976",
            "deviceType": "Xiaomi MI 6",
            "device": "android",
            "clientVersion": "5.0.1"
        },
        "traceId": f"{generate_random_id()}",
        "token": f"{token}"
    }
    headers = {
        "Accept": "application/json",
        "Connection": "Keep-Alive",
        "Content-Length": str(len(json.dumps(data))),
        "Content-Type": "application/json; Charset=UTF-8",
        "Host": "app.eyh.cn",
        "Referer": "https://app.eyh.cn/gateway/api",
        "User-Agent": "okhttp/5.0.0-alpha.2"
    }
    response = requests.post(url=api_url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        print(response.json())

def complete_share_task():
    data = {
        "service": "media",
        "api": "article/saveShareLog",
        "data": {
            "articleId": int(article_id),
            "isSpreadActivity": "1",
            "content": "null"
        },
        "userDevice": {
            "os": "9",
            "deviceBrand": "Xiaomi",
            "deviceId": "539d3978e1ece976",
            "equipmentId": "539d3978e1ece976",
            "deviceType": "Xiaomi MI 6",
            "device": "android",
            "clientVersion": "5.0.1"
        },
        "traceId": f"{generate_random_id()}",
        "token": f"{token}"
    }
    headers = {
        "Accept": "application/json",
        "Accept-Language": "zh-cn",
        "Connection": "Keep-Alive",
        "Content-Length": "372",
        "Content-Type": "application/json; Charset=UTF-8",
        "Host": "app.eyh.cn",
        "Referer": "https://app.eyh.cn/gateway/api",
        "User-Agent": "okhttp/5.0.0-alpha.2"
    }
    response = requests.post(url=api_url, headers=headers, data=json.dumps(data))
    if response.status_code == 200:
        print(response.json())

def lottery_draw():
    headers = {
        "Accept": "application/json",
        "Accept-Language": "zh-cn",
        "Connection": "Keep-Alive",
        "Content-Length": "380",
        "Content-Type": "application/json; Charset=UTF-8",
        "Host": "app.eyh.cn",
        "Referer": "https://app.eyh.cn/gateway/api",
        "User-Agent": "okhttp/5.0.0-alpha.2"
    }
    data = {
        "service": "media",
        "api": "lottery/lotteryActivityAward",
        "data": {
            "uid": "30a7f9016d224fc2a8367200cbbab62a",
            "content": "null"
        },
        "userDevice": {
            "os": "9",
            "deviceBrand": "Xiaomi",
            "deviceId": "539d3978e1ece976",
            "equipmentId": "539d3978e1ece976",
            "deviceType": "Xiaomi MI 6",
            "device": "android",
            "clientVersion": "5.0.1"
        },
        "traceId": f"{generate_random_id()}",
        "token": f"{token}"
    }
    for _ in range(3):
        print(f"第{_+1}次抽奖")
        response = requests.post(url=api_url, headers=headers, data=json.dumps(data))
        if response.status_code == 200:
            response_data = response.json()
            if '已用完' in response_data['message']:
                print(response_data)
                break
            else:
                try:
                    print(response_data['data']['description'])
                except:
                    print(response_data)
        time.sleep(random.randint(3, 5))
    print("抽奖结束")


if __name__ == "__main__":
    token_list = token_all.split('@')
    for token_bz in token_list:
        token, bz = token_bz.split('#')
        print(f'开始执行{bz}账号')
        try:
            article_ids = get_task_list()
            if article_ids:
                for article_id in article_ids:
                    print(f'{bz} 开始任务，文章id：', article_id)
                    complete_read_task()
                    time.sleep(random.randint(3, 5))
                    complete_like_task()
                    time.sleep(random.randint(3, 5))
                    complete_share_task()
                    time.sleep(random.randint(3, 5))
                    complete_comment_task()
                    time.sleep(random.randint(3, 5))

                print(f"{bz}任务完成，准备抽奖\n")
                lottery_draw()
                sleep_random = random.randint(10, 30)
                print(f"随机延迟:{sleep_random}秒，进行下一个账号")
                time.sleep(sleep_random)
            else:
                print('获取文章失败')
        except:
            print(f'{bz} 账号执行报错')
