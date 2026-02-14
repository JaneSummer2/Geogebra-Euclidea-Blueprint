/* canvas.js */
/**
 * 绘制函数 过程函数
 */
 // 画布
const canvas = document.getElementById("canvas_id1");
const rect = canvas.getBoundingClientRect();
const canvasTop = rect.top; // 视口顶部的距离（动态值，随滚动变化）
const canvasLeft = rect.left;
let canvasWidth = rect.width;
let canvasHeight = rect.height;
const ct = canvas.getContext("2d");
let minMoveX = -500 - canvasWidth,
    minMoveY = -500 - canvasWidth;
const maxMoveX = 500, // max是负的
    maxMoveY = 500,
    minScale = 0.1,
    maxScale = 10;
const hex = '0123456789abcdef';

// 当窗口大小改变时调整画布
window.addEventListener('resize', resizeCanvas);

/**
 * 调整画布 过程函数
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    minMoveX = -500 - canvasWidth;
    minMoveY = -500 - canvasWidth;
    drawContent()
}

function drawContent() {
    ct.clearRect(0, 0, canvas.width, canvas.height);

    // 保存当前状态
    ct.save();

    // 绘制背景颜色
    drawColor();

    // 应用变换
    ct.translate(transform.x, transform.y);
    ct.scale(transform.scale, transform.scale);

    // 绘制图形
    drawShapes();

    // 绘制光标
    drawPointer();

    // 绘制裁剪
    if (canvasClipState) drawClip();

    // 恢复状态
    ct.restore();
}

function drawClip() {
    ct.save();
    // 1. 画布变灰
    ct.drawImage(img, 
        -transform.x / transform.scale, 
        -transform.y / transform.scale, 
        canvas.width / transform.scale, 
        canvas.height / transform.scale);
    ct.save();
    ct.globalAlpha = 0.5;
    ct.fillStyle = "rgb(0, 0, 0)";
    ct.fillRect(-transform.x / transform.scale, 
        -transform.y / transform.scale, 
        canvas.width / transform.scale, 
        canvas.height / transform.scale);
    ct.restore();

    // 2. 设置合成模式为 'source-atop'
    // 此模式意味着：后续绘制的内容只在它与现有（灰色）内容重叠的地方显示，且显示新内容。
    ct.globalCompositeOperation = 'source-atop';

    // 3. 在指定坐标绘制原图（只有与灰色底图重叠的区域，即高亮区域，会显示为彩色）
    ct.drawImage(
        img, 
        highlightX, 
        highlightY, 
        highlightWidth, 
        highlightHeight, // 从原图裁剪的位置和大小
        (highlightX - transform.x) / transform.scale, 
        (highlightY - transform.y) / transform.scale, 
        highlightWidth / transform.scale, 
        highlightHeight / transform.scale  // 画布上绘制的位置和大小
    );

    // 4. (可选) 为高亮区域添加一个白色边框以增强视觉效果
    ct.globalCompositeOperation = 'source-over'; // 重置为默认合成模式
    ct.setLineDash([15, 15]);
    ct.strokeStyle = 'white';
    ct.lineWidth = 5;
    ct.strokeRect((highlightX - transform.x) / transform.scale, 
        (highlightY - transform.y) / transform.scale, 
        highlightWidth / transform.scale, 
        highlightHeight / transform.scale);
    ct.restore();
}

/**
 * 绘制背景颜色 过程函数
 */
function drawColor() {
    ct.fillStyle = "rgb(255, 255, 255)";
    ct.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制光标 过程函数
 */
function drawPointer() {
    if (tool === "eraser") {
        const width = 16 / transform.scale;
        const x = (pointerPosition.x - transform.x) / transform.scale - width / 2;
        const y = (pointerPosition.y - transform.y) / transform.scale - width / 2;

        ct.fillStyle = 'rgb(255, 255, 255)';
        ct.fillRect(x, y, width, width);

        ct.strokeStyle = 'rgb(25, 25, 25)';
        ct.lineWidth = 3 / transform.scale;
        ct.strokeRect(x, y, width, width);
    }else if ((tool === 'line' || tool === 'ray' || tool === 'lineSegment') && subTool === 'style') {
        const x = (pointerPosition.x - transform.x) / transform.scale;
        const y = (pointerPosition.y - transform.y) / transform.scale;
        
        ct.fillStyle = 'rgb(25, 25, 25)';
        ct.beginPath();
        ct.arc(x, y, 15 / transform.scale, 0, Math.PI * 2);
        ct.fill();

        ct.fillStyle = 'rgb(255, 255, 255)';
        ct.beginPath();
        ct.arc(x, y, 10 / transform.scale, 0, Math.PI * 2);
        ct.fill();
    }
}

/**
 * 文本描边
 * @param {Object} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {string} fillColor
 * @param {string} strokeColor
 * @param {number} lineWidth
 */
function drawStrokedText(ctx, text, x, y, fillColor, strokeColor, lineWidth) {
    // 保存初始状态
    ctx.save();
    
    // 设置描边样式
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    
    // 多次绘制描边以增强效果（模拟粗描边）
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.strokeText(text, x + Math.cos(angle) * 0.5, y + Math.sin(angle) * 0.5);
    }
    
    // 绘制填充文本
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);
    
    // 恢复状态
    ctx.restore();
}

let goldGoalCanvas = [];
/**
 * 设定金色图形显示
 * @param {string[]} list 
 */
function canvasGoldGoal(list) {
    goldGoalCanvas = list;
}
/**
 * 绘制几何图形 过程函数
 */
function drawShapes() {
    const mode = programmeStatus();
    const geometryElements = geometryManager.getAllByType(tool);
    const exceptPoints = geometryElements['exceptPoints'];
    const exceptPointsCache = geometryElements['exceptPointsCache'];
    const points = geometryElements['points'];
    const pointsCache = geometryElements['pointsCache'];
    const choice = geometryElements['choice'];
    let resultPoints = [];
    let resultexceptPoints = [];
    if (mode === 'play') {
        const goldFigures = geometryManager.getByList(goldGoalCanvas);
        resultPoints = goldFigures.points;
        resultexceptPoints = goldFigures.exceptPoints;
    }
    
    // 除了点的几何对象
    for (const element of exceptPoints) {
        if (!element.getValid()) continue;
        if (!element.getVisible()) continue;
        
        if (element.getType() === 'line') drawInfiniteLine(element);
        if (element.getType() === 'circle') drawCircle(element);
    }
    // 除了点的目标几何对象
    for (const element of resultexceptPoints) {
        if (!element.getValid()) continue;
        if (!element.getVisible()) continue;
        
        if (element.getType() === 'line') drawInfiniteLine(element);
        if (element.getType() === 'circle') drawCircle(element);
    }
    // 除了点的缓存几何对象
    for (const element of exceptPointsCache) {
        if (!element.getValid()) continue;
        if (!element.getVisible()) continue;
        
        if (element.getType() === 'line') {
            drawInfiniteLine(element);
            drawChoiceInfiniteLine(element);
        }
        if (element.getType() === 'circle') {
            drawCircle(element);
            drawChoiceCircle(element);
        }
    }
    // 点
    for (const point of points) {
        if (!point.getValid()) continue;
        if (!point.getVisible()) continue;
        drawPoint(point);
        drawLabel(point);
    }
    // 目标点
    for (const point of resultPoints) {
        if (!point.getValid()) continue;
        if (!point.getVisible()) continue;
        drawPoint(point);
        drawLabel(point);
    }
    // 缓存点
    for (const point of pointsCache) {
        if (!point.getValid()) continue;
        if (!point.getVisible()) continue;
        drawPoint(point);
        drawChoicePoint(point);
    }
    // 选中对象
    for (const element of choice) {
        if (!element.getValid()) continue;
        if (!element.getVisible()) continue;

        if (element.getType() === "point") drawChoicePoint(element);
        if (element.getType() === 'line') drawChoiceInfiniteLine(element);
        if (element.getType() === 'circle') drawChoiceCircle(element);
    }
}

/**
 * 绘制标签 过程函数
 * @param {Object} element 点对象
 */
function drawLabel(element) {
    if (!element.getShowName()) return;
    const [x, y] = element.getCoordinate();
    ct.font = `${20 / transform.scale}px serif`;
    const color = element.getColor();
    const backgroundColor = autoBackgroundColor(color);
    drawStrokedText(
        ct, 
        element.getName(), 
        x - 20 / transform.scale, 
        y - 15 / transform.scale, 
        color, 
        backgroundColor, 
        3 / transform.scale
    );
}

/**
 * 绘制点 过程函数
 * @param {Object} element 点对象
 */
function drawPoint(element) {
    const [x, y] = element.getCoordinate();
    const color = element.getColor();
    const backgroundColor = autoBackgroundColor(color);
    const outRadius = 8,
        inRadius = 4;

    ct.fillStyle = color;
    ct.beginPath();
    ct.arc(x, y, outRadius / transform.scale, 0, Math.PI * 2);
    ct.fill();

    ct.fillStyle = backgroundColor;
    ct.beginPath();
    ct.arc(x, y, inRadius / transform.scale, 0, Math.PI * 2);
    ct.fill();
}

/**
 * 绘制选中点 过程函数
 * @param {Object} point
 */
function drawChoicePoint(point) {
    const bigRadius = 12;
    const [x, y] = point.getCoordinate();
    const color = point.getColor();

    ct.strokeStyle = color;
    ct.beginPath();
    ct.arc(x, y, bigRadius / transform.scale, 0, Math.PI * 2);
    ct.lineWidth = 2 / transform.scale;
    ct.stroke();
}

/**
 * 绘制直线 过程函数
 * @param {Object} element 直线对象
 */
function drawInfiniteLine(element) {
    const coordList = element.getCoordinate();
    if (!coordList) return;
    const color = element.getColor();

    const [startX, startY] = coordList[0];
    const [endX, endY] = coordList[1];
    const bag = [startX, startY, endX, endY, canvasWidth, canvasHeight];
    const {
        p1,
        p2
    } = ToolsFunction.getLineBounds(bag, transform);

    const drawType = element.getDrawType();
    if (drawType === 'line') {
        ct.beginPath();
        ct.moveTo(p1.x, p1.y);
        ct.lineTo(p2.x, p2.y);
        ct.strokeStyle = color;
        ct.lineWidth = 4 / transform.scale;
        ct.stroke();
    }else if (drawType === 'ray') {
        ct.beginPath();
        ct.moveTo(startX, startY);
        if (startX < endX) {
            ct.lineTo(p2.x, p2.y);
        }else{
            ct.lineTo(p1.x, p1.y);
        }
        ct.strokeStyle = color;
        ct.lineWidth = 4 / transform.scale;
        ct.stroke();
    }else if (drawType === 'lineSegment') {
        ct.beginPath();
        ct.moveTo(startX, startY);
        ct.lineTo(endX, endY);
        ct.strokeStyle = color;
        ct.lineWidth = 4 / transform.scale;
        ct.stroke();
    }
}

/**
 * 绘制选中直线 过程函数
 * @param {Object} element 直线对象
 */
function drawChoiceInfiniteLine(element) {
    const coordList = element.getCoordinate();
    if (!coordList) return;
    const color = element.getColor();

    const [startX, startY] = coordList[0];
    const [endX, endY] = coordList[1];
    const bag = [startX, startY, endX, endY, canvasWidth, canvasHeight];
    const {
        p1,
        p2,
        p3,
        p4,
        p5,
        p6,
        p7,
        p8,
    } = ToolsFunction.getChoiceLineBounds(bag, transform);

    const drawType = element.getDrawType();
    if (drawType === 'line') {
        ct.beginPath();
        ct.moveTo(p1.x, p1.y);
        ct.lineTo(p2.x, p2.y);
        ct.strokeStyle = color;
        ct.lineWidth = 2 / transform.scale;
        ct.stroke();
        
        ct.beginPath();
        ct.moveTo(p3.x, p3.y);
        ct.lineTo(p4.x, p4.y);
        ct.strokeStyle = color;
        ct.lineWidth = 2 / transform.scale;
        ct.stroke();
    }else if (drawType === 'ray') {
        ct.beginPath();
        if (startX < endX) {
            ct.moveTo(p5.x, p5.y);
        }else{
            ct.moveTo(p6.x, p6.y);
        }
        if (startX < endX) {
            ct.lineTo(p2.x, p2.y);
        }else{
            ct.lineTo(p1.x, p1.y);
        }
        ct.strokeStyle = color;
        ct.lineWidth = 2 / transform.scale;
        ct.stroke();
        
        ct.beginPath();
        if (startX < endX) {
            ct.moveTo(p6.x, p6.y);
        }else{
            ct.moveTo(p5.x, p5.y);
        }
        if (startX < endX) {
            ct.lineTo(p4.x, p4.y);
        }else{
            ct.lineTo(p3.x, p3.y);
        }
        ct.strokeStyle = color;
        ct.lineWidth = 2 / transform.scale;
        ct.stroke();
    }else if (drawType === 'lineSegment') {
        ct.beginPath();
        ct.moveTo(p5.x, p5.y);
        ct.lineTo(p7.x, p7.y);
        ct.strokeStyle = color;
        ct.lineWidth = 2 / transform.scale;
        ct.stroke();
        
        ct.beginPath();
        ct.moveTo(p6.x, p6.y);
        ct.lineTo(p8.x, p8.y);
        ct.strokeStyle = color;
        ct.lineWidth = 2 / transform.scale;
        ct.stroke();
    }
}

/**
 * 绘制圆 过程函数
 * @param {Object} element 圆对象
 */
function drawCircle(element) {
    const coordList = element.getCoordinate();
    if (!coordList) return;
    const color = element.getColor();

    const [x1, y1] = coordList[0];
    const [x2, y2] = coordList[1];
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.hypot(dx, dy);

    ct.beginPath();
    ct.strokeStyle = color;
    ct.arc(x1, y1, distance, 0, 2 * Math.PI)
    ct.lineWidth = 4 / transform.scale;
    ct.stroke();
}

/**
 * 绘制选中圆 过程函数
 * @param {Object} element 圆对象
 */
function drawChoiceCircle(element) {
    const coordList = element.getCoordinate();
    if (!coordList) return;
    const color = element.getColor();

    const [x1, y1] = coordList[0];
    const [x2, y2] = coordList[1];
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.hypot(dx, dy);
    const offset = 6;

    ct.beginPath();
    ct.strokeStyle = color;
    ct.arc(x1, y1, distance + offset / transform.scale, 0, 2 * Math.PI)
    ct.lineWidth = 2 / transform.scale;
    ct.stroke();
    
    if (distance - offset / transform.scale < 0) return;
    ct.beginPath();
    ct.strokeStyle = color;
    ct.arc(x1, y1, distance - offset / transform.scale, 0, 2 * Math.PI)
    ct.lineWidth = 2 / transform.scale;
    ct.stroke();
}

/**
 * 清空画布 过程函数
 * 清空几何对象管理器的内容
 */
function clearCanvas() {
    geometryManager.deleteAll();
    drawContent();
    refreshToolFloating();
}

/**
 * 自调节对比颜色
 * @param {string} color 颜色字符串，格式为#123456
 * @returns {string} 对比色
 */
function autoBackgroundColor(color) {
    let count = 0;
    const opColor = color.slice(1);
    for (let i = 0; i < 6; i++) {
        if (i % 2 !== 0) continue;
        const index = hex.indexOf(opColor[i]);
        if (index > 12) count++;
    }
    if (count === 3) {
        return '#000000';
    }else{
        return '#ffffff';
    }
}
