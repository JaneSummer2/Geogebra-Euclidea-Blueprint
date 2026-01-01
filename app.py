"""app.py"""
from flask import Flask, render_template, send_from_directory, request, jsonify
import json
from random import sample
from typing import Tuple, List, Dict



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



# 5. 运行应用（调试模式仅用于开发）
if __name__ == "__main__":
    app.run()