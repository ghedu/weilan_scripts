import requests
import json
import urllib.parse
import time
import random

#微博抽奖 定时0 6 * * * by源空
#ID = "" # 脱非兔的文章id
#_id = "" #分组id
gsid = "_2A25IdTZPDeRxGeRM7VMZ-CvMwzmIHXVpI86HrDV6PUJbkdCOLWyskWpNU8NdtSQKD0_DR3TGeeWVDDm0IrOtoAvi" # 微博ck
_from = ""
c = ""
s = ""
ua = ""
#设置参数


# 获取第一篇文章id
def get_wb_ID():
	url = "https://api.weibo.cn/2/profile?uid=5767584759" #5472857989
	headers = {}
	res = requests.get(url, headers=headers)
	data = json.loads(res.text)['userInfo']['status']['idstr']
	return data

# 获取分组
def get_wb_list(_id):
    url = f"https://api.weibo.cn/2/groups/timeline?list_id={_id}&from={_from}&c={c}&s={s}&gsid={gsid}"
    headers = {}
    res = requests.get(url, headers=headers)
    return res.text

#通过文章id获取用户id
def get_wb_content_user(post_id):
    url = f"https://api.weibo.cn/2/comments/build_comments?id={post_id}&is_show_bulletin=2&from={_from}&c={c}&s={s}&gsid={gsid}"
    headers = {}
    res = requests.get(url, headers=headers)
    data = json.loads(res.text)['status']['user']['id']
    return data
    
# 获取文章内容链接文章id,并且点赞评论转发
def get_wb_content_id(post_id):
    url = f"https://api.weibo.cn/2/comments/build_comments?id={post_id}&is_show_bulletin=2&from={_from}&c={c}&s={s}&gsid={gsid}"
    headers = {}
    res = requests.get(url, headers=headers)
    data = json.loads(res.text)['status']['longText']['url_objects']
    i = 0
    k = 0
    print("微博抽奖开始")
    while 1:
        try:
            content = data[i]['info']['url_long']
            i = i + 1
            identifier = content.split('/')[-1]
            if "list" in identifier:
                pass
            else:
                # 点赞评论转发
                # print(identifier)
                #get_wb_dz(identifier)
                #time.sleep(5)
                #get_wb_comment(identifier)
                #time.sleep(5)
                num = random.randint(0, 100)
                if num > 50:
                    k = k + 1
                    uid = get_wb_content_user(identifier)
                    get_wb_gz(uid)
                    # get_wb_tolist(uid)
                    time.sleep(10)
                    get_wb_repost(identifier)
                    time.sleep(5)
        except :
            break
    print(f"一共有{i}个抽奖,随机选择{k}个抽奖")
    print("完成抽奖")
        
# 微博关注
def get_wb_gz(uid):
	url = f"https://api.weibo.cn/2/friendships/create?from={_from}&c={c}&s={s}&gsid={gsid}"
	payload = {"uid":f"{uid}","from":f"{_from}","c":f"{c}","s":f"{s}","ua":f"{ua}"}
	headers = {}
	res = requests.post(url, data=payload,headers=headers)
	if f"{uid}" in res.text:
		print("关注成功")
	else:
			print("关注失败")
			print (res.text)

# 微博关注进入分组
def get_wb_tolist(uid,_id):
	url = f"https://api.weibo.cn/2/groups/update_lists?from={_from}&c={c}&s={s}&gsid={gsid}"
	payload = {"uid":f"{uid}","add_list_ids":f"{_id}"}
	# 微博分组的id
	headers = {}
	response = requests.post(url, data=payload, headers=headers)
	
	
# 分组点赞
def get_wb_fzdz(_list):
    data = json.loads(_list)['statuses']
    i = 0
    k = 0
    while "id" in data[i]:
        if "liked" in data[i]:
            print("已点赞")
        else:
            get_wb_dz(data[i]["id"])
            if k < 5:
                # 评论未点赞的前五篇文章
                get_wb_comment(data[i]["id"])
                k = k + 1
        i = i + 1
        if i == 10:
            break
        time.sleep(2)
        # except IndexError:
    print(f"一共找到{i}篇文章,成功点赞{k}篇文章")


# 点赞文章
def get_wb_dz(post_id):
    url = "https://api.weibo.cn/2/like/set_like"
    payload = f"id={post_id}&s=cccccccc&c=weicoabroad&gsid={gsid}&from=1299295010"
    # 将字符串转换为字典
    params = urllib.parse.parse_qs(payload)
    params = {k: v[0] for k, v in params.items()}
    # 将字典转换为JSON
    json_data = json.dumps(params)
    data = json.loads(json_data)
    headers = {}
    res = requests.post(url, data=data, headers=headers)
    if "操作频繁" in res.text:
        print(res.text)
    else:
        print("点赞成功")


# 评论文章
def get_wb_comment(post_id):
    url = "https://api.weibo.cn/2/comments/create"
    payload = f"comment=wow&id={post_id}&s=cccccccc&c=weicoabroad&gsid={gsid}&from=1299295010"
    params = urllib.parse.parse_qs(payload)
    params = {k: v[0] for k, v in params.items()}
    json_data = json.dumps(params)
    data = json.loads(json_data)
    headers = {}
    res = requests.post(url, data=data, headers=headers)
    if "wow" in res.text:
        print("评论成功")
    else:
        print(res.text)


# 转评文章
def get_wb_repost(post_id):
    url = "https://api.weibo.cn/2/statuses/repost"
    files = [
        ('id', (None, f'{post_id}')),
        ('status', (None, 'wow')),
        ('s', (None, f'{s}')),
        ('c', (None, f'{c}')),
        ('gsid', (None, f'{gsid}')),
        ('from', (None, f'{_from}'))
    ]
    headers = {}
    res = requests.post(url, files=files, headers=headers)
    if "wow" in res.text:
        print("转发成功")
    else:
    	print("转发失败")


# _list = get_wb_list()
# get_wb_fzdz(_list)
get_wb_content_id(get_wb_ID())
