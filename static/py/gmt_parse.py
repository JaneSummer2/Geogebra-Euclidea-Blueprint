from lark import Lark, Transformer, v_args
import json

# 定义语法规则
geometry_grammar = """
    start: (statement | comment)*

    statement: assignment
             | initial_statement
             | movepoints_statement
             | result_statement
             | explore_statement
             | rules_statement
             | named_statement
             | hidden_statement

    assignment: NAME "=" geometry_object

    geometry_object: point
                   | segment
                   | ray
                   | line
                   | circle
                   | circle3
                   | intersect
                   | compass
                   | abisect
                   | perp
                   | pbisect
                   | parallel
                   | linepoint
                   | midpoint

    point: "[" NUMBER "," NUMBER "]"
    segment: "Segment" "[" NAME "," NAME "]"
    ray: "Ray" "[" NAME "," NAME "]"
    line: "Line" "[" NAME "," NAME "]"
    circle: "Circle" "[" NAME "," NAME "]"
    circle3: "Circle3" "[" NAME "," NAME "," NAME "]"
    intersect: "Intersect" "[" NAME "," NAME "," FLAGNUMBER ("," NAME)? "]"
    compass: "Compass" "[" NAME "," NAME "," NAME "]"
    abisect: "ABisect" "[" NAME "," NAME "," NAME "]"
    perp: "Perp" "[" NAME "," NAME "]"
    pbisect: "PBisect" "[" NAME "," NAME "]"
    parallel: "Parallel" "[" NAME "," NAME "]"
    linepoint: "Linepoint" "[" NAME "," NUMBER "]"
    midpoint: "Midpoint" "[" NAME "," NAME "]"

    initial_statement: "initial" "=" name_list
    movepoints_statement: "movepoints" "=" name_list
    result_statement: "result" "=" name_list (":" name_list)?
    explore_statement: "explore" "=" name_list
    rules_statement: "rules" "=" rules_expression
    named_statement: "named" "=" named_list
    hidden_statement: "hidden" "=" name_list

    name_list: NAME ("," NAME)*
    named_list: named ("," named)*
    named: NAME ("." NAME)?
    rules_expression: rules_item ("," rules_item)*
    rules_item: intersection_condition
        | distance_condition
        | angle_condition
    intersection_condition: NAME OPERATE NAME
    distance_condition: distance_names OPERATE distance_names
    angle_condition: angle_names OPERATE NUMBER
        | NUMBER OPERATE angle_names
    distance_names: NAME "." NAME
    angle_names: NAME "." NAME "." NAME

    comment: /#.*/

    NAME: /[A-Za-z][A-Za-z0-9_]*/
    NUMBER: /-?\d+(\.\d+)?/
    FLAGNUMBER: NUMBER
        | /-/
    OPERATE: /[#<>\/]/

    %import common.WS
    %ignore WS
"""

class GeometryTransformer(Transformer):
    def geometry_object(self, items):
        """转换geometry_object规则 - 这是关键缺失的方法"""
        # geometry_object只有一个子项（point, segment, ray等）
        if len(items) == 1:
            return items[0]
        return items
    
    def statement(self, items):
        """转换statement规则 - 这也是必需的"""
        # statement只有一个子项（assignment, initial_statement等）
        if len(items) == 1:
            return items[0]
        return items
    
    def start(self, items):
        return {"statements": [item for item in items if item is not None]}
    
    def comment(self, items):
        return None  # 忽略注释
    
    @v_args(inline=True)
    def assignment(self, name, value):
        return {"type": "assignment", "name": str(name), "value": value}
    
    def point(self, items):
        x, y = items
        return {"type": "point", "x": float(x), "y": float(y)}
    
    @v_args(inline=True)
    def segment(self, p1, p2):
        return {"type": "segment", "points": [str(p1), str(p2)]}
    
    @v_args(inline=True)
    def ray(self, p1, p2):
        return {"type": "ray", "points": [str(p1), str(p2)]}
    
    @v_args(inline=True)
    def line(self, p1, p2):
        return {"type": "line", "points": [str(p1), str(p2)]}
    
    def circle(self, items):
        if len(items) == 1:
            return {"type": "circle", "center": str(items[0])}
        else:
            return {"type": "circle", "center": str(items[0]), "point": str(items[1])}
    
    @v_args(inline=True)
    def circle3(self, p1, p2, p3):
        return {"type": "circle3", "points": [str(p1), str(p2), str(p3)]}
    
    def intersect(self, items):
        result = {"type": "intersect", "objects": [str(items[0]), str(items[1])]}
        if len(items) > 2:
            result["index"] = str(items[2])
        if len(items) > 3:
            result["exclude"] = str(items[3])
        return result
    
    @v_args(inline=True)
    def compass(self, p1, p2, p3):
        return {"type": "compass", "points": [str(p1), str(p2), str(p3)]}
    
    @v_args(inline=True)
    def abisect(self, p1, p2, p3):
        return {"type": "angle_bisector", "points": [str(p1), str(p2), str(p3)]}
    
    @v_args(inline=True)
    def perp(self, p, obj):
        return {"type": "perpendicular", "point": str(p), "object": str(obj)}
    
    @v_args(inline=True)
    def pbisect(self, p1, p2):
        return {"type": "perpendicular_bisector", "points": [str(p1), str(p2)]}
    
    @v_args(inline=True)
    def parallel(self, p, obj):
        return {"type": "parallel", "point": str(p), "object": str(obj)}
    
    @v_args(inline=True)
    def linepoint(self, obj, ratio):
        return {"type": "line_point", "object": str(obj), "ratio": float(ratio)}
    
    @v_args(inline=True)
    def midpoint(self, p1, p2):
        return {"type": "midpoint", "object": str(p1), "ratio": str(p2)}
    
    def initial_statement(self, items):
        return {"type": "initial", "objects": items[0]}
    
    def movepoints_statement(self, items):
        return {"type": "movepoints", "points": items[0]}
    
    def result_statement(self, items):
        if len(items) == 2:
            return {"type": "result", "result": items[0], "display": items[1]}
        else:
            return {"type": "result", "result": items[0]}
    
    def explore_statement(self, items):
        return {"type": "explore", "objects": items[0]}
    
    def rules_statement(self, items):
        return {"type": "rules", "expressions": items[0]}
    
    def named_statement(self, items):
        return {"type": "named", "objects": items[0]}
    
    def hidden_statement(self, items):
        return {"type": "hidden", "objects": items[0]}
    
    def result_item(self, items):
        if len(items) == 2:
            return {"object": str(items[0]), "items": items[1]}
        else:
            return {"items": items[0]}
    
    def rules_expression(self, items):
        return items
    
    def rules_item(self, items):
        return {'front': items[0][0], 
                'condition': str(items[0][1]), 
                'back': items[0][2]}
    
    def intersection_condition(self, items):
        return items
    
    def distance_condition(self, items):
        return items
    
    def angle_condition(self, items):
        return items
    
    def distance_names(self, items):
        return {'type': 'distance', 'points': items}
    
    def angle_names(self, items):
        return {'type': 'angle', 'points': items}

    def name_list(self, items):
        return [str(item) for item in items]
    
    def named_list(self, items):
        return items
    
    def named(self, token):
        if len(token) == 1: return {"name_front": token[0], "name_back": token[0]}
        else: return {"name_front": token[0], "name_back": token[1]}
    
    def NAME(self, token):
        return str(token)
    
    def NUMBER(self, token):
        return float(token) if '.' in token else int(token)

from lark import Tree
from datetime import datetime

class TreeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Tree):
            # 将Tree对象转换为可序列化的字典
            return {
                'data': obj.data,
                'children': [self.default(child) for child in obj.children]
            }
        elif isinstance(obj, (datetime, complex)):
            return str(obj)
        return super().default(obj)

def parse_geometry_file(file_content):
    """解析几何构造文件"""
    parser = Lark(geometry_grammar, parser='lalr', transformer=GeometryTransformer())
    results = parser.parse(file_content)
    geometry_data = json.dumps(results, indent=2, ensure_ascii=False)
    return geometry_data

# 示例使用
if __name__ == "__main__":
    file_contents = """
#Min_2Segment_on_Ray_in_Angle
A=[-306,126]
B=[181,190]
s1=Ray[A,B]
C=[-119,-5]
s2=Ray[A,C]
D=[101,-57]
s3=ABisect[B,A,C]
s4=Perp[A,s3]
s5=Perp[D,s3]
E=Intersect[s3,s5,0]
s6=PBisect[D,E]
s7=Line[A,B]
s8=Line[A,C]
F=Intersect[s6,s7,0]
G=Intersect[s6,s8,0]
c1=Circle3[A,F,G]
H=Intersect[c1,s4,-,A]
s9=Parallel[D,s1]
I=Intersect[s4,s9,0]
c2=Circle3[H,I,D]
J=Intersect[c2,s2,1]
s10=Line[D,J]
K=Intersect[s10,s1,0]
S1=Segment[J,K]

S2=Segment[D,B]
S3=Segment[D,C]

initial=A,s1,s2,D

movepoints=B,C

result=s10:S1,J,K

explore=S1,J,K

rules=S2/s8,S3/s7
"""
    
    # 解析所有文件
    json_output = parse_geometry_file(file_contents)

    # 输出JSON格式
    print(json_output)
    
    # 保存到文件
    with open("geometry_parsed.json", "w", encoding="utf-8") as f:
        f.write(json_output)