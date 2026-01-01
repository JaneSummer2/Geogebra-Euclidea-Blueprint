/* index.js */
/*
数据交互

geometry.js
GeometryElementManager

toolsFunction.js
getLineBounds
myRound
*/

// 浏览器视口变化
const EQUIPMENT_WIDTH = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200,
}
let widthTypeEquipment;
function updateLayout() {
    const width = window.innerWidth;
    if (width < EQUIPMENT_WIDTH.MOBILE) {
        widthTypeEquipment = 'mobile';
    }else{
        widthTypeEquipment = 'tablet';
    }
}
window.addEventListener('resize', updateLayout);

let thumbnailSwitch = false;

// 手势变量
let startX, startY, startTime;
let isDragging = false;
let touchDoubleFlag = false;
let touchType = 1;
let mouseType = 0;
let pointerPosition = {
    x: 0,
    y: 0,
}
let preX, preY, preDistance, preScaleCenterX, preScaleCenterY;

// 存储型变换变量
let transform = {
    x: 0,
    y: 0,
    scale: 1,
};

// 存储样式变量
let geometryStyle = {
    point: {colorChoice: "auto", color: "#191919"}, 
    line: {colorChoice: "auto", color: "#191919"}, 
    circle: {colorChoice: "auto", color: "#191919"}
};

// 几何对象管理器
const geometryManager = new GeometryElementManager();
geometryManager.transform = transform;
geometryManager.geometryStyle = geometryStyle;
const storageManager = new StorageManager();
storageManager.setStatus(true);
storageManager.append({});

let geometryElementLists = {
    hidden: new Set(),
    initial: new Set(),
    name: new Set(),
    movepoints: new Set(),
    result: new Set(),
    explore: new Set(),
};

// 工具
const tools = {
    move: new MoveTool(),
    eraser: new EraserTool(),
    point: new PointTool(),
    line: new LineTool(),
    ray: new RayTool(),
    lineSegment: new LineSegmentTool(),
    circle: new CircleTool(),
    intersection: new IntersectionTool(),
    parallelLine: new ParallelConstructTool(),
    perpendicularLine: new PerpendicularConstructTool(),
    perpendicularBisector: new PerpendicularBisectorConstructTool(),
    middlePoint: new MiddlePointConstructTool(),
    threePointCircle: new ThreePointCircleConstructTool(),
    angleBisector: new AngleBisectorConstructTool(),
    compass: new CompassConstructTool(),
};

/**
 * 获取起始坐标 接口函数
 * @return {[startX, startY]}
 */
function getStart() {
    return [startX, startY];
}

function clearLists() {
    geometryElementLists = {
        hidden: new Set(),
        initial: new Set(),
        name: new Set(),
        movepoints: new Set(),
        result: new Set(),
        explore: new Set(),
    };
}

// 面板状态
let panelState;



/**
 * 触摸事件开始 过程函数
 * @param {Object} e 事件
 */
function touchstartEventFunction(e) {
    // 事件预处理
    e.preventDefault();
    const touches = e.touches;

    // 起始点记录
    startX = touches[0].clientX - canvasLeft;
    startY = touches[0].clientY - canvasTop;
    startTime = Date.now();

    pointerPosition.x = startX;
    pointerPosition.y = startY;
    preX = startX;
    preY = startY;
    // 坑点：touchstartEvent不能检测多指
    operateEventFunction("start", startX, startY);
}

/**
 * 触摸事件结束 过程函数
 * @param {Object} e 事件
 */
function touchendEventFunction(e) {
    // 事件预处理
    e.preventDefault();
    isDragging = false;

    // 计算终点
    const endX = e.changedTouches[0].clientX - canvasLeft;
    const endY = e.changedTouches[0].clientY - canvasTop;
    const duration = Date.now() - startTime;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaAbsX = Math.abs(deltaX);
    const deltaAbsY = Math.abs(deltaY);

    // 坑点：注意touchendEvent时点数是少的，且每松开一个手指就触发一次
    // 状态触发
    if (touchType === 1) {
        if (duration < 300 && deltaAbsX < 15 && deltaAbsY < 15) {
            // 点击
            operateEventFunction("click", endX, endY);
        } else {
            // 拖拽
            operateEventFunction("drawComplete", endX, endY);
        }
    }
    // 没有触点时还原
    if (e.touches.length === 0) {
        touchType = 1;
        touchDoubleFlag = false;
    }
}

/**
 * 触摸事件中断 过程函数
 * @param {Object} e 事件
 */
function touchcancelEventFunction(e) {
    // 还原
    isDragging = false;
    touchType = 1;
    touchDoubleFlag = false;
    drawContent();
    operateEventFunction("cancel", null, null);
}

/**
 * 触摸事件移动 过程函数
 * @param {Object} e 事件
 */
function touchmoveEventFunction(e) {
    // 预处理
    e.preventDefault();
    const touches = e.touches;
    refreshToolFloating();

    if (touches.length === 2) {
        // 双指
        if (!touchDoubleFlag) {
            // 起始坐标
            const x1 = touches[0].clientX - canvasLeft;
            const x2 = touches[1].clientX - canvasLeft;
            const y1 = touches[0].clientY - canvasTop;
            const y2 = touches[1].clientY - canvasTop;
            // 计算中心与距离
            const dx = x1 - x2;
            const dy = y1 - y2;
            preDistance = Math.sqrt(dx * dx + dy * dy);
            preScaleCenterX = (x1 + x2) / 2;
            preScaleCenterY = (y1 + y2) / 2;
            touchDoubleFlag = true;
        }
        // 目前坐标
        const x1 = touches[0].clientX - canvasLeft;
        const x2 = touches[1].clientX - canvasLeft;
        const y1 = touches[0].clientY - canvasTop;
        const y2 = touches[1].clientY - canvasTop;
        // 计算中心与距离
        const dx = x1 - x2;
        const dy = y1 - y2;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const currentScaleCenterX = (x1 + x2) / 2;
        const currentScaleCenterY = (y1 + y2) / 2;

        // 计算前后比例与移动
        const scale = currentDistance / preDistance;
        const currentScale = transform.scale * scale;
        // 计算旧逻辑坐标
        const oldLogicX = (preScaleCenterX - transform.x);
        const oldLogicY = (preScaleCenterY - transform.y);
        // 计算新偏移量，使逻辑点保持不变
        let offsetX, offsetY;
        if (currentScale <= maxScale && currentScale >= minScale) {
            offsetX = currentScaleCenterX - oldLogicX * scale;
            offsetY = currentScaleCenterY - oldLogicY * scale;
        } else {
            offsetX = currentScaleCenterX - oldLogicX;
            offsetY = currentScaleCenterY - oldLogicY;
        }

        // 变量存储
        limitLoad(offsetX, offsetY, currentScale);
        preX = offsetX;
        preY = offsetY;
        preDistance = currentDistance;
        preScaleCenterX = currentScaleCenterX;
        preScaleCenterY = currentScaleCenterY;
        touchType = 2;

    } else if (touches.length === 1 && touchType === 1) {
        // 单指
        const touch = touches[0];
        const x = touch.clientX - canvasLeft;
        const y = touch.clientY - canvasTop;
        const deltaX = x - startX;
        const deltaY = y - startY;

        pointerPosition.x = x;
        pointerPosition.y = y;
        if (tool === 'eraser' || subTool === 'style') drawContent();

        // 拖拽判定
        if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) {
            isDragging = true;
        }
        if (!isDragging) return;

        operateEventFunction("draw", x, y);
        touchType = 1;
    }
}

/**
 * 鼠标事件开始 过程函数
 * @param {Object} e 事件
 */
function mouseDownEventFunction(e) {
    e.preventDefault();
    const x = e.clientX - canvasLeft;
    const y = e.clientY - canvasTop;

    startX = x;
    startY = y;
    preX = startX;
    preY = startY;
    isDragging = true;
    startTime = Date.now();
    mouseType = e.button;

    operateEventFunction("start", x, y);
}

/**
 * 鼠标事件移动 过程函数
 * @param {Object} e 事件
 */
function mouseMoveEventFunction(e) {
    e.preventDefault();

    const x = e.clientX - canvasLeft;
    const y = e.clientY - canvasTop;
    pointerPosition.x = x;
    pointerPosition.y = y;
    if (tool === 'eraser' || subTool === 'style') drawContent();

    if (!isDragging) return;

    if (mouseType === 0) {
        // 左键
        operateEventFunction("draw", x, y);
    } else if (mouseType === 1) {
        // 中键
        canvas.classList.add('move-cursor');
        // 拖拽画布
        const currentDeltaX = x - preX;
        const currentDeltaY = y - preY;
        // 坑点：缩放的本质：缩放会放大物理像素的视觉效果，
        // 因此画布移动 Δx 自动对应为逻辑移动 Δx / scale。
        const currentX = (transform.x + currentDeltaX);
        const currentY = (transform.y + currentDeltaY);
        const currentScale = transform.scale;
        limitLoad(currentX, currentY, currentScale);
        preX = x;
        preY = y;
        
        // 拖拽显示
        refreshToolFloating();
    }
}

/**
 * 鼠标事件结束 过程函数
 * @param {Object} e 事件
 */
function mouseUpEventFunction(e) {
    e.preventDefault();
    isDragging = false;

    const endX = e.clientX - canvasLeft;
    const endY = e.clientY - canvasTop;
    const duration = Date.now() - startTime;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaAbsX = Math.abs(deltaX);
    const deltaAbsY = Math.abs(deltaY);

    if (duration < 300 && deltaAbsX < 15 && deltaAbsY < 15) {
        if (mouseType === 0) {
            operateEventFunction("click", endX, endY);
        }
    } else {
        if (mouseType === 0) {
            // 左键
            operateEventFunction("drawComplete", endX, endY);
        }else if (mouseType === 1) {
            // 中键
            canvas.classList.remove('move-cursor');
        }
    }
    mouseType = 0;
}

/**
 * 鼠标事件中断 过程函数
 * @param {Object} e 事件
 */
// 鼠标事件中断
function mouseCancelEventFunction(e) {
    e.preventDefault();
    operateEventFunction("cancel", null, null);
    isDragging = false;
    drawContent();
}

/**
 * 鼠标滚轮缩放 过程函数
 * @param {Object} e 事件
 */
function wheelEventFunction(e) {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1; // 缩小/放大
    const x = e.clientX - canvasLeft;
    const y = e.clientY - canvasTop;

    // 状态缓存
    const currentScale = transform.scale * zoomDelta;
    // 计算旧逻辑坐标（鼠标在缩放前的逻辑位置）
    const oldLogicX = (x - transform.x);
    const oldLogicY = (y - transform.y);
    // 计算新偏移量，使鼠标下的逻辑点保持不变
    let offsetX, offsetY;
    if (currentScale <= maxScale && currentScale >= minScale) {
        offsetX = x - oldLogicX * zoomDelta;
        offsetY = y - oldLogicY * zoomDelta;
    } else {
        offsetX = x - oldLogicX;
        offsetY = y - oldLogicY;
    }

    limitLoad(offsetX, offsetY, currentScale);
    refreshToolFloating();
}

// 电脑端：滚轮水平滚动
document.getElementById('container_toolbar').addEventListener('wheel', (e) => {
    e.preventDefault(); // 阻止默认垂直滚动
    document.getElementById('container_toolbar').scrollLeft += e.deltaY * 1.5; // 使用垂直滚轮量控制水平滚动
});

document.getElementById('menu_toolbar').addEventListener('wheel', (e) => {
    e.preventDefault(); // 阻止默认垂直滚动
    document.getElementById('menu_toolbar').scrollLeft += e.deltaY * 1.5; // 使用垂直滚轮量控制水平滚动
});

document.getElementById('floating-bar-buttons').addEventListener('wheel', (e) => {
    e.preventDefault(); // 阻止默认垂直滚动
    document.getElementById('floating-bar-buttons').scrollLeft += e.deltaY * 1.5; // 使用垂直滚轮量控制水平滚动
});

document.getElementById('floating-bar-elements').addEventListener('wheel', (e) => {
    e.preventDefault(); // 阻止默认垂直滚动
    document.getElementById('floating-bar-elements').scrollLeft += e.deltaY * 1.5; // 使用垂直滚轮量控制水平滚动
});



/**
 * 限制存储 过程函数
 * 把变换量存进变换表前，限制范围进行筛选
 * @param {number} currentX 当前的x变换偏移
 * @param {number} currentY 当前的y变换偏移
 * @param {number} currentScale 当前的缩放变换偏移
 */
function limitLoad(currentX, currentY, currentScale) {
    // 移动限制
    const tempX_1 = Math.max(currentX, minMoveX * transform.scale + canvasWidth);
    const tempX_2 = Math.min(tempX_1, maxMoveX * transform.scale);
    transform.x = tempX_2;
    const tempY_1 = Math.max(currentY, minMoveY * transform.scale + canvasHeight);
    const tempY_2 = Math.min(tempY_1, maxMoveY * transform.scale);
    transform.y = tempY_2;

    // 比例限制
    const tempScale_1 = Math.max(currentScale, minScale);
    const tempScale_2 = Math.min(tempScale_1, maxScale);
    transform.scale = tempScale_2;

    drawContent();
}

/**
 * 变换量还原 过程函数
 */
function resetTransform() {
    transform = {
        x: 0,
        y: 0,
        scale: 1,
    };
    drawContent();
}



/**
 * 打开菜单
 */
function openMenu() {
    document.getElementById("container_menu").style.display = "grid";
}

/**
 * 关闭菜单
 */
function closeMenu() {
    document.getElementById("container_menu").style.display = "none";
}

/**
 * 切换面板
 * @param {string} panel
 */
function switchPanel(panel) {
    const panels = document.getElementsByClassName("panel");
    for (const panel of panels) {
        panel.style.display = "none";
    }
    panelState = panel;
    // 样式类型
    document.getElementById(panel).style.display = "flex";
    if (panel === "overviewPanel") {
        Object.values(tools).forEach((item) => item?.clear?.());
        refreshToolFloating();
        
        tool = "move";
        drawContent();
        loadGeometryElements();
    }else if (panel === "toolbarPanel") {
        choiceToolMenu("general-bar");
        refreshToolFloating();
    }
}

/**
 * 工具菜单栏点击
 * @param {Object} e 事件
 */
function menuToolbarChoice(e) {
    const action = e.target.dataset.action;
    choiceToolMenu(action);
}

/**
 * 工具栏点击
 * @param {Object} e 事件
 */
function toolbarChoice(e) {
    const action = e.target.dataset.action;
    choiceTool(action);
    if (menuTool === 'construct') refreshMenuTool();
}

/**
 * 工具小项点击
 * @param {Object} e 事件
 */
function toolSwitchChoice(e) {
    const action = e.target?.dataset?.action;
    const type = e.target.getAttribute("class");
    if (type.includes("floating-svg-switch-button")) {
        choiceToolSwitch(action);
    }else if (type.includes("floating-svg-button") && !type.includes("disable")) {
        clickToolFloatingButton(action);
    }
}

/**
 * 更多栏点击
 * @param {Object} e 事件
 */
function morebarChoice(e) {
    const action = e.target.getAttribute("data-action");
    if (action === "open-menu") {
        openMenu();
    }else if (action === "restore") {
        restoreStorage();
    }else if (action === "redo") {
        redoStorage();
    }
}

/**
 * 菜单栏点击
 * @param {Object} e 事件
 */
function menuChoice(e) {
    const action = e.target.getAttribute("data-action");
    if (action === "clear-canvas") {
        const result = confirm("确认清除吗？");
        if (result) {
            clearCanvas();
            storageManager.clear();
            storageManager.append({});
            refreshStorageButton();
            clearLists();
        }
    }else if (action === "close-menu") {
        closeMenu();
    }else if (action === "switch-construct") {
        switchPanel("toolbarPanel");
    }else if (action === "switch-overview") {
        switchPanel("overviewPanel");
    }else if (action === "play-start") {
        playStart();
    }
}

/**
 * 游玩开始
 */
function playStart() {
    const transInterface = document.getElementById("trans-animated");
    transInterface.style.display = "flex";

    // 数据传输
    dataTransfer();

    setTimeout(() => {
        transInterface.style.display = "none";
        window.location.href = "/play";
    }, 3000);
}

/**
 * 数据传输
 */
function dataTransfer() {
    // 缩略图
    const title_input = document.getElementById("title_input").value;
    const body_input = document.getElementById("body_input").value;
    const bottom_input = document.getElementById("bottom_input").value;
    const picture = document.getElementById('thumbnail-picture');
    let pictureData;
    if (picture) {
        pictureData = picture.src;
    }
    
    const thumbnail = { title_input, body_input, bottom_input, pictureData };
    sessionStorage.setItem('thumbnail', JSON.stringify(thumbnail));
    
    // 选定栏
    const geometryElementDict = {};
    for (const [key, value] of Object.entries(geometryElementLists)) {
        // 因为JSON不支持Set，所以需要先转换为列表
        geometryElementDict[key] = [...value];
    }
    sessionStorage.setItem('geometryElementLists', JSON.stringify(geometryElementDict));
    
    // 几何对象
    const elements = [];
    const geometryElements = geometryManager.getAllByOrder();
    geometryElements.forEach((item) => elements.push(item.getDict()));
    sessionStorage.setItem('elements', JSON.stringify(elements));

    // 构造记录
    //const constructRecordJSON = storageManager.serialization();
    //sessionStorage.setItem('constructRecord', constructRecordJSON);
}



document.getElementById("thumbnail").addEventListener("click", thumbnailOpen);
/**
 * 打开缩略图
 */
function thumbnailOpen() {
    const thumbnail = document.getElementById("thumbnail");
    thumbnail.classList.add("open");
    const masks = document.getElementById("masks");
    masks.style.display = "block";
    const hiddenList = document.getElementsByClassName("hidden_inf");
    for (const item of hiddenList) item.style.display = 'flex';
}

document.getElementById("masks").addEventListener("click", thumbnailClose);
// 修改关闭按钮的事件监听器，阻止事件冒泡
document.getElementById("thumbnail-title-button").addEventListener("click", function(event) {
    event.stopPropagation(); // 阻止事件冒泡
    thumbnailClose();
});
/**
 * 关闭缩略图
 */
function thumbnailClose() {
    const thumbnail = document.getElementById("thumbnail");
    thumbnail.classList.remove("open");
    const masks = document.getElementById("masks");
    masks.style.display = "none";
    const hiddenList = document.getElementsByClassName("hidden_inf");
    for (const item of hiddenList) item.style.display = 'none';
}

document.getElementById("thumbnail-title-switch").addEventListener("click", switchEditPattern);
/**
 * 切换编辑模式
 */
function switchEditPattern() {
    if (thumbnailSwitch) {
        thumbnailSwitch = false;
        const inputList = document.getElementsByClassName("switch_input");
        for (const item of inputList) item.style.display = 'none';
        const flexList = document.getElementsByClassName("switch-flex");
        for (const item of flexList) item.style.display = 'none';
        const infList = document.getElementsByClassName("switch_inf");
        for (const item of infList) item.style.display = 'block';
        document.getElementById("thumbnail-title-switch").classList.remove("active");
        document.getElementById("title_inf").textContent = document.getElementById("title_input").value;
        document.getElementById("body_inf").innerText = document.getElementById("body_input").value;
        document.getElementById("bottom_inf").textContent = document.getElementById("bottom_input").value;
    }else{
        thumbnailSwitch = true;
        const inputList = document.getElementsByClassName("switch_input");
        for (const item of inputList) item.style.display = 'block';
        const flexList = document.getElementsByClassName("switch-flex");
        for (const item of flexList) item.style.display = 'flex';
        const infList = document.getElementsByClassName("switch_inf");
        for (const item of infList) item.style.display = 'none';
        document.getElementById("thumbnail-title-switch").classList.add("active");
    }
}

document.getElementById("thumbnail-screenshot-button").addEventListener("click", screenshot);
/**
 * 截图
 */
function screenshot() {
    var dataURL = canvas.toDataURL();

    let pictureDE = document.getElementById('thumbnail-picture');
    if (pictureDE) {
        pictureDE.src = dataURL;
    }else{
        pictureDE = document.createElement('img');
        pictureDE.id = 'thumbnail-picture';
        pictureDE.src = dataURL;
        pictureDE.alt = "此处放置缩略图";
    }

    const container = document.getElementById('thumbnail-middle');
    container.appendChild(pictureDE);
}

document.getElementById("thumbnail-clear-button").addEventListener("click", clearScreenshot);
/**
 * 清除截图
 */
function clearScreenshot() {
    const pictureDE = document.getElementById('thumbnail-picture');
    if (pictureDE) {
        pictureDE.remove();
    }
}



/**
 * 刷新存储按钮
 */
function refreshStorageButton() {
    const [topStatus, bottomStatus] = storageManager.getPointerStatus();
    document.getElementById("redo-button").classList.remove("disable");
    document.getElementById("restore-button").classList.remove("disable");
    if (topStatus) document.getElementById("redo-button").classList.add("disable");
    if (bottomStatus) document.getElementById("restore-button").classList.add("disable");
}

/**
 * 撤回
 */
function restoreStorage() {
    const [topStatus, bottomStatus] = storageManager.getPointerStatus();
    if (bottomStatus) return;

    const elements = storageManager.restore();
    if (elements) geometryManager.loadStorage(elements);
    refreshStorageButton();
    drawContent();
}

/**
 * 重做
 */
function redoStorage() {
    const [topStatus, bottomStatus] = storageManager.getPointerStatus();
    if (topStatus) return;
    
    const elements = storageManager.redo();
    if (elements) geometryManager.loadStorage(elements);
    refreshStorageButton();
    drawContent();
}

window.addEventListener("storage", storage);
function storage() {
    // 存储
    const elements = geometryManager.toStorage();
    storageManager.append(elements);
    refreshStorageButton();
}



const infDict = {
    "restore": {title: "撤销", context: "撤回上一步"},
    "redo": {title: "重做", context: "还原下一步"},
    "open-menu": {title: "菜单", context: "里面的功能主要针对全局"},
    "switch-construct": {title: "构造面板", context: ""},
    "switch-overview": {title: "几何元素一览面板", context: "可以查看所有的元素，快速编辑"},
    "clear-canvas": {title: "清空画布", context: ""},
    "play-start": {title: "游玩模式", context: "切换到几何构造模式"},
    "general-bar": {title: "通用工具栏", context: ""},
    "point-bar": {title: "点工具栏", context: ""},
    "line-bar": {title: "直线工具栏", context: ""},
    "circle-bar": {title: "圆工具栏", context: ""},
    "construct-bar": {title: "构造工具栏", context: ""},
    "move": {title: "移动工具", context: "可以拖动点、画布"},
    "point": {title: "点工具", context: "点击以创建一个点，可以拖动点以放置到几何对象上"},
    "eraser": {title: "橡皮擦工具", context: ""},
    "line": {title: "直线工具", context: ""},
    "circle": {title: "圆工具", context: ""},
    "intersection": {title: "交点工具", context: ""},
    "ray": {title: "射线工具", context: ""},
    "lineSegment": {title: "线段工具", context: ""},
    "parallelLine": {title: "平行线工具", context: ""},
    "perpendicularLine": {title: "垂线工具", context: ""},
    "perpendicularBisector": {title: "垂直平分线工具", context: ""},
    "angleBisector": {title: "角平分线工具", context: "有3点式和直线式两种构造模式"},
    "compass": {title: "圆规工具", context: "有3点式和复制式两种构造模式"},
    "middlePoint": {title: "中点工具", context: "构造两个点的中点，或构造圆心"},
    "threePointCircle": {title: "三点圆工具", context: "构造过三个点的圆"},
    "choiceDraw": {title: "选中拖拽模式", context: "可以选择几何对象，只能拖拽点"},
    "moveView": {title: "移动视图模式", context: "防误触几何对象"},
    "restoreTransform": {title: "还原画布变化量", context: "将画布的视图变换还原至初始值"},
    "clear": {title: "清空选择", context: "清空当前工具的选中栏"},
    "pointStyle": {title: "配置点样式", context: ""},
    "any": {title: "任意对象", context: "可选中任意几何对象"},
    "choicePoint": {title: "点对象", context: "仅选中点对象"},
    "style": {title: "样式刷", context: "拖拽以配置直线的样式为当前线工具样式"},
    "lineStyle": {title: "配置直线样式", context: ""},
    "circleStyle": {title: "配置圆样式", context: ""},
    "threePointAngleBisector": {title: "三点角平分线", context: "第二点为角的顶点"},
    "twoLineAngleBisector": {title: "角平分线", context: "构造两条直线的两条角平分线"},
    "threePointCompass": {title: "三点圆规", context: "两点距离为半径，第三点为圆心作圆"},
    "compassCopy": {title: "复制圆规", context: "复制一个圆"},
    "twoPointsMiddlePoint": {title: "中点", context: "构造两个点的中点"},
    "circleCenter": {title: "圆心", context: "构造一个圆的圆心"},
};
window.addEventListener("click", showInformationMobile);
/**
 * 加载信息
 */
function showInformationMobile(event) {
    if (widthTypeEquipment !== "mobile") return;
    const inf = event.target?.dataset.action;
    if (!inf) return;
    if (!Object.keys(infDict).includes(inf)) return;
    
    const infDE = document.getElementById("mobile-information");
    infDE.classList.add("active");
    
    const title = infDict[inf].title;
    const context = infDict[inf].context;
    infDE.innerHTML = `
        <p class="inf-title">${title}</p>
        <p class="inf-context">${context}</p>
    `;
    setTimeout(() => {
        infDE.classList.remove("active");
    }, 3000);
}

window.addEventListener("mousemove", showInformationDesktop)
/**
 * 加载信息
 */
function showInformationDesktop(event) {
    if (widthTypeEquipment !== "tablet") return;
    const infDE = document.getElementById("mobile-information");
    const documentElement = document.elementFromPoint(event.x, event.y);
    const inf = documentElement?.dataset.action;
    if (!inf) {
        infDE.classList.remove("active");
        return;
    }
    if (!Object.keys(infDict).includes(inf)) {
        infDE.classList.remove("active");
        return;
    }
    
    infDE.classList.add("active");
    
    const title = infDict[inf].title;
    const context = infDict[inf].context;
    infDE.innerHTML = `
        <p class="inf-title">${title}</p>
        <p class="inf-context">${context}</p>
    `;
}



/**
 * 数据加载
 */
function dataLoad() {
    // 缩略图
    const thumbnailJSON = sessionStorage.getItem('thumbnail');
    if (thumbnailJSON) {
        const thumbnail = JSON.parse(thumbnailJSON);
        document.getElementById("title_inf").textContent = thumbnail.title_input;
        document.getElementById("body_inf").innerText = thumbnail.body_input;
        document.getElementById("bottom_inf").textContent = thumbnail.bottom_input;
        document.getElementById("title_input").value = thumbnail.title_input;
        document.getElementById("body_input").value = thumbnail.body_input;
        document.getElementById("bottom_input").value = thumbnail.bottom_input;

        const picture = document.getElementById('thumbnail-picture');
        if (picture) {
            if (thumbnail.pictureData) {
                picture.src = thumbnail.pictureData;
            }else{
                picture.remove();
            }
        }else if (thumbnail.pictureData) {
            const pictureDE = document.createElement('img');
            pictureDE.id = 'thumbnail-picture';
            pictureDE.src = thumbnail.pictureData;
            pictureDE.alt = "此处放置缩略图";
            const container = document.getElementById('thumbnail-middle');
            container.appendChild(pictureDE);
        }
    }
    
    // 选定栏
    const geometryElementListsJSON = sessionStorage.getItem('geometryElementLists');
    if (geometryElementListsJSON) {
        const geometryElementListsLoad = JSON.parse(geometryElementListsJSON);
        for (const [key, value] of Object.entries(geometryElementListsLoad)) {
            geometryElementLists[key] = new Set(value);
        }
    }
    
    // 几何对象
    const elementsJSON = sessionStorage.getItem('elements');
    if (elementsJSON) {
        const elements = JSON.parse(elementsJSON);

        // 1.反序列化为元素
        elements.forEach((item) => {
            const element = deserialization(item);
            geometryManager.addObject(element);
        });

        // 2.添加元素间连接
        for (const item of elements) {
            const bases = item.base;
            const basesType = bases.type;

            if (basesType === 'none') continue;
            const id = item.id;
            const currentElement = geometryManager.get(id);
            const currentElementType = item.type;
            const objectList = [];
            bases.basesId.forEach((id) => {
                objectList.push(geometryManager.get(id));
            });
            if (currentElementType === 'point') {
                currentElement.modifyBase(basesType, objectList, bases.value);
                objectList.forEach((item) => {
                    item.addSuperstructure(currentElement);
                });
            }else if (currentElementType === 'line' || currentElementType === 'circle') {
                currentElement.modifyDefine(basesType, objectList, bases.value);
            }
        }

        drawContent();
    }

    // 构造记录
    //const constructRecordJSON = sessionStorage.getItem('constructRecord');
    //if (constructRecordJSON) storageManager.deserialization(constructRecordJSON);
    
    function deserialization(elementDict) {
        const type = elementDict.type;
        const id = elementDict.id;
        const name = elementDict.name;
        const visible = elementDict.visible;
        const valid = elementDict.valid;
        const color = elementDict.color;
        const showName = elementDict.showName;
        
        let element;
        if (type === 'point') {
            const x = elementDict.x;
            const y = elementDict.y;
            element = new Point(id, x, y);
        }else if (type === 'line') {
            element = new Line(id);
            element.modifyDrawType(elementDict.drawType);
        }else if (type === 'circle') {
            element = new Circle(id);
        }

        element.modifyName(name);
        element.modifyVisible(visible);
        element.modifyValid(valid);
        element.modifyShowName(showName);
        element.modifyColor(color);
        return element;
    }
}

// 加载完毕
document.addEventListener("DOMContentLoaded", DOMLoaded);

function DOMLoaded() {
    // 鼠标事件
    canvas.addEventListener("mousedown", mouseDownEventFunction);
    canvas.addEventListener("mousemove", mouseMoveEventFunction);
    canvas.addEventListener("mouseup", mouseUpEventFunction);
    document.addEventListener("mouseleave", mouseCancelEventFunction);
    canvas.addEventListener("wheel", wheelEventFunction);
    // 触摸事件
    canvas.addEventListener("touchstart", touchstartEventFunction);
    canvas.addEventListener("touchend", touchendEventFunction);
    canvas.addEventListener("touchmove", touchmoveEventFunction);
    canvas.addEventListener("touchcancel", touchcancelEventFunction);
    // 点击事件绑定
    document.getElementById("menu_toolbar").addEventListener("click", menuToolbarChoice);
    document.getElementById("container_toolbar").addEventListener("click", toolbarChoice);
    document.getElementById("floating-bar-buttons").addEventListener("click", toolSwitchChoice);
    document.getElementById("container_more").addEventListener("click", morebarChoice);
    document.getElementById("container_menu").addEventListener("click", menuChoice);
    document.getElementById("container_overview").addEventListener("click", selectElementByOverview);
    document.getElementById("geometry-item").addEventListener("click", geometryItemClick);
    // 初始化
    updateLayout();
    resizeCanvas();
    drawContent();
    switchPanel("toolbarPanel");
    refreshMenuTool();
    refreshStorageButton();
    dataLoad();
}