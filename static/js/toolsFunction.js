/* toolsFunction.js */

class ToolsFunction {
    /**
     * 小数点舍入 工具函数
     * @param {number} number
     * @param {number} precision 精确至小数点后n位，的n值
     * @return {number}
     */
    static myRound(number, precision) {
        return Math.round(+number + "e" + precision) / Math.pow(10, precision);
    }
    
    /**
     * 计算直线与画布边界的交点 工具函数
     * @param {number[]} bag [startX, startY, endX, endY, canvasWidth, canvasHeight]
     * @param {Object} transform 当前画布变换参数
     * @return {{p1: {x: number, y: number}, p2: {x: number, y: number}}} 两个点的坐标
     */
    static getLineBounds(bag, transform) {
        const [startX, startY, endX, endY, canvasWidth, canvasHeight] = bag;
        const outCanvas = 20;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const left = -outCanvas - transform.x / transform.scale;
        const right = (canvasWidth + outCanvas - transform.x) / transform.scale;
        const top = -outCanvas - transform.y / transform.scale;
        const down = (canvasHeight + outCanvas - transform.y) / transform.scale;
    
        // 处理垂直于 x 轴的直线（dx=0）
        if (dx === 0) {
            const x = startX;
            const top_ = {x, y: top};
            const bottom = {x, y: down};
            return {
                p1: top_,
                p2: bottom
            };
        }
        
        // 计算直线与画布两边的交点
        const tValues = [];
        // 与左边（x=0）的交点：t = (0 - startX)/dx
        tValues.push((left - startX) / dx);
        // 与右边（x=canvas.width）的交点：t = (canvas.width - startX)/dx
        tValues.push((right - startX) / dx);
        
        const intersections = tValues
            .map(t => ({
                x: startX + dx * t,
                y: startY + dy * t
                }));
        
        return {
            p1: intersections[0],
            p2: intersections[1]
        };
    }
    
    /**
     * 计算选中直线与画布边界的交点 工具函数
     * @param {number[]} bag [startX, startY, endX, endY, canvasWidth, canvasHeight]
     * @param {Object} transform 当前画布变换参数
     * @return {{p1: {x: number, y: number}, p2: {x: number, y: number}, 
     *  p3: {x: number, y: number}, p4: {x: number, y: number}, 
     *  p5: {x: number, y: number}, p6: {x: number, y: number}, 
     *  p7: {x: number, y: number}, p8: {x: number, y: number}}} 两组边界点对，两组偏移点对
     */
    static getChoiceLineBounds(bag, transform) {
        const [startX, startY, endX, endY, canvasWidth, canvasHeight] = bag;
        const outCanvas = 20;
        const offset = 6;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const left = -outCanvas - transform.x / transform.scale;
        const right = (canvasWidth + outCanvas - transform.x) / transform.scale;
        const top = -outCanvas - transform.y / transform.scale;
        const down = (canvasHeight + outCanvas - transform.y) / transform.scale;
    
        // 处理垂直于 x 轴的直线（dx=0）
        if (dx === 0) {
            const x = startX;
            return {
                p1: {x: x + offset / transform.scale, y: top},
                p2: {x: x + offset / transform.scale, y: down},
                p3: {x: x - offset / transform.scale, y: top},
                p4: {x: x - offset / transform.scale, y: down},
                p5: {x: x + offset / transform.scale, y: startY},
                p6: {x: x - offset / transform.scale, y: startY},
                p7: {x: x + offset / transform.scale, y: endY},
                p8: {x: x - offset / transform.scale, y: endY},
            };
        }
        
        // 计算直线与画布两边的交点
        const tValues = [];
        // 与左边（x=0）的交点：t = (0 - startX)/dx
        tValues.push((left - startX) / dx);
        // 与右边（x=canvas.width）的交点：t = (canvas.width - startX)/dx
        tValues.push((right - startX) / dx);
        // 计算y轴上的偏移量
        const tmp = offset * dy / dx;
        const offsetY = Math.hypot(tmp, offset) / transform.scale;
        // 点偏移
        const pointOffsetY = offset * dx / Math.hypot(dx, dy);
        const pointOffsetX = -offset * dy / Math.hypot(dx, dy);
        
        const intersections = tValues
            .map(t => ({
                x: startX + dx * t,
                y: startY + dy * t
                }));
        
        const x1 = intersections[0].x;
        const y1 = intersections[0].y;
        const x2 = intersections[1].x;
        const y2 = intersections[1].y;
        
        return {
            p1: {x: x1, y: y1 + offsetY},
            p2: {x: x2, y: y2 + offsetY},
            p3: {x: x1, y: y1 - offsetY},
            p4: {x: x2, y: y2 - offsetY},
            p5: {x: startX + pointOffsetX, y: startY + pointOffsetY},
            p6: {x: startX - pointOffsetX, y: startY - pointOffsetY},
            p7: {x: endX + pointOffsetX, y: endY + pointOffsetY},
            p8: {x: endX - pointOffsetX, y: endY - pointOffsetY},
        };
    }
    
    /**
     * 小写字母表
     * @return {string[]}
     */
    static generateLowercaseLetters() {
        const lowercaseLetters = [];
        for (let i = 97; i <= 122; i++) {
            lowercaseLetters.push(String.fromCharCode(i));
        }
        return lowercaseLetters;
    }
    
    /**
     * ID转数值 工具函数
     * @param {string} id
     * @return {number} ID计数
     */
    static idToInt(id) {
        const tempId = id.toLowerCase();
        const lowercaseLetters = ToolsFunction.generateLowercaseLetters();
        
        const length = tempId.length;
        if (length === 1) {
            const index = lowercaseLetters.indexOf(tempId);
            return index + 1;
            
        }else if (length > 1) {
            const index = lowercaseLetters.indexOf(tempId.slice(0, 1));
            const number = Number(tempId.slice(1));
            return index + 1 + 26 * number;
        }
    }
    
    /**
     * 数值转ID 工具函数
     * @param {number} int
     * @param {boolean} lowerCase
     * @return {string} ID
     */
    static intToId(int, lowerCase) {
        // 转换
        let letter;
        const count = Math.floor((int - 1) / 26);
        const less = int % 26;
        const lowercaseLetters = ToolsFunction.generateLowercaseLetters();
        
        if (less === 0) {
            letter = "z";
        }else{
            letter = lowercaseLetters[less - 1];
        }
        
        if (!lowerCase) letter = letter.toUpperCase();
        
        if (!count) {
            return `${letter}`;
        }else{
            return `${letter}${count}`;
        }
    }
    
    /**
     * 计算点P3到直线P1P2的距离
     * @param {Object} p1 - 直线起点 {x: number, y: number}
     * @param {Object} p2 - 直线终点 {x: number, y: number}
     * @param {Object} p3 - 目标点 {x: number, y: number}
     * @returns {{flag: true, value: number} | {flag: false, information: string}} 点到直线的距离
     */
    static pointToLineDistance(p1, p2, p3) {
        // 参数校验
        if (!p1 || !p2 || !p3 || 
            typeof p1.x !== 'number' || typeof p1.y !== 'number' ||
            typeof p2.x !== 'number' || typeof p2.y !== 'number' ||
            typeof p3.x !== 'number' || typeof p3.y !== 'number') {
            return {flag: false, information: '参数必须为包含x和y属性的对象'};
        }
        
        // 检查P1和P2是否重合（直线长度为0）
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lineLengthSquared = dx * dx + dy * dy;
        
        if (Math.abs(lineLengthSquared) < 1e-10) {
            return {flag: false, information: 'P1和P2重合，无法确定直线'};
        }
        
        // 使用向量叉积公式计算距离：|(P2-P1) × (P1-P3)| / |P2-P1|
        const crossProduct = Math.abs(dx * (p1.y - p3.y) - dy * (p1.x - p3.x));
        return {flag: true, value: crossProduct / Math.sqrt(lineLengthSquared)};
    }
    
    
    /**
     * 计算两条直线的交点坐标
     * @param {Object} p1 - 第一个点，包含x和y属性
     * @param {Object} p2 - 第二个点，包含x和y属性
     * @param {Object} p3 - 第三个点，包含x和y属性
     * @param {Object} p4 - 第四个点，包含x和y属性
     * @returns {{flag: true, value: {x, y}} | {flag: false, information: string}} 交点坐标对象 {x, y}，如果直线平行或重合则返回null
     */
    static lineIntersection(p1, p2, p3, p4) {
        const x1 = p1.x, y1 = p1.y;
        const x2 = p2.x, y2 = p2.y;
        const x3 = p3.x, y3 = p3.y;
        const x4 = p4.x, y4 = p4.y;
        
        // 计算直线方程的系数
        const A1 = y2 - y1;
        const B1 = x1 - x2;
        const C1 = x2 * y1 - x1 * y2;
        
        const A2 = y4 - y3;
        const B2 = x3 - x4;
        const C2 = x4 * y3 - x3 * y4;
        
        // 计算行列式
        const det = A1 * B2 - A2 * B1;
        
        // 处理直线平行或重合的情况（考虑浮点误差）
        if (Math.abs(det) < 1e-10) {
            return {flag: false, information: "直线平行或重合"};
        }
        
        // 计算交点坐标
        const x = (B1 * C2 - B2 * C1) / det;
        const y = (A2 * C1 - A1 * C2) / det;
        
        return {flag: true, value: {x, y}};
    }
    
    /**
     * 计算直线与圆的交点坐标
     * @param {Object} p1 - 直线第一个点，包含x和y属性
     * @param {Object} p2 - 直线第二个点，包含x和y属性
     * @param {Object} p3 - 圆心点，包含x和y属性
     * @param {Object} p4 - 圆上点，包含x和y属性
     * @returns {{count: number, value: Array}} 交点坐标数组，可能包含0、1或2个交点
     */
    static lineCircleIntersection(p1, p2, p3, p4) {
        // 计算圆的半径
        const radius = Math.sqrt(Math.pow(p4.x - p3.x, 2) + Math.pow(p4.y - p3.y, 2));
        
        // 直线方程参数：Ax + By + C = 0
        const A = p2.y - p1.y;
        const B = p1.x - p2.x;
        const C = p2.x * p1.y - p1.x * p2.y;
        
        // 圆心坐标
        const cx = p3.x;
        const cy = p3.y;
        
        // 计算圆心到直线的距离
        const distance = Math.abs(A * cx + B * cy + C) / Math.sqrt(A * A + B * B);
        
        // 处理无交点情况（直线与圆相离）
        if (distance > radius + 1e-10) {
            return ToolsFunction.formatIntersections([]);
        }
        
        // 处理相切情况（一个交点）
        if (Math.abs(distance - radius) < 1e-10) {
            // 计算垂足坐标（切点）
            const denominator = A * A + B * B;
            const x0 = (B * (B * cx - A * cy) - A * C) / denominator;
            const y0 = (A * (-B * cx + A * cy) - B * C) / denominator;
            return ToolsFunction.formatIntersections([{x: x0, y: y0}]);
        }
        
        // 处理相交情况（两个交点）
        // 计算垂足坐标
        const denominator = A * A + B * B;
        const x0 = (B * (B * cx - A * cy) - A * C) / denominator;
        const y0 = (A * (-B * cx + A * cy) - B * C) / denominator;
        
        // 计算半弦长
        const chordHalfLength = Math.sqrt(radius * radius - distance * distance);
        
        // 计算单位方向向量
        const vecLength = Math.sqrt(A * A + B * B);
        const unitX = B / vecLength;
        const unitY = -A / vecLength;
        
        // 计算两个交点坐标
        const intersection1 = {
            x: x0 + unitX * chordHalfLength,
            y: y0 + unitY * chordHalfLength
        };
        
        const intersection2 = {
            x: x0 - unitX * chordHalfLength,
            y: y0 - unitY * chordHalfLength
        };
        
        return ToolsFunction.formatIntersections([intersection1, intersection2]);
    }
    
    /**
     * 计算两个圆的交点坐标
     * @param {Object} p1 - 第一个圆的圆心，包含x和y属性
     * @param {Object} p2 - 第一个圆上的点，包含x和y属性
     * @param {Object} p3 - 第二个圆的圆心，包含x和y属性
     * @param {Object} p4 - 第二个圆上的点，包含x和y属性
     * @returns {{count: number, value: Array}} 交点坐标数组，可能包含0、1或2个交点
     */
    static circleCircleIntersection(p1, p2, p3, p4) {
        // 计算两个圆的半径
        const r1 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const r2 = Math.sqrt(Math.pow(p4.x - p3.x, 2) + Math.pow(p4.y - p3.y, 2));
        
        // 圆心坐标
        const x1 = p1.x, y1 = p1.y;
        const x2 = p3.x, y2 = p3.y;
        
        // 计算两圆心之间的距离
        const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // 处理无交点情况（相离或内含）
        if (d > r1 + r2 + 1e-10 || d < Math.abs(r1 - r2) - 1e-10) {
            return ToolsFunction.formatIntersections([]);
        }
        
        // 处理同心圆情况
        if (d < 1e-10 && Math.abs(r1 - r2) < 1e-10) {
            // 同心圆且半径相等，有无数交点，返回空数组
            return ToolsFunction.formatIntersections([]);
        }
        
        if (d < 1e-10) {
            // 同心圆但半径不同，无交点
            return ToolsFunction.formatIntersections([]);
        }
        
        // 计算交点连线到圆心1的距离
        const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        
        // 计算交点连线的半长
        const h = Math.sqrt(r1 * r1 - a * a);
        
        // 计算中间点（两圆心连线与交点连线的交点）
        const x0 = x1 + a * (x2 - x1) / d;
        const y0 = y1 + a * (y2 - y1) / d;
        
        // 处理相切情况（一个交点）
        if (Math.abs(h) < 1e-10) {
            return ToolsFunction.formatIntersections([{x: x0, y: y0}]);
        }
        
        // 计算两个交点坐标
        const intersection1 = {
            x: x0 + h * (y2 - y1) / d,
            y: y0 - h * (x2 - x1) / d
        };
        
        const intersection2 = {
            x: x0 - h * (y2 - y1) / d,
            y: y0 + h * (x2 - x1) / d
        };
        
        return ToolsFunction.formatIntersections([intersection1, intersection2]);
    }
    
    static formatIntersections(intersections) {
        if (intersections.length === 0) {
            return {count: 0};
        } else if (intersections.length === 1) {
            return {count: 1, value: intersections};
        } else {
            return {count: 2, value: intersections};
        }
    }

    /**
     * ID排序
     * @param {Object[]} list 实体对象列表
     * @returns {Object[]}
     */
    static idOrder(list) {
        const orderList = new Array();
        for (const item of list) {
            const id = item.getId();
            const idNumber = ToolsFunction.idToInt(id);
            let length = orderList.length - 1;
            if (length < 0) orderList.push(item)

            for (let i = 0; length - i >= 0; i++) {
                const element = orderList[length - i];
                const idNumber2 = ToolsFunction.idToInt(element.getId());
                if (idNumber > idNumber2) {
                    orderList.splice(length - i + 1, 0, item);
                    break;
                }
                if (length - i === 0) orderList.unshift(item);
            }
        }
        return orderList;
    }
    
    /**
     * 复制线段
     * 根据点p1, p2, p3，返回点p4满足p1p4与p2p3方向相同且相等
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {{x: number, y: number}} 输出点
     */
    static parallelogram(p1, p2, p3) {
        const deltaX = p3.x - p2.x;
        const deltaY = p3.y - p2.y;
        return {x: p1.x + deltaX, y: p1.y + deltaY};
    }
    
    /**
     * 垂直线段
     * 根据点p1, p2, p3，返回点p4满足p1p4为p2p3顺时针旋转90度
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {{x: number, y: number}} 输出点
     */
    static perpendicular(p1, p2, p3) {
        const deltaX = p3.x - p2.x;
        const deltaY = p3.y - p2.y;
        return {x: p1.x + deltaY, y: p1.y - deltaX};
    }
    
    /**
     * 中点
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @returns {{x: number, y: number}} 输出点
     */
    static middlePoint(p1, p2) {
        return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
    }
    
    /**
     * 垂直平分线
     * 根据点p1, p2返回点p3, p4，满足p1p2的中点p5与p3p4为同一个点，
     * 且p3为点p1绕p5旋转90度，p4为点p2绕p5选择90度
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @returns {[{x: number, y: number}, {x: number, y: number}]} 输出点对
     */
    static perpendicularBisector(p1, p2) {
        const middleX = (p1.x + p2.x) / 2;
        const middleY = (p1.y + p2.y) / 2;
        const deltaP1X = p1.x - middleX;
        const deltaP1Y = p1.y - middleY;
        const deltaP2X = p2.x - middleX;
        const deltaP2Y = p2.y - middleY;
        const p3 = {x: middleX + deltaP1Y, y: middleY - deltaP1X};
        const p4 = {x: middleX + deltaP2Y, y: middleY - deltaP2X};
        return [p3, p4];
    }
    
    /**
     * 两点长度
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @returns {number}
     */
    static distance(p1, p2) {
        const deltaX = p1.x - p2.x;
        const deltaY = p1.y - p2.y;
        return Math.hypot(deltaX, deltaY);
    }
    
    /**
     * 三点角度
     * 返回角p1p2p3的角度，顶点为p2
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {number} 弧度制
     */
    static angle(p1, p2, p3) {
        const p1p2 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const p2p3 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
        const p3p1 = Math.hypot(p1.x - p3.x, p1.y - p3.y);
        const cosP2 = (Math.pow(p1p2, 2) + Math.pow(p2p3, 2) - Math.pow(p3p1, 2)) / (2 * p1p2 * p2p3);
        const angleP2 = Math.acos(cosP2);
        return angleP2;
    }
    
    /**
     * 两点上的比例点
     * 根据p1p2和比例k返回点p3，满足p1p3=k*p1p2
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {number} k 比例
     * @returns {{x: number, y: number}} p3
     */
    static scalePoint(p1, p2, k) {
        const deltaX = p2.x - p1.x;
        const deltaY = p2.y - p1.y;
        return {x: p1.x + k * deltaX, y: p1.y + k * deltaY};
    }
    
    /**
     * 角平分线
     * 根据点p1, p2, p3，返回点p4满足p4为角p1p2p3的角平分线与直线p1p3的交点
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {{flag: false, information: string} | {flag: true, value: {x: number, y: number}}} 输出点
     */
    static angleBisector(p1, p2, p3) {
        const p2p1 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const p2p3 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
        // 除0检查
        if (p2p1 === 0) return {flag: false, information: "p2p1 === 0, 不能形成角平分线"};
        if (p2p3 === 0) return {flag: false, information: "p2p3 === 0, 不能形成角平分线"};
        const scale = p2p1 / p2p3;
        const tmp = scale + 1;
        if (tmp === 0) return {flag: false, information: "tmp === 0, 不能形成角平分线"};
        
        const k = scale / (scale + 1);
        const p4 = ToolsFunction.scalePoint(p1, p3, k);
        return {flag: true, value: p4};
    }
    
    /**
     * 外角平分线
     * 根据点p1, p2, p3，返回点p4满足p4为角p1p2p3的外角平分线与直线p1p3的交点
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {{flag: false, information: string} | {flag: true, value: {x: number, y: number}}} 输出点
     */
    static angleOutBisector(p1, p2, p3) {
        const p2p1 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const p2p3 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
        // 除0检查
        if (p2p1 === 0) return {flag: false, information: "不能形成角平分线"};
        if (p2p3 === 0) return {flag: false, information: "不能形成角平分线"};
        const scale = p2p1 / p2p3;
        const tmp = scale - 1;
        if (tmp === 0) return {flag: false, information: "不能形成角平分线"};
        
        const k = scale / (scale - 1);
        const p4 = ToolsFunction.scalePoint(p1, p3, k);
        return {flag: true, value: p4};
    }
    
    /**
     * 3点圆
     * 根据点p1, p2, p3，返回外心
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {{flag: false, information: string} | {flag: true, value: {x: number, y: number}}} 输出点
     */
    static threePointsCircle(p1, p2, p3) {
        const [p4, p5] = ToolsFunction.perpendicularBisector(p1, p2);
        const [p6, p7] = ToolsFunction.perpendicularBisector(p1, p3);
        const flagValue = ToolsFunction.lineIntersection(p4, p5, p6, p7);
        
        if (flagValue.flag) {
            return {flag: true, value: flagValue.value};
        }else{
            return {flag: false, information: "3点共线"};
        }
    }
    
    /**
     * 计算与给定三角形正相似的三角形的第三个顶点
     * 已知三角形p1p2p3和三角形的前两个顶点p4,p5，求p6使得三角形p4p5p6与三角形p1p2p3正相似（对应顶点顺序：p1->p4, p2->p5, p3->p6）
     * @param {Object} p1 - 第一个三角形的第一个顶点，具有x和y属性
     * @param {Object} p2 - 第一个三角形的第二个顶点
     * @param {Object} p3 - 第一个三角形的第三个顶点
     * @param {Object} p4 - 第二个三角形的第一个顶点
     * @param {Object} p5 - 第二个三角形的第二个顶点
     * @returns {Object|null} 第二个三角形的第三个顶点p6，如果三角形退化则返回null
     */
    static findSimilarTriangleVertex(p1, p2, p3, p4, p5) {
        // 计算向量
        const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
        const v2 = { x: p3.x - p1.x, y: p3.y - p1.y };
        const u1 = { x: p5.x - p4.x, y: p5.y - p4.y };
    
        // 计算v1的长度
        const lenV1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        if (lenV1 < 1e-10) {
            // 三角形p1p2p3退化，无法确定相似
            return null;
        }
    
        // 缩放因子
        const lenU1 = Math.sqrt(u1.x * u1.x + u1.y * u1.y);
        const scale = lenU1 / lenV1;
    
        // 旋转角度
        const angleV1 = Math.atan2(v1.y, v1.x);
        const angleU1 = Math.atan2(u1.y, u1.x);
        const rotation = angleU1 - angleV1;
    
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
    
        // 应用旋转和缩放到v2得到u2
        const u2 = {
            x: scale * (v2.x * cosR - v2.y * sinR),
            y: scale * (v2.x * sinR + v2.y * cosR)
        };
    
        // p6 = p4 + u2
        const p6 = { x: p4.x + u2.x, y: p4.y + u2.y };
        return p6;
    }
    
    /**
     * 切点
     * 根据点p1, 圆p2, p3，返回切点
     * 当切点为两个时，两个点的顺序为p1向p2逆时针
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {{count: number, value: Object[]}} 输出点
     */
    static tangent(p1, p2, p3) {
        const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const radius = Math.hypot(p3.x - p2.x, p3.y - p2.y);
        const diff = distance - radius;
        
        if (Math.abs(diff) < 1e-10) {
            // 在圆上
            const deltaX = p1.x - p2.x;
            const deltaY = p1.y - p2.y;
            const p4 = {x: p1.x + deltaY, y: p1.y - deltaX};
            return {count: 1, value: p4};
            
        }else if (diff > 0) {
            // 在圆外
            const tmpRadius = Math.sqrt((distance + radius) * (distance - radius));
            const tmp = {x: p1.x + tmpRadius, y: p1.y};
            const countValue = ToolsFunction.circleCircleIntersection(p1, tmp, p2, p3);
            if (countValue.count === 2) return {count: 2, value: countValue.value};
            
        }else{
            // 在圆内
            return {count: 0};
        }
    }
    
    /**
     * 反演点
     * 点p1, 圆p2, p3
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {{x: number, y: number} | null} 输出点
     */
    static inversion(p1, p2, p3) {
        const countValue = ToolsFunction.lineCircleIntersection(p1, p2, p2, p3);
        if (countValue.count !== 2) return null;
        
        const [p4, p5] = countValue.value;
        const p1p4 = Math.hypot(p1.x - p4.x, p1.y - p4.y);
        const p1p5 = Math.hypot(p1.x - p5.x, p1.y - p5.y);
        
        if (p1p5 === 0) return null;
        const scale = p1p4 / p1p5;
        const tmp = 1 + 1 / scale;
        if (tmp === 0) return null;
        
        const k = 1 / tmp;
        const p6 = ToolsFunction.scalePoint(p4, p5, k);
        return p6;
    }
    
    /**
     * 极线
     * 点p1, 圆p2, p3，返回极线与直线(p1, p2)的交点p4，和p2关于p4顺时针旋转90度的点p5
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @returns {[{x: number, y: number}, {x: number, y: number}] | null} 输出点
     */
    static polarLine(p1, p2, p3) {
        const p4 = ToolsFunction.inversion(p1, p2, p3);
        if (!p4) return null;
        
        const deltaX = p2.x - p4.x;
        const deltaY = p2.y - p4.y;
        const p5 = {x: p4.x + deltaY, y: p4.y - deltaX};
        return [p4, p5];
    }
    
    /**
     * 极点
     * 直线p1, p2, 圆p3, p4
     * @param {{x: number, y: number}} p1
     * @param {{x: number, y: number}} p2
     * @param {{x: number, y: number}} p3
     * @param {{x: number, y: number}} p4
     * @returns {{x: number, y: number} | null} 输出点
     */
    static polarPoint(p1, p2, p3, p4) {
        const line1 = ToolsFunction.polarLine(p1, p3, p4);
        if (!line1) return null;
        const line2 = ToolsFunction.polarLine(p2, p3, p4);
        if (!line2) return null;
        const [p5, p6] = line1;
        const [p7, p8] = line2;
        const flagValue = ToolsFunction.lineIntersection(p5, p6, p7, p8);
        
        if (flagValue.flag) {
            return flagValue.value;
        }else{
            return null;
        }
    }
    
    /**
     * 返回圆上以画布x轴正方向，指定弧度的点的坐标
     * @param {{x: number, y: number}} p1 圆心
     * @param {{x: number, y: number}} p2 圆上的点
     * @param {number} value 弧度
     * @returns {{x: number, y: number}}
     */
    static radianToCoordinate(p1, p2, value) {
        const radius = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const dx = radius * Math.cos(value);
        const dy = radius * Math.sin(value);
        return {x: p1.x + dx, y: p1.y + dy};
    }
    
    /**
     * 直线点吸附值
     * @param {{x: number, y: number}} p1 直线定义点
     * @param {{x: number, y: number}} p2 直线定义点
     * @param {{x: number, y: number}} p3 要吸附的坐标
     * @returns {number | null} 直线定义点的值
     */
    static nearPointOnLine(p1, p2, p3) {
        const p1p2 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const p2p3 = Math.hypot(p3.x - p2.x, p3.y - p2.y);
        const p3p1 = Math.hypot(p1.x - p3.x, p1.y - p3.y);
        const cosP1 = (Math.pow(p1p2, 2) + Math.pow(p3p1, 2) - Math.pow(p2p3, 2)) / (2 * p1p2 * p3p1);
        
        const projectionDistance = cosP1 * p3p1;
        if (p1p2 === 0) return null;
        const ratio = projectionDistance / p1p2;
        return ratio;
    }
    
    /**
     * 圆点吸附值
     * @param {{x: number, y: number}} p1 圆心
     * @param {{x: number, y: number}} p2 要吸附的坐标
     * @returns {number} 圆定义点的值
     */
    static nearPointOnCircle(p1, p2) {
        const radian = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        return radian;
    }
    
    /**
     * 计算两条直线的交点坐标
     * @param {Object} line1
     * @param {Object} line2
     * @returns {{flag: true, value: {x, y}} | {flag: false, information: string}} 交点坐标对象 {x, y}，如果直线平行或重合则返回null
     */
    static lineIntersectionByGeometryObject(line1, line2) {
        const coordList1 = line1.getCoordinate();
        const coordList2 = line2.getCoordinate();
        const [x1, y1] = coordList1[0];
        const [x2, y2] = coordList1[1];
        const [x3, y3] = coordList2[0];
        const [x4, y4] = coordList2[1];
        const p1 = {x: x1, y: y1};
        const p2 = {x: x2, y: y2};
        const p3 = {x: x3, y: y3};
        const p4 = {x: x4, y: y4};
        return ToolsFunction.lineIntersection(p1, p2, p3, p4);
    }
    
    /**
     * 计算直线与圆的交点坐标
     * @param {Object} line
     * @param {Object} circle
     * @returns {{count: number, value: Array}} 交点坐标数组，可能包含0、1或2个交点
     */
    static lineCircleIntersectionByGeometryObject(line, circle) {
        const coordList1 = line.getCoordinate();
        const coordList2 = circle.getCoordinate();
        const [x1, y1] = coordList1[0];
        const [x2, y2] = coordList1[1];
        const [x3, y3] = coordList2[0];
        const [x4, y4] = coordList2[1];
        const p1 = {x: x1, y: y1};
        const p2 = {x: x2, y: y2};
        const p3 = {x: x3, y: y3};
        const p4 = {x: x4, y: y4};
        return ToolsFunction.lineCircleIntersection(p1, p2, p3, p4);
    }
    
    /**
     * 计算两个圆的交点坐标
     * @param {Object} circle1
     * @param {Object} circle2
     * @returns {{count: number, value: Array}} 交点坐标数组，可能包含0、1或2个交点
     */
    static circleCircleIntersectionByGeometryObject(circle1, circle2) {
        const coordList1 = circle1.getCoordinate();
        const coordList2 = circle2.getCoordinate();
        const [x1, y1] = coordList1[0];
        const [x2, y2] = coordList1[1];
        const [x3, y3] = coordList2[0];
        const [x4, y4] = coordList2[1];
        const p1 = {x: x1, y: y1};
        const p2 = {x: x2, y: y2};
        const p3 = {x: x3, y: y3};
        const p4 = {x: x4, y: y4};
        return ToolsFunction.circleCircleIntersection(p1, p2, p3, p4);
    }
    
    /**
     * 以基底更新交点坐标
     * @param {{type: string, bases: Object[], value: number, exclude: string}} define
     * @returns {{valid: boolean, coordinate: [x, y]}}
     */
    static updateIntersectionCoordinate(define) {
        const base = define.bases;
        const element1 = base[0];
        const element2 = base[1];
        if (!element1.getValid()) return {valid: false};
        if (!element2.getValid()) return {valid: false};
        const element1Type = element1.getType();
        const element2Type = element2.getType();
        const index = define.value;

        // 排除点
        let excludeFlag = false;
        let excludeElementX = 0, excludeElementY = 0;
        if (Object.keys(define).includes('exclude')) {
            const excludeElementId = define.exclude;
            const excludeElement = geometryManager.get(excludeElementId);
            if (excludeElement) {
                [excludeElementX, excludeElementY] = excludeElement.getCoordinate();
                excludeFlag = true;
            }
        }
        
        if (element1Type === "line") {
            if (element2Type === "line") {
                const flagValue = ToolsFunction.lineIntersectionByGeometryObject(element1, element2);
                const flag = flagValue.flag;
                if (flag) {
                    const {x, y} = flagValue.value;
                    return {valid: true, coordinate: [x, y]};
                }else{
                    return {valid: false};
                }
            }else if (element2Type === "circle") {
                const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element1, element2);
                const count = countValue.count;
                if (count === 0) {
                    return {valid: false};
                }else if (count === 1) {
                    const coord = countValue.value[0];
                    return {valid: true, coordinate: [coord.x, coord.y]};
                }else if (count === 2) {
                    if (!excludeFlag) {
                        const coord = countValue.value[index];
                        return {valid: true, coordinate: [coord.x, coord.y]};
                    }else{
                        const [coord1, coord2] = countValue.value;
                        const excludeElementCoordinate = {x: excludeElementX, y: excludeElementY};
                        const distance1 = ToolsFunction.distance(excludeElementCoordinate, coord1);
                        const distance2 = ToolsFunction.distance(excludeElementCoordinate, coord2);
                        if (distance1 < distance2) {
                            // 排除点在第1点
                            return {valid: true, coordinate: [coord2.x, coord2.y]};
                        }else{
                            return {valid: true, coordinate: [coord1.x, coord1.y]};
                        }
                    }
                }
            }
        }else if (element1Type === "circle") {
            if (element2Type === "line") {
                const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element2, element1);
                const count = countValue.count;
                if (count === 0) {
                    return {valid: false};
                }else if (count === 1) {
                    const coord = countValue.value[0];
                    return {valid: true, coordinate: [coord.x, coord.y]};
                }else if (count === 2) {
                    if (!excludeFlag) {
                        const coord = countValue.value[index];
                        return {valid: true, coordinate: [coord.x, coord.y]};
                    }else{
                        const [coord1, coord2] = countValue.value;
                        const excludeElementCoordinate = {x: excludeElementX, y: excludeElementY};
                        const distance1 = ToolsFunction.distance(excludeElementCoordinate, coord1);
                        const distance2 = ToolsFunction.distance(excludeElementCoordinate, coord2);
                        if (distance1 < distance2) {
                            // 排除点在第1点
                            return {valid: true, coordinate: [coord2.x, coord2.y]};
                        }else{
                            return {valid: true, coordinate: [coord1.x, coord1.y]};
                        }
                    }
                }
            }else if (element2Type === "circle") {
                const countValue = ToolsFunction.circleCircleIntersectionByGeometryObject(element1, element2);
                const count = countValue.count;
                if (count === 0) {
                    return {valid: false};
                }else if (count === 1) {
                    const coord = countValue.value[0];
                    return {valid: true, coordinate: [coord.x, coord.y]};
                }else if (count === 2) {
                    if (!excludeFlag) {
                        const coord = countValue.value[index];
                        return {valid: true, coordinate: [coord.x, coord.y]};
                    }else{
                        const [coord1, coord2] = countValue.value;
                        const excludeElementCoordinate = {x: excludeElementX, y: excludeElementY};
                        const distance1 = ToolsFunction.distance(excludeElementCoordinate, coord1);
                        const distance2 = ToolsFunction.distance(excludeElementCoordinate, coord2);
                        if (distance1 < distance2) {
                            // 排除点在第1点
                            return {valid: true, coordinate: [coord2.x, coord2.y]};
                        }else{
                            return {valid: true, coordinate: [coord1.x, coord1.y]};
                        }
                    }
                }
            }
        }
    }
    
    /**
     * 以基底更新线点坐标
     * @param {{type: string, bases: Object[], value: number}} define
     * @returns {[x, y]}
     */
    static updateOnlineCoordinate(define) {
        const [element] = define.bases;
        const elementType = element.getType();
        const value = define.value;
        const [point1Coord, point2Coord] = element.getCoordinate();
        const p1 = {x: point1Coord[0], y: point1Coord[1]};
        const p2 = {x: point2Coord[0], y: point2Coord[1]};
        
        let coord;
        if (elementType === "line") {
            coord = ToolsFunction.scalePoint(p1, p2, value);
        }else if (elementType === "circle") {
            coord = ToolsFunction.radianToCoordinate(p1, p2, value);
        }
        return [coord.x, coord.y];
    }

    /**
     * 更新点坐标
     * @param {{type: string, bases: Object[], value: number, exclude: string}} define
     * @returns {{type: string, coordinate: [x, y] | null}}
     */
    static updatePointCoordinate(define) {
        if (define.type === "none") return {type: 'keep', coordinate: null};
        if (define.type === "online") {
            const coord = ToolsFunction.updateOnlineCoordinate(define);
            return {type: 'update', coordinate: coord};
        }else if (define.type === "intersection") {
            const validCoord = ToolsFunction.updateIntersectionCoordinate(define);
            if (validCoord.valid) {
                return {type: 'update', coordinate: validCoord.coordinate};
            }else{
                return {type: 'invalid', coordinate: null};
            }
        }else if (define.type === "middlePoint") {
            const [point1, point2] = define.bases;
            const [x1, y1] = point1.getCoordinate();
            const [x2, y2] = point2.getCoordinate();

            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const coordList = ToolsFunction.middlePoint(p1, p2);
            return {type: 'update', coordinate: [coordList.x, coordList.y]};
        }else if (define.type === "center") {
            const [circle] = define.bases;
            const coordList = circle.getCoordinate();
            return {type: 'update', coordinate: coordList[0]};
        }
    }
    
    /**
     * 修改直线坐标
     * @param {{type: string, figure: Object[], value: number}} define
     * @returns {[[x1, y1], [x2, y2]] | null}
     */
    static updateLineCoordinate(define) {
        if (define.type === "none") return null;
        if (define.type === "twoPoints") {
            const [point1, point2] = define.figure;
            const [x1, y1] = point1.getCoordinate();
            const [x2, y2] = point2.getCoordinate();
            return [[x1, y1], [x2, y2]];
        }else if (define.type === "parallel") {
            const [point, line] = define.figure;
            const [x1, y1] = point.getCoordinate();
            const coordList = line.getCoordinate();
            const [x2, y2] = coordList[0];
            const [x3, y3] = coordList[1];
            
            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const p3 = {x: x3, y: y3};
            const coordList2 = ToolsFunction.parallelogram(p1, p2, p3);
            return [[x1, y1], [coordList2.x, coordList2.y]];
        }else if (define.type === "perpendicular") {
            const [point, line] = define.figure;
            const [x1, y1] = point.getCoordinate();
            const coordList = line.getCoordinate();
            const [x2, y2] = coordList[0];
            const [x3, y3] = coordList[1];
            
            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const p3 = {x: x3, y: y3};
            const coordList2 = ToolsFunction.perpendicular(p1, p2, p3);
            return [[x1, y1], [coordList2.x, coordList2.y]];
        }else if (define.type === "perpendicularBisector") {
            const [point1, point2] = define.figure;
            const [x1, y1] = point1.getCoordinate();
            const [x2, y2] = point2.getCoordinate();
            
            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const [coordList1, coordList2] = ToolsFunction.perpendicularBisector(p1, p2);
            return [[coordList1.x, coordList1.y], [coordList2.x, coordList2.y]];
        }else if (define.type === "threePointAngleBisector") {
            const [point1, point2, point3] = define.figure;
            const [x1, y1] = point1.getCoordinate();
            const [x2, y2] = point2.getCoordinate();
            const [x3, y3] = point3.getCoordinate();
            
            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const p3 = {x: x3, y: y3};
            const flagValue = ToolsFunction.angleBisector(p1, p2, p3);
            if (!flagValue.flag) return null;
            const coordList = flagValue.value;
            return [[x2, y2], [coordList.x, coordList.y]];
        }else if (define.type === "twoLineAngleBisector") {
            const [line1, line2] = define.figure;
            const coordList1 = line1.getCoordinate();
            const coordList2 = line2.getCoordinate();
            const [x1, y1] = coordList1[0];
            const [x2, y2] = coordList1[1];
            const [x3, y3] = coordList2[0];
            const [x4, y4] = coordList2[1];
            
            // 交点
            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const p3 = {x: x3, y: y3};
            const p4 = {x: x4, y: y4};
            let flagValue;
            flagValue = ToolsFunction.lineIntersection(p1, p2, p3, p4);
            if (!flagValue.flag) {
                console.log(flagValue.information)
                return null;
            }
            const interCoord = flagValue.value;

            // 角平分线
            let line1Point = ToolsFunction.parallelogram(interCoord, p1, p2);
            let line2Point = ToolsFunction.parallelogram(interCoord, p3, p4);

            const value = define.value;
            if (value === 0) {
                flagValue = ToolsFunction.angleBisector(line1Point, interCoord, line2Point);
            }else if (value === 1) {
                flagValue = ToolsFunction.angleOutBisector(line1Point, interCoord, line2Point);
            }
            if (!flagValue.flag) {
                console.log(flagValue.information)
                return null;
            }
            const coordList = flagValue.value;
            return [[interCoord.x, interCoord.y], [coordList.x, coordList.y]];
        }
    }
    
    /**
     * 修改圆坐标
     * @param {{type: string, figure: Object[], value: number}} define
     * @returns {[[x1, y1], [x2, y2]] | null}
     */
    static updateCircleCoordinate(define) {
        if (define.type === "none") return null;
        if (define.type === "twoPoints") {
            const [center, point] = define.figure;
            const [x1, y1] = center.getCoordinate();
            const [x2, y2] = point.getCoordinate();
            return [[x1, y1], [x2, y2]];
        }else if (define.type === "compass") {
            const [point1, point2, point3] = define.figure;
            const [x1, y1] = point1.getCoordinate();
            const [x2, y2] = point2.getCoordinate();
            const [x3, y3] = point3.getCoordinate();

            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const p3 = {x: x3, y: y3};
            const coordList2 = ToolsFunction.parallelogram(p1, p2, p3);
            return [[x3, y3], [coordList2.x, coordList2.y]];
        }else if (define.type === "copyCompass") {
            const [point, circle] = define.figure;
            const [x1, y1] = point.getCoordinate();
            const coordList = circle.getCoordinate();
            const [x2, y2] = coordList[0];
            const [x3, y3] = coordList[1];

            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const p3 = {x: x3, y: y3};
            const coordList2 = ToolsFunction.parallelogram(p1, p2, p3);
            return [[x1, y1], [coordList2.x, coordList2.y]];
        }else if (define.type === "threePointCircle") {
            const [point1, point2, point3] = define.figure;
            const [x1, y1] = point1.getCoordinate();
            const [x2, y2] = point2.getCoordinate();
            const [x3, y3] = point3.getCoordinate();

            const p1 = {x: x1, y: y1};
            const p2 = {x: x2, y: y2};
            const p3 = {x: x3, y: y3};
            const flagValue = ToolsFunction.threePointsCircle(p1, p2, p3);
            if (!flagValue.flag) return null;
            const coordList = flagValue.value;
            return [[coordList.x, coordList.y], [x1, y1]];
        }
    }

    /**
     * 点同一判定
     * @param {Object} point1 
     * @param {Object} point2 
     * @returns {boolean}
     */
    static pointEquative(point1, point2) {
        const [x1, y1] = point1.getCoordinate();
        const [x2, y2] = point2.getCoordinate();
        
        if (Math.abs(x1 - x2) > 1e-10) return false; // 注意绝对值
        if (Math.abs(y1 - y2) > 1e-10) return false;
        return true;
    }

    /**
     * 直线同一判定
     * @param {Object} line1 
     * @param {Object} line2 
     * @returns {boolean}
     */
    static lineEquative(line1, line2) {
        const coordList1 = line1.getCoordinate();
        const coordList2 = line2.getCoordinate();
        const [x1, y1] = coordList1[0];
        const [x2, y2] = coordList1[1];
        const [x3, y3] = coordList2[0];
        const [x4, y4] = coordList2[1];
        
        const p1 = {x: x1, y: y1};
        const p2 = {x: x2, y: y2};
        const p3 = {x: x3, y: y3};
        const p4 = {x: x4, y: y4};
        const flagValue1 = ToolsFunction.pointToLineDistance(p1, p2, p3);
        if (!flagValue1.flag) return false;
        const distance1 = Math.abs(flagValue1.value);
        const flagValue2 = ToolsFunction.pointToLineDistance(p1, p2, p4);
        if (!flagValue2.flag) return false;
        const distance2 = Math.abs(flagValue2.value);

        let flagCount = 0;
        if (distance1 < 1e-10) flagCount++;
        if (distance2 < 1e-10) flagCount++;
        if (flagCount === 2) {
            return true;
        }else{
            return false;
        }
    }

    /**
     * 圆同一判定
     * @param {Object} circle1 
     * @param {Object} circle2 
     * @returns {boolean}
     */
    static circleEquative(circle1, circle2) {
        const coordList1 = circle1.getCoordinate();
        const coordList2 = circle2.getCoordinate();
        const [x1, y1] = coordList1[0];
        const [x2, y2] = coordList1[1];
        const [x3, y3] = coordList2[0];
        const [x4, y4] = coordList2[1];
        
        if (Math.abs(x1 - x3) > 1e-10) return false;
        if (Math.abs(y1 - y3) > 1e-10) return false;
        const distance1 = Math.hypot((x2 - x1), (y2 - y1));
        const distance2 = Math.hypot((x4 - x3), (y4 - y3));
        if (Math.abs(distance1 - distance2) > 1e-10) return false;
        return true;
    }

    /**
     * 获取排除点
     * @param {[Object, Object]} param0 
     * @returns {[boolean, Set<Object>]}
     */
    static excludePoint([element1, element2]) {
        const element1Super = element1.getSuperstructure();
        const element1SuperSet = new Set();
        for (const element1SuperElement of element1Super) {
            const flag = ToolsFunction.excludeVerify(element1SuperElement);
            if (flag) element1SuperSet.add(element1SuperElement);
        }
        const element1Define = element1.getDefine();
        const element1DefineSet = new Set();
        for (const element1DefineElement of element1Define) {
            const flag = ToolsFunction.excludeVerify(element1DefineElement);
            if (flag) element1SuperSet.add(element1DefineElement);
        }
        const element2Super = element2.getSuperstructure();
        const element2SuperSet = new Set();
        for (const element2SuperElement of element2Super) {
            const flag = ToolsFunction.excludeVerify(element2SuperElement);
            if (flag) element1SuperSet.add(element2SuperElement);
        }
        const element2Define = element2.getDefine();
        const element2DefineSet = new Set();
        for (const element2DefineElement of element2Define) {
            const flag = ToolsFunction.excludeVerify(element2DefineElement);
            if (flag) element1SuperSet.add(element2DefineElement);
        }
        const element1Set = element1SuperSet.union(element1DefineSet);
        const element2Set = element2SuperSet.union(element2DefineSet);
        const element12UnionSet = element1Set.intersection(element2Set);
        if (element12UnionSet.size !== 0) {
            return [true, element12UnionSet];
        }else{
            return [false, element12UnionSet];
        }
    }

    /**
     * 排除点验证
     * @param {{getType(): string, getBase(): {type: string}, getValid(): boolean, getVisible(): boolean}} element 
     * @returns {boolean}
     */
    static excludeVerify(element) {
        const type = element.getType();
        const base = element.getBase();
        const baseType = base.type;
        const valid = element.getValid();
        const visible = element.getVisible();
        if (type === 'point' && baseType === 'intersection' && valid && visible) {
            return true;
        }else{
            return false;
        }
    }

    /**
     * 几何对象线上点
     * @param {{getCoordinate(): [[number, number], [number, number]]}} line 
     * @param {[number, number]} point 
     * @returns {number}
     */
    static nearPointOnLineElement(line, point) {
        const [[x1, y1], [x2, y2]] = line.getCoordinate();
        const p1 = {x: x1, y: y1};
        const p2 = {x: x2, y: y2};
        const [x3, y3] = point;
        const p3 = {x: x3, y: y3};
        const value = ToolsFunction.nearPointOnLine(p1, p2, p3);
        return value;
    }

    /**
     * 几何对象圆上点
     * @param {{getCoordinate(): [[number, number], [number, number]]}} circle 
     * @param {[number, number]} point 
     * @returns {number}
     */
    static nearPointOnCircleElement(circle, point) {
        const [[x1, y1], [x2, y2]] = circle.getCoordinate();
        const p1 = {x: x1, y: y1};
        const [x3, y3] = point;
        const p3 = {x: x3, y: y3};
        const value = ToolsFunction.nearPointOnCircle(p1, p3);
        return value;
    }

    /**
     * 字符串截取类似数组的部分
     * @param {string} str 
     * @returns {string[]}
     */
    static stringArraySplit(str) {
        // 1. 定位方括号位置
        const start = str.indexOf("[") + 1;
        const end = str.lastIndexOf("]");
        const innerContent = str.substring(start, end);

        // 2. 分割并处理元素
        const list = innerContent.split(",").map(item => item.trim());
        return list;
    }
}
