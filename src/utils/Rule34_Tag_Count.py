import requests
from xml.etree import ElementTree
import re

# 在這裡貼上你的 tag，每行一個（可有中文、數字、tab、空格都沒關係）
TAGS_RAW = """
sprite（通常指低分辨率的或像素的）游戲畫面
gaping 泛指（因性行為導致的）子宮脫垂、陰道擴張、脫肛、肛裂等現象（見prolapse）
ghost 幽靈；鬼魂
glasses	眼鏡
glory hole	光榮洞；（透過）牆洞（性交）
goblin 哥布林
group 亂交；群體性交
hardcore 明確性交描寫；明確性交展示
harem 一人被三人或以上求愛而發生的多方自願的群體性交
""" # ← 這裡可以貼很多行

def extract_tags_from_text(text):
    tags = []
    for line in text.strip().splitlines():
        if not line.strip():
            continue
        # 取每行開頭的英文（允許空格），遇到 tab、中文、標點才斷開
        m = re.match(r"([a-zA-Z0-9_ -]+)", line)
        if m:
            tag = m.group(1).strip().replace(" ", "_")
            if tag and not tag.startswith("-"):
                tags.append(tag)
    return tags

def get_rule34_count(tag):
    url = f"https://api.rule34.xxx/index.php?page=dapi&s=tag&q=index&name={tag}"
    try:
        resp = requests.get(url, timeout=10)
        root = ElementTree.fromstring(resp.content)
        if len(root) > 0:
            return root[0].attrib.get('count', '0')
        elif root.tag == "tags" and "count" in root.attrib:
            return root.attrib["count"]
        else:
            return '0'
    except Exception as e:
        return 'not found'

if __name__ == "__main__":
    tags = extract_tags_from_text(TAGS_RAW)
    print("tag\tcount")
    for tag in tags:
        count = get_rule34_count(tag)
        print(f"{tag}\t{count}")