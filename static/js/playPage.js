/* playPage.js */

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
    point: {colorChoice: "autoPlayMode", color: "#191919"}, 
    line: {colorChoice: "autoPlayMode", color: "#191919"}, 
    circle: {colorChoice: "autoPlayMode", color: "#191919"}
};

// 几何对象管理器
const geometryManagerResult = new GeometryElementManager();
const geometryManagerExplore = new GeometryElementManager();
let geometryManager = geometryManagerResult;
geometryManagerResult.transform = transform;
geometryManagerResult.geometryStyle = geometryStyle;
geometryManagerExplore.transform = transform;
geometryManagerExplore.geometryStyle = geometryStyle;
const storageManagerResult = new StorageManager();
const movesStorageManagerResult = new MovesStorageManager();
const storageManagerExplore = new StorageManager();
const movesStorageManagerExplore = new MovesStorageManager();
let storageManager = storageManagerResult;
let movesStorageManager = movesStorageManagerResult;
const geometryElementLists = {
    hidden: new Set(),
    initial: new Set(),
    name: new Set(),
    movepoints: new Set(),
    result: new Set(),
    explore: new Set(),
};
geometryManagerResult.geometryElementLists = geometryElementLists;
geometryManagerExplore.geometryElementLists = geometryElementLists;

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

// 面板状态
let panelState;

const movesCounter = {
    e: 0,
    l: 0,
};

const movesCounterDE = document.getElementById("moves");
movesCounterDE.innerText = '0L 0E';

/* 刷新步数 */
function refreshMovesCounterByTool(event) {
    const type = event.detail.type;
    const moves = movesStorageManager.get();
    let movesE = moves.e;
    let movesL = moves.l;

    if (type === "middlePoint") {
        movesE += 4;
        movesL++;
    }else if (type === "center") {
        movesE += 5;
        movesL++;
    }else if (type === "line") {
        movesE += 1;
        movesL++;
    }else if (type === "circle") {
        movesE += 1;
        movesL++;
    }else if (type === "parallelLine") {
        movesE += 4;
        movesL++;
    }else if (type === "perpendicularLine") {
        movesE += 3;
        movesL++;
    }else if (type === "perpendicularBisector") {
        movesE += 3;
        movesL++;
    }else if (type === "angleBisector") {
        movesE += 4;
        movesL++;
    }else if (type === "compass") {
        movesE += 5;
        movesL++;
    }else if (type === "threePointCircle") {
        movesE += 7;
        movesL++;
    }
    
    movesCounter.e = movesE;
    movesCounter.l = movesL;
    movesCounterDE.innerText = `${movesL}L ${movesE}E`;
    movesStorageManager.append(movesCounter);
}

/* 刷新步数 */
function refreshMovesCounterByRestore(moves, flag) {
    const oriMoves = movesStorageManager.get();
    let movesE = oriMoves.e;
    let movesL = oriMoves.l;

    if (flag === 'restore') {
        movesCounter.e = movesE - moves.e;
        movesCounter.l = movesL - moves.l;
    }else if (flag === 'redo') {
        movesCounter.e = movesE + moves.e;
        movesCounter.l = movesL + moves.l;
    }
    movesCounterDE.innerText = `${movesL}L ${movesE}E`;
}

/* 刷新步数 */
function refreshMovesCounter() {
    const oriMoves = movesStorageManager.get();
    movesCounterDE.innerText = `${oriMoves.l}L ${oriMoves.e}E`;
}



let recordStorage; // recordId:string[]
/**
 * 加载存储记录
 */
function loadRecordStorage() {
    const recordStorageJSON = localStorage.getItem('recordStorage');
    if (!recordStorageJSON) return;
    recordStorage = JSON.parse(recordStorageJSON);
}

// 加载存储记录DE
function loadRecordStorageDE() {
    //
}

// 存储记录操作
function recordOperate(operate, value = null) {
    // 增加
    // 
}



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
    if (panel === "recordPanel") {
        Object.values(tools).forEach((item) => item.clear?.());
        refreshToolFloating();
        
        tool = "move";
        drawContent();
        loadRecordStorageDE();
    }else if (panel === "overviewPanel") {
        Object.values(tools).forEach((item) => item.clear?.());
        refreshToolFloating();
        
        tool = "move";
        drawContent();
        loadGeometryElements();
        if (exploreFlag) exploreMode();
    }else if (panel === "toolbarPanel") {
        choiceToolMenu("euclidea");
        refreshToolFloating();
    }
}

/**
 * 工具栏点击
 * @param {Object} e 事件
 */
function toolbarChoice(e) {
    const action = e.target.dataset.action;
    choiceTool(action);
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
        resultVerify();
    }else if (action === "redo") {
        redoStorage();
        resultVerify();
    }
}

/**
 * 菜单栏点击
 * @param {Object} e 事件
 */
function menuChoice(e) {
    const action = e.target.getAttribute("data-action");
    if (action === "clear-canvas") {
        const result = confirm("确认重新开始吗？");
        if (result) {
            clearCanvas();
            loadGeometryElementsStorage();
            drawContent();
            storageManager.clear();
            storageManager.append(geometryManager.getAllByOrder());
            movesStorageManager.clear();
            movesStorageManager.append({e: 0, l: 0});
            refreshStorageButton();
        }
    }else if (action === "close-menu") {
        closeMenu();
    }else if (action === "switch-construct") {
        switchPanel("toolbarPanel");
    }else if (action === "switch-overview") {
        switchPanel("overviewPanel");
    }else if (action === "design-mode") {
        designMode();
    }else if (action === "switch-record") {
        switchPanel("recordPanel");
    }else if (action === "explore-mode") {
        exploreMode();
    }
}

let exploreFlag = false;
/**
 * 探索模式
 */
function exploreMode() {
    if (exploreFlag) {
        exploreFlag = false;
        // 切换几何对象管理器
        geometryManager = geometryManagerResult;
        storageManager = storageManagerResult;
        movesStorageManager = movesStorageManagerResult;
        // 按钮变色
        const buttonDE = document.getElementById('menu-button-item');
        buttonDE.classList.remove('active');
        // 几何对象隐藏
        const ids = geometryElementLists.explore;
        ids.forEach((id) => {
            const element = geometryManager.get(id);
            element.modifyVisible(false);
        });
        drawContent();
        refreshStorageButton();
        refreshMovesCounter();
    }else{
        exploreFlag = true;
        // 切换几何对象管理器
        geometryManager = geometryManagerExplore;
        storageManager = storageManagerExplore;
        movesStorageManager = movesStorageManagerExplore;
        // 按钮变色
        const buttonDE = document.getElementById('menu-button-item');
        buttonDE.classList.add('active');
        // 几何对象显示
        const ids = geometryElementLists.explore;
        ids.forEach((id) => {
            const element = geometryManager.get(id);
            element.modifyVisible(true);
        });
        drawContent();
        refreshStorageButton();
        refreshMovesCounter();
    }
}

/**
 * 设计模式
 */
function designMode() {
    const transInterface = document.getElementById("trans-animated");
    transInterface.style.display = "flex";

    setTimeout(() => {
        transInterface.style.display = "none";
        window.location.href = "/";
    }, 3000);
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
    const moves = movesStorageManager.restore();
    refreshMovesCounterByRestore(moves, 'restore');
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
    const moves = movesStorageManager.redo();
    refreshMovesCounterByRestore(moves, 'redo');
}

window.addEventListener("storage", (event) => {
    storage();
    refreshMovesCounterByTool(event);
    resultVerify();
});
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
    "design-mode": {title: "设计模式", context: "切换到几何设计模式"},
    "explore-mode": {title: "探索模式", context: "显示所求几何对象，方便研究"},
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
function playStartDataLoad() {
    // 缩略图
    const thumbnailJSON = sessionStorage.getItem('thumbnail');
    if (thumbnailJSON) {
        const thumbnail = JSON.parse(thumbnailJSON);
        document.getElementById("title_inf").textContent = thumbnail.title_input;
        document.getElementById("body_inf").innerText = thumbnail.body_input;
        document.getElementById("bottom_inf").textContent = thumbnail.bottom_input;

        if (thumbnail.pictureData) {
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
    loadGeometryElementsStorage();
}

/**
 * 加载几何对象
 */
function loadGeometryElementsStorage() {
    const elementsJSON = sessionStorage.getItem('elements');
    if (elementsJSON) {
        const elements = JSON.parse(elementsJSON);

        // 1.反序列化为元素
        elements.forEach((item) => {
            const element = deserialization(item);
            geometryManagerResult.addObject(element);
            geometryManagerExplore.addObject(element);
            if (geometryElementLists.initial.has(item.id)) {
                element.modifyColor("#191919");
            }else if (geometryElementLists.movepoints.has(item.id)) {
                element.modifyColor('#0099ff');
            }else if (geometryElementLists.result.has(item.id)) {
                element.modifyColor('#ffd700');
            }else if (geometryElementLists.explore.has(item.id)) {
                element.modifyColor('#ffd700');
            }else{
                element.modifyColor(item.color);
            }
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
    
    function deserialization(elementDict) {
        const type = elementDict.type;
        const id = elementDict.id;
        const name = elementDict.name;
        const valid = elementDict.valid;
        const color = elementDict.color;
        
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

        if (geometryElementLists.initial.has(id)) {
            element.modifyVisible(true);
        }else{
            element.modifyVisible(false);
        }
        if (geometryElementLists.name.has(id)) {
            element.modifyShowName(true);
        }else{
            element.modifyShowName(false);
        }
        element.modifyName(name);
        element.modifyValid(valid);
        element.modifyColor(color);
        return element;
    }
}

/**
 * 几何对象同一判定
 * @returns {Promise} bool
 */
function resultVerifyFunction() {
    return new Promise((resolve) => {
        let count = 0;
        const length = geometryElementLists.result.size;
        geometryElementLists.result.forEach((id) => {
            const resultElement = geometryManager.get(id);
            const resultType = resultElement.getType();
            if (resultType === 'point') {
                const elements = geometryManager.getAllByOrder();
                for (const element of elements) {
                    const type = element.getType();
                    if (type !== 'point') continue;
                    const id2 = element.getId();
                    if (id === id2) continue;
                    const bool = ToolsFunction.pointEquative(resultElement, element);
                    if (bool) {
                        count++;
                    }
                }
            }else if (resultType === 'line') {
                const elements = geometryManager.getAllByOrder();
                for (const element of elements) {
                    const type = element.getType();
                    if (type !== 'line') continue;
                    const id2 = element.getId();
                    if (id === id2) continue;
                    const bool = ToolsFunction.lineEquative(resultElement, element);
                    if (bool) {
                        count++;
                    }
                }
            }else if (resultType === 'circle') {
                const elements = geometryManager.getAllByOrder();
                for (const element of elements) {
                    const type = element.getType();
                    if (type !== 'circle') continue;
                    const id2 = element.getId();
                    if (id === id2) continue;
                    const bool = ToolsFunction.circleEquative(resultElement, element);
                    if (bool) {
                        count++;
                    }
                }
            }
        });
        if (count === length) {
            resolve(true);
        }else{
            resolve(false);
        }
    });
}

/**
 * 所求验证
 */
async function resultVerify() {
    if (exploreFlag) return;
    const bool = await resultVerifyFunction();
    if (bool) {
        // 触发成功事件
        const event = new CustomEvent("success");
        window.dispatchEvent(event);
    }else{
        // 触发未成功事件
        const event = new CustomEvent("unsuccess");
        window.dispatchEvent(event);
    }
}

window.addEventListener("success", success);
/**
 * 完成几何构造
 */
function success() {
    // 步数字体变化
    const moves = document.getElementById('moves');
    moves.style.color = '#ffd700';
    moves.style.setProperty('font-weight', 'bold');

    // 几何对象显示
    const resultIds = geometryElementLists.result;
    resultIds.forEach((id) => {
        const element = geometryManager.get(id);
        element.modifyVisible(true);
    });

    // 消息提示
    const pop = document.getElementById('complete-layout');
    pop.classList.add('trans');
    setTimeout(() => {
        pop.classList.remove('trans');
    }, 5000);

    // 重绘
    drawContent();
}

window.addEventListener("unsuccess", unsuccess);
/**
 * 未完成几何构造
 */
function unsuccess() {
    // 步数字体变化
    const moves = document.getElementById('moves');
    moves.style.color = '#000000';
    moves.style.setProperty('font-weight', 'normal');

    // 几何对象隐藏
    const resultIds = geometryElementLists.result;
    resultIds.forEach((id) => {
        const element = geometryManager.get(id);
        element.modifyVisible(false);
    });

    // 重绘
    drawContent();
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
    choiceToolMenu('euclidea');
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
    refreshStorageButton();
    playStartDataLoad();
    storageManagerResult.setStatus(true);
    storageManagerExplore.setStatus(true);
    storageManagerResult.append(geometryManager.toStorage());
    storageManagerExplore.append(geometryManager.toStorage());
    movesStorageManagerResult.setStatus(true);
    movesStorageManagerExplore.setStatus(true);
    movesStorageManagerResult.append(movesCounter);
    movesStorageManagerExplore.append(movesCounter);
    loadRecordStorage();
}