"""app.py"""
import base64

from flask import Flask, render_template, send_from_directory, request, jsonify, Response
import json
from random import sample
from typing import Tuple, List, Dict
# 在 app.py 中
from static.py.gmt_parse import parse_geometry_file as parse_gmt_file
from static.py.ggb_parse import bytes_parse, zip_parse, xml_parse


# 1. 创建 Flask 实例（可选：自定义静态/模板文件夹路径）
# 如果你的文件夹不叫 static/templates，用下面这行配置：
# app = Flask(__name__, static_folder="static", template_folder="templates")
app = Flask(__name__)  # 默认用 static/templates 文件夹


# 2. 编写路由：映射 URL 到 HTML 模板
@app.route("/")  # 根 URL → 首页
def home():
    return render_template("index.html")  # 渲染 templates/index.html

@app.route("/play")  # 游玩页
def play():
    return render_template("play.html")


@app.route('/file_load', methods = ['POST'])
def file_load():
    '''文件上传'''
    try:
        data = 'text'
        uploaded_file = request.files.get('userFile', '')
        fileType = request.values.get('fileType', '')
    
        if uploaded_file:
            if fileType == 'gmt':
                read_file = uploaded_file.read().decode('utf-8')
                data = parse_gmt_file(read_file)
            elif fileType == 'ggb':
                read_file = uploaded_file.read()
                zip_file = bytes_parse(read_file)
                ggb_main_bytes = zip_parse(zip_file, 'geogebra.xml')
                thumbnail_bytes = zip_parse(zip_file, 'geogebra_thumbnail.png')
                figure_data = xml_parse(ggb_main_bytes)
                thumbnail = base64.b64encode(thumbnail_bytes).decode('utf-8')
                data = {'figure_data': figure_data, 'thumbnail': thumbnail}

        flag_data = [True, data]
        return jsonify(flag_data)
    except Exception as e:
        flag_data = [False, str(e)]
        return jsonify(flag_data)


# 5. 运行应用（调试模式仅用于开发）
if __name__ == "__main__":
    app.run()