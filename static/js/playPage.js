/* playPage.js */
/*
文件结构

initial
movesCounter
recordStorage
canvasEvent
menu
toolbar
exploreMode
designMode
thumbnail
storage
file
dropdown
dataLoad
resultVerify
*/

// initial
/**
 * 读取程序状态
 * @returns {string}
 */
function programmeStatus() {
    return 'play';
}

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
const canvasClipState = false;

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
let geometryElementLists = {
    all: new Set(),
    hidden: new Set(),
    initial: new Set(),
    name: new Set(),
    movepoints: new Set(),
    'result-1': new Set(),
    'completedShow-1': new Set(),
    explore: new Set(),
    rules: new Set(),
    itemHidden: new Set(),
};
function clearLists() {
    geometryElementLists = {
        all: new Set(),
        hidden: new Set(),
        initial: new Set(),
        name: new Set(),
        movepoints: new Set(),
        'result-1': new Set(),
        'completedShow-1': new Set(),
        explore: new Set(),
        rules: new Set(),
        itemHidden: new Set(),
    };
}

let displayId = [];
const playCanvasDisplay = ['initial'];
let goldGoalCanvasDisplay = [];
let playGoldCanvasDisplay = [];
/**
 * 设定图形显示
 * @param {string[]} list 
 */
function canvasDisplay(list) {
    goldGoalCanvasDisplay = list;
    playGoldCanvasDisplay = playCanvasDisplay.concat(goldGoalCanvasDisplay);
    let idSet = new Set();
    for (const value of playGoldCanvasDisplay) {
        const currentSet = geometryElementLists[value];
        idSet = new Set([...idSet, ...currentSet]);
    }
    const displayIdCache = [...idSet];
    showHiddenFigure(displayIdCache);
    displayId = displayIdCache;
}
function showHiddenFigure(listId) {
    const currentSet = new Set(listId);
    const statusSet = new Set(displayId);
    // 多出来的 -> 展示
    //const addSet = currentSet.difference(statusSet);
    for (const item of currentSet) {
        const element = geometryManager.get(item);
        element.modifyVisible(true);
    }
    // 少的 -> 隐藏
    const subSet = statusSet.difference(currentSet);
    for (const item of subSet) {
        const element = geometryManager.get(item);
        element.modifyVisible(false);
    }
}

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
let loadFlag = false;
let completeOnce = false;
let solve = false;
let goldGoal = [];



// movesCounter
let movesCounter = {
    e: 0,
    l: 0,
};

function clearMovesCounter() {
    movesCounter = {
        e: 0,
        l: 0,
    };
}

const movesCounterDE = document.getElementById("moves");
movesCounterDE.textContent = '0L 0E';

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
    movesCounterDE.textContent = `${movesL}L ${movesE}E`;
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
    movesCounterDE.textContent = `${movesL}L ${movesE}E`;
}

/* 刷新步数 */
function refreshMovesCounter() {
    const oriMoves = movesStorageManager.get();
    movesCounterDE.textContent = `${oriMoves.l}L ${oriMoves.e}E`;
}



// recordStorage
let recordStoragePlay = []; // recordId:string[]
// record: dict{id, name, geometryElement, storage, thumbnail, geometryElementLists}
/**
 * 加载存储记录
 */
function loadRecordStorage() {
    const recordStorageJSON = localStorage.getItem('recordStoragePlay');
    if (!recordStorageJSON) return;
    recordStoragePlay = JSON.parse(recordStorageJSON);
    
    loadRecordStorageDE();
}

function loadRecordStorageDE() {
    // 加载存储记录DE
    const container = document.getElementById("storage-item-list");
    container.innerHTML = "";
    for (const [index, id] of recordStoragePlay.entries()) {
        const dict = JSON.parse(localStorage.getItem(id));
        const recordItemDE = document.createElement("div");
        recordItemDE.setAttribute("class", "record-item");
        recordItemDE.setAttribute('data-action', `choice`);
        recordItemDE.setAttribute('data-id', dict.id);
        
        const indexTextDE = document.createElement("div");
        indexTextDE.textContent = index;
        indexTextDE.setAttribute("id", `record-${dict.id}-index`);
        indexTextDE.setAttribute('data-action', `choice`);
        indexTextDE.setAttribute('data-id', dict.id);
        indexTextDE.setAttribute('class', 'record-index');
        recordItemDE.appendChild(indexTextDE);
        
        const nameTextDE = document.createElement("div");
        nameTextDE.textContent = dict.name;
        nameTextDE.setAttribute("id", `record-${dict.id}-name`);
        nameTextDE.setAttribute('data-action', `choice`);
        nameTextDE.setAttribute('data-id', dict.id);
        recordItemDE.appendChild(nameTextDE);
        
        const renameButtonDE = document.createElement('div');
        renameButtonDE.setAttribute("class", 'storage-panel-button');
        renameButtonDE.setAttribute('data-action', 'rename-record');
        renameButtonDE.setAttribute('data-id', dict.id);
        const template = document.getElementById(`svg-edit`);
        if (template) {
            renameButtonDE.innerHTML = template.innerHTML;
        }
        recordItemDE.appendChild(renameButtonDE);
        
        container.appendChild(recordItemDE);
    }
}

/**
 * 获取日期和时间
 * returns {{date: string, time: string}}
 */
function getDateTime() {
    const now = new Date();
    
    // 获取日期和时间组件
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // 格式化显示
    const dateString = `${year}-${month}-${day}`;
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    return {date: dateString, time: timeString};
}

let recordStatus = "none";
let saveStatus = true;
// 存储记录面板
function recordPanel(event) {
    const action = event.target?.dataset.action;
    if (action === "add-record") {
        // 添加记录
        addRecord();        
    }else if (action === "delete-record") {
        // 按删除按钮
        const buttonListDE = document.getElementsByClassName("storage-panel-button");
        for (const itemDE of buttonListDE) {
            itemDE.classList.remove("active");
        }
        if (recordStatus === "delete") {
            recordStatus = "none";
        }else{
            recordStatus = "delete";
            document.getElementById("storage-panel-button-delete")?.classList.add("active");
        }
    }else if (action === "cover-record") {
        // 按复写按钮
        const buttonListDE = document.getElementsByClassName("storage-panel-button");
        for (const itemDE of buttonListDE) {
            itemDE.classList.remove("active");
        }
        if (recordStatus === "cover") {
            recordStatus = "none";
        }else{
            recordStatus = "cover";
            document.getElementById("storage-panel-button-cover")?.classList.add("active");
        }
    }else if (action === "rename-record") {
        // 按重命名按钮
        const name = prompt("重命名");
        if (!name) return;
        const recordId = event.target.dataset.id;
        const recordNameDE = document.getElementById(`record-${recordId}-name`);
        recordNameDE.textContent = name;
        const recordDict = JSON.parse(localStorage.getItem(recordId));
        recordDict.name = name;
        localStorage.setItem(recordId, JSON.stringify(recordDict));
        
    }else if (action === "choice") {
        // 选中记录
        if (recordStatus === "none") {
            let bool = true;
            if (!saveStatus) bool = confirm("注意：绘图区存在未保存的数据，确定覆盖吗？");
            if (!bool) return;
            
            saveStatus = true;
            const id = event.target.dataset.id;
            loadRecord(id);
        }else if (recordStatus === "delete") {
            const bool = confirm("确定删除此条记录吗？");
            if (!bool) return;
            
            const id = event.target.dataset.id;
            recordStoragePlay.splice(recordStoragePlay.indexOf(id), 1);
            localStorage.setItem("recordStoragePlay", JSON.stringify(recordStoragePlay));
            localStorage.removeItem(id);
            
            // 回显
            loadRecordStorageDE();
            
        }else if (recordStatus === "cover") {
            const bool = confirm("确定覆盖此条记录吗？");
            if (!bool) return;
            
            saveStatus = true;
            const id = event.target.dataset.id;
            const oriRecordDict = JSON.parse(localStorage.getItem(id));
            const recordDict = {
                id: id, 
                name: oriRecordDict.name,
                geometryElement: geometryManager.toStorage(), 
                storage: {
                    construct: storageManager.serialization(), 
                }
            };
            
            // 缩略图
            const thumbnail = {};
            const title_inf = document.getElementById("title_inf")?.textContent;
            if (title_inf) {
                thumbnail.title_input = title_inf;
            }else{
                thumbnail.title_input = null;
            }
            const body_inf = document.getElementById("body_inf")?.textContent;
            if (body_inf) {
                thumbnail.body_input = body_inf;
            }else{
                thumbnail.body_input = null;
            }
            const bottom_inf = document.getElementById("bottom_inf")?.textContent;
            if (bottom_inf) {
                thumbnail.bottom_input = bottom_inf;
            }else{
                thumbnail.bottom_input = null;
            }
            const thumbnailSrc = document.getElementById("thumbnail-picture")?.src;
            if (thumbnailSrc) {
                thumbnail.thumbnailSrc = thumbnailSrc;
            }else{
                thumbnail.thumbnailSrc = null;
            }
            recordDict.thumbnail = thumbnail;
            
            // 配置表
            const lists = {};
            for (const [key, value] of Object.entries(geometryElementLists)) {
                const list = [...value];
                lists[key] = list;
            }
            recordDict.geometryElementLists = lists;
            
            localStorage.setItem(id, JSON.stringify(recordDict));
        }
    }
    
    function loadRecord(id) {
        const dict = JSON.parse(localStorage.getItem(id));
        // 缩略图
        const thumbnail = dict.thumbnail;
        document.getElementById("title_input").value = thumbnail.title_input;
        document.getElementById("body_input").value = thumbnail.body_input;
        document.getElementById("bottom_input").value = thumbnail.bottom_input;
        document.getElementById("title_inf").textContent = thumbnail.title_input;
        document.getElementById("body_inf").textContent = thumbnail.body_input;
        document.getElementById("bottom_inf").textContent = thumbnail.bottom_input;

        const oriPictureDE = document.getElementById("thumbnail-picture");
        if (oriPictureDE) oriPictureDE.remove();
        if (thumbnail.thumbnailSrc) {
            const pictureDE = document.createElement('img');
            pictureDE.id = 'thumbnail-picture';
            pictureDE.src = thumbnail.thumbnailSrc;
            pictureDE.alt = "此处放置缩略图";
            const container = document.getElementById('thumbnail-picture-frame');
            container.appendChild(pictureDE);
        }
        
        // 选定栏
        const geometryElementListsLoad = dict.geometryElementLists;
        clearLists();
        for (const [key, value] of Object.entries(geometryElementListsLoad)) {
            geometryElementLists[key] = new Set(value);
        }
    
        // 几何对象
        geometryManager.loadStorage(dict.geometryElement);
        drawContent();
        
        // 历史记录
        const tempStorage = dict.storage;
        storageManager.deserialization(tempStorage.construct);
        refreshStorageButton();
    }
}

/**
 * 添加纪录
 */
function addRecord() {
    saveStatus = true;
    const len = recordStoragePlay.length;
    let recordId;
    for (let i = 0; i <= len; i++) {
        if (!recordStoragePlay.includes(`record-${i}`)) {
            recordId = `record-play-${i}`;
            break;
        }
    }
    recordStoragePlay.push(recordId);
    localStorage.setItem('recordStoragePlay', JSON.stringify(recordStoragePlay));
    
    const recordDict = {
        id: recordId, 
        name: `${getDateTime().date} ${getDateTime().time}`,
        geometryElement: geometryManager.toStorage(), 
        storage: {
            construct: storageManager.serialization(), 
        }
    };
    
    // 缩略图
    const thumbnail = {};
    const title_inf = document.getElementById("title_inf")?.textContent;
    if (title_inf) {
        thumbnail.title_input = title_inf;
    }else{
        thumbnail.title_input = null;
    }
    const body_inf = document.getElementById("body_inf")?.textContent;
    if (body_inf) {
        thumbnail.body_input = body_inf;
    }else{
        thumbnail.body_input = null;
    }
    const bottom_inf = document.getElementById("bottom_inf")?.textContent;
    if (bottom_inf) {
        thumbnail.bottom_input = bottom_inf;
    }else{
        thumbnail.bottom_input = null;
    }
    const thumbnailSrc = document.getElementById("thumbnail-picture")?.src;
    if (thumbnailSrc) {
        thumbnail.thumbnailSrc = thumbnailSrc;
    }else{
        thumbnail.thumbnailSrc = null;
    }
    recordDict.thumbnail = thumbnail;
    
    // 配置表
    const lists = {};
    for (const [key, value] of Object.entries(geometryElementLists)) {
        const list = [...value];
        lists[key] = list;
    }
    recordDict.geometryElementLists = lists;
    
    localStorage.setItem(recordId, JSON.stringify(recordDict));
    
    // 回显
    loadRecordStorageDE();
}



// canvasEvent
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



// menu
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

            geometryManagerResult.deleteAll();
            geometryManagerExplore.deleteAll();
            loadGeometryElementsStorage();
            
            storageManagerResult.clear();
            storageManagerExplore.clear();
            storageManagerResult.append(geometryManager.toStorage());
            storageManagerExplore.append(geometryManager.toStorage());
            refreshStorageButton();

            clearMovesCounter();
            movesStorageManagerResult.clear();
            movesStorageManagerExplore.clear();
            movesStorageManagerResult.append(movesCounter);
            movesStorageManagerExplore.append(movesCounter);
            refreshMovesCounter();

            unsuccess();
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
    }else if (action === "switch-file") {
        switchPanel("filePanel");
    }
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
    }else if (panel === "filePanel") {
        Object.values(tools).forEach((item) => item?.clear?.());
        refreshToolFloating();
        
        tool = "move";
        drawContent();
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



// toolbar
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



// exploreMode
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
        // 几何对象
        canvasDisplay(goldGoal);
        canvasGoldGoal(goldGoal);
        drawContent();
        refreshStorageButton();
        refreshMovesCounter();
        resultVerify();
    }else{
        exploreFlag = true;
        // 切换几何对象管理器
        geometryManager = geometryManagerExplore;
        storageManager = storageManagerExplore;
        movesStorageManager = movesStorageManagerExplore;
        // 按钮变色
        const buttonDE = document.getElementById('menu-button-item');
        buttonDE.classList.add('active');
        // 几何对象
        canvasDisplay(['explore']);
        canvasGoldGoal(['explore']);
        drawContent();
        refreshStorageButton();
        refreshMovesCounter();
    }
}



// designMode
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



// thumbnail
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



// storage
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
    resultVerify();
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
    resultVerify();
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
    saveStatus = false;
    const elements = geometryManager.toStorage();
    storageManager.append(elements);
    refreshStorageButton();
}



// file
const geometryElementListsChoice = {
    all: 'all',
    hidden: 'all',
}
const fileDownDict = {
    //ggb: 'Geogebra',
    geb: 'Geogebra-Euclidea-Blueprint',
}
const filePartDownDict = {
    jpg: 'Joint Photographic Experts Group',
    png: 'Portable Network Graphics',
}

const dropdownTriggerChoice = document.getElementById('dropdownTriggerChoice');
const dropdownMenuChoice = document.getElementById('dropdownMenuChoice');
const dropdownTriggerFileDown = document.getElementById('dropdownTriggerFileDown');
const dropdownMenuFileDown = document.getElementById('dropdownMenuFileDown');
const dropdownTriggerFilePartDown = document.getElementById('dropdownTriggerFilePartDown');
const dropdownMenuFilePartDown = document.getElementById('dropdownMenuFilePartDown');
const dropdownDEDict = {
    choice: [dropdownTriggerChoice, dropdownMenuChoice],
    //fileDown: [dropdownTriggerFileDown, dropdownMenuFileDown],
    filePartDown: [dropdownTriggerFilePartDown, dropdownMenuFilePartDown],
}
const dropdownValueDict = {
    choice: [Object.keys(geometryElementListsChoice)[0], geometryElementListsChoice],
    //fileDown: [Object.keys(fileDownDict)[0], fileDownDict],
    filePartDown: [Object.keys(filePartDownDict)[0], filePartDownDict],
}

// 初始化下拉菜单选项
function initDropdownOptions(index) {
    const dropdownMenu = dropdownDEDict[index][1];
    dropdownMenu.innerHTML = '';
    const Dict = dropdownValueDict[index][1];
    for (const key of Object.keys(Dict)) {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.id = key;
        option.dataset.action = `dropdown-${index}-${key}`;
        
        option.innerHTML = `
            <div class="option-label">${key}</div>
            <div class="option-checkmark">✓</div>
        `;
        
        // 添加点击事件
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            selectOption(index, key);
        });
        
        dropdownMenu.appendChild(option);
    }
}

// 选择选项
function selectOption(index, item) {
    // 更新当前选中状态
    const currentSelected = dropdownValueDict[index][0];
    if (currentSelected) {
        const prevOption = document.querySelector(`[data-id="${currentSelected}"]`);
        if (prevOption) {
            prevOption.classList.remove('selected');
        }
    }
    
    const currentOption = document.querySelector(`[data-id="${item}"]`);
    if (currentOption) {
        currentOption.classList.add('selected');
    }
    
    // 更新触发器显示
    const dropdownMenu = dropdownDEDict[index][1];
    const dropdownTrigger = dropdownDEDict[index][0];
    dropdownTrigger.querySelector('.placeholder').textContent = item;
    dropdownTrigger.classList.remove('open');
    
    // 存储当前选中
    dropdownValueDict[index][0] = item;
    updateSelect(index, item);
    
    // 关闭下拉菜单
    closeDropdown(dropdownMenu, dropdownTrigger);
}

function updateSelect(index, item) {
    if (index === 'choice') {
        updateSelectChoice(item);
    }else if (index === 'fileDown') {
        const spanDE = document.getElementById('file-down-text-type');
        spanDE.textContent = `.${item}`;
    }else if (index === 'filePartDown') {
        const spanDE = document.getElementById('file-part-down-text-type');
        spanDE.textContent = `.${item}`;
    }
}

// 切换下拉菜单显示/隐藏
function toggleDropdown(dropdownMenu, dropdownTrigger) {
    dropdownMenu.classList.toggle('show');
    dropdownTrigger.classList.toggle('open');
    const dropClass = new Array(dropdownMenu.classList);
    if (!dropClass.includes('show')) {
        // 1.检查位置
        const rect = dropdownTrigger.getBoundingClientRect();
        const bottomDistance = window.innerHeight - rect.bottom;
        if (bottomDistance < 300) {
            // 2.调整位置
            dropdownMenu.style.bottom = `${rect.height}px`;
            dropdownMenu.style.removeProperty('top');
        }else{
            dropdownMenu.style.top = `${rect.height}px`;
            dropdownMenu.style.removeProperty('bottom');
        }
    }
}

// 关闭下拉菜单
function closeDropdown(dropdownMenu, dropdownTrigger) {
    dropdownMenu.classList.remove('show');
    dropdownTrigger.classList.remove('open');
}

// 初始化事件监听
function initEventListeners(dropdownMenu, dropdownTrigger) {
    // 点击触发器切换下拉菜单
    dropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(dropdownMenu, dropdownTrigger);
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && !dropdownTrigger.contains(e.target)) {
            closeDropdown(dropdownMenu, dropdownTrigger);
        }
    });

    // 点击下拉菜单内部不关闭（事件冒泡已处理）
    dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// 设置可访问性属性
function setAccessibility(dropdownMenu, dropdownTrigger, index) {
    dropdownTrigger.setAttribute('role', 'combobox');
    dropdownTrigger.setAttribute('aria-haspopup', 'listbox');
    dropdownTrigger.setAttribute('aria-expanded', 'false');
    if (index === 'choice') {
        dropdownTrigger.setAttribute('data-action', 'overview-list');
    }
    dropdownMenu.setAttribute('role', 'listbox');
    
    dropdownTrigger.addEventListener('click', () => {
        const isExpanded = dropdownMenu.classList.contains('show');
        dropdownTrigger.setAttribute('aria-expanded', isExpanded);
    });
}

// 初始化
function dropdownInit() {
    for (const [index, dropdownDE] of Object.entries(dropdownDEDict)) {
        const dropdownMenu = dropdownDE[1];
        const dropdownTrigger = dropdownDE[0];
        initDropdownOptions(index);
        initEventListeners(dropdownMenu, dropdownTrigger);
        setAccessibility(dropdownMenu, dropdownTrigger, index);
        
        const dropdownDict = dropdownValueDict[index][1];
        // 默认选择第一项
        setTimeout(() => {
            selectOption(index, Object.keys(dropdownDict)[0]);
        }, 100);
    }
}

// 刷新
function dropdownRefresh() {
    for (const [index, dropdownDE] of Object.entries(dropdownDEDict)) {
        initDropdownOptions(index);
        
        const dropdownDict = dropdownValueDict[index][1];
        // 默认选择第一项
        setTimeout(() => {
            selectOption(index, Object.keys(dropdownDict)[0]);
        }, 100);
    }
}

/**
 * 文件面板点击
 * @param {Event} event 
 */
function filePanelClick(event) {
    const action = event.target.getAttribute("data-action");
    if (action === 'file-down') {
        alert('没做完呢');
    }else if (action === 'file-part-down') {
        // 文件类型
        const fileType = dropdownValueDict.filePartDown[0];

        // 绘制内容
        const dataURL = canvas.toDataURL("image/png");
        const canvas2 = document.createElement("canvas");
        canvas2.width = window.innerWidth;
        canvas2.height = window.innerHeight;
        const ct2 = canvas2.getContext('2d');
        const img = new Image();
        img.src = dataURL;
        img.onload = function() {
            ct2.drawImage(img, 0, 0);
        
            // 绘制步数
            const text = movesCounterDE.textContent;
            ct2.save();
            ct2.font = "20px serif";
            if (solve) ct2.fillStyle = 'gold';
            // 测量文本宽度并计算居中位置
            const textWidth = ct2.measureText(text).width;
            const x = (canvasWidth - textWidth) / 2;
            ct2.fillText(text, x, 25);
            ct2.restore();

            // 导出图片
            const dataURL2 = canvas2.toDataURL(`image/${fileType}`);
            const link = document.createElement("a");
            link.href = dataURL2;
            link.download = `egb_canvas.${fileType}`;
            link.click();
            setTimeout(() => {
                canvas2.remove();
                link.remove();
            }, 500);
        }
    }
}



// dataLoad
/**
 * 数据加载
 */
function playStartDataLoad() {
    // 缩略图
    const thumbnailJSON = sessionStorage.getItem('thumbnail');
    if (thumbnailJSON) {
        const thumbnail = JSON.parse(thumbnailJSON);
        document.getElementById("title_inf").textContent = thumbnail.title_input;
        document.getElementById("body_inf").textContent = thumbnail.body_input;
        document.getElementById("bottom_inf").textContent = thumbnail.bottom_input;

        if (thumbnail.pictureData) {
            const pictureDE = document.createElement('img');
            pictureDE.id = 'thumbnail-picture';
            pictureDE.src = thumbnail.pictureData;
            pictureDE.alt = "此处放置缩略图";
            const container = document.getElementById('thumbnail-picture-frame');
            container.appendChild(pictureDE);
        }
    }
    
    // 选定栏
    const geometryElementListsJSON = sessionStorage.getItem('geometryElementLists');
    clearLists();
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
            const elementId = item.id;

            // 选择列表涂色
            let findFlag = false;
            for (const listKey of Object.keys(geometryElementLists)) {
                const frontName = listKey.split('-')[0];
                if (geometryElementLists[listKey].has(elementId)) {
                    if (frontName === 'initial') {
                        element.modifyColor("#191919");
                        findFlag = true;
                        break;
                    }else if (frontName === 'movepoints') {
                        element.modifyColor('#0099ff');
                        findFlag = true;
                        break;
                    }else if (frontName === 'completedShow') {
                        element.modifyColor('#ffd700');
                        findFlag = true;
                        break;
                    }else if (frontName === 'explore') {
                        element.modifyColor('#ffd700');
                        findFlag = true;
                        break;
                    }
                }
            }
            if (!findFlag) {
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
                if (Object.keys(bases).includes('exclude')) {
                    currentElement.modifyBase(basesType, objectList, bases.value, bases.exclude);
                }else{
                    currentElement.modifyBase(basesType, objectList, bases.value);
                }
                objectList.forEach((item) => {
                    item.addSuperstructure(currentElement);
                });
            }else if (currentElementType === 'line' || currentElementType === 'circle') {
                currentElement.modifyDefine(basesType, objectList, bases.value);
            }
        }

        loadFlag = true;
        geometryManagerResult.geometryElementLists = geometryElementLists;
        geometryManagerExplore.geometryElementLists = geometryElementLists;
        canvasDisplay([]);
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

        element.modifyVisible(false);
        if (geometryElementLists.name.has(id)) {
            element.modifyShowName(true);
        }else{
            element.modifyShowName(false);
        }
        element.modifyName(name);
        element.modifyValid(valid);
        element.modifyColor(color);

        // 加载时把其他划分到元素隐藏列表
        const flag = geometryElementLists.initial.has(id) ||
            geometryElementLists.movepoints.has(id) ||
            geometryElementLists.name.has(id);
        if (!flag) geometryElementLists.itemHidden.add(id);
        return element;
    }
}



// resultVerify
/**
 * 几何对象同一判定
 * @returns {Promise} bool
 */
function resultVerifyFunction() {
    return new Promise((resolve) => {
        // 检测前初始化
        goldGoal = [];
        for (const listName of Object.keys(geometryElementLists)) {
            const frontName = listName.split('-')[0];
            if (frontName !== 'result') continue;
            
            const result = new Set();
            const length = geometryElementLists[listName].size;
            geometryElementLists[listName].forEach((id) => {
                const resultElement = geometryManager.get(id);
                const resultType = resultElement.getType();
                if (resultType === 'point') {
                    const elements = geometryManager.getAllByOrder();
                    for (const element of elements) {
                        // 类型判定
                        const type = element.getType();
                        if (type !== 'point') continue;
                        // 自身判定
                        const id2 = element.getId();
                        if (!geometryElementLists.initial.has(id2)) {
                            let findFlag = false;
                            for (const listName of Object.keys(geometryElementLists)) {
                                const frontName = listName.split('-')[0];
                                if (frontName !== 'completedShow') continue;
                                if (geometryElementLists[listName].has(id2)) findFlag = true;
                            }
                            if (findFlag) continue;
                            if (geometryElementLists.explore.has(id2)) continue;
                            if (id === id2) continue;
                        }
                        // 位置判定
                        const bool = ToolsFunction.pointEquative(resultElement, element);
                        if (bool) {
                            result.add(id);
                        }
                    }
                }else if (resultType === 'line') {
                    const elements = geometryManager.getAllByOrder();
                    for (const element of elements) {
                        // 类型判定
                        const type = element.getType();
                        if (type !== 'line') continue;
                        // 自身判定
                        const id2 = element.getId();
                        if (!geometryElementLists.initial.has(id2)) {
                            let findFlag = false;
                            for (const listName of Object.keys(geometryElementLists)) {
                                const frontName = listName.split('-')[0];
                                if (frontName !== 'completedShow') continue;
                                if (geometryElementLists[listName].has(id2)) findFlag = true;
                            }
                            if (findFlag) continue;
                            if (geometryElementLists.explore.has(id2)) continue;
                            if (id === id2) continue;
                        }
                        // 位置判定
                        const bool = ToolsFunction.lineEquative(resultElement, element);
                        if (bool) {
                            result.add(id);
                        }
                    }
                }else if (resultType === 'circle') {
                    const elements = geometryManager.getAllByOrder();
                    for (const element of elements) {
                        // 类型判定
                        const type = element.getType();
                        if (type !== 'circle') continue;
                        // 自身判定
                        const id2 = element.getId();
                        if (!geometryElementLists.initial.has(id2)) {
                            let findFlag = false;
                            for (const listName of Object.keys(geometryElementLists)) {
                                const frontName = listName.split('-')[0];
                                if (frontName !== 'completedShow') continue;
                                if (geometryElementLists[listName].has(id2)) findFlag = true;
                            }
                            if (findFlag) continue;
                            if (geometryElementLists.explore.has(id2)) continue;
                            if (id === id2) continue;
                        }
                        // 位置判定
                        const bool = ToolsFunction.circleEquative(resultElement, element);
                        if (bool) {
                            result.add(id);
                        }
                    }
                }
            });
            if (result.size === length && result.size !== 0) {
                const number = listName.split('-')[1];
                goldGoal.push(`completedShow-${number}`);
            }
        }

        if (goldGoal.length !== 0) {
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

    // 消息提示
    if (!completeOnce) {
        const pop = document.getElementById('complete-layout');
        pop.classList.add('trans');
        setTimeout(() => {
            pop.classList.remove('trans');
        }, 5000);
    }

    // 重绘
    canvasGoldGoal(goldGoal);
    canvasDisplay(goldGoal);
    drawContent();

    // 添加存储
    if (!completeOnce) addRecord();

    // 改变标志
    completeOnce = true;
    solve = true;
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

    // 重绘
    canvasGoldGoal(goldGoal);
    canvasDisplay(goldGoal);
    drawContent();

    // 改变标志
    solve = false;
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
    document.getElementById("filePanel").addEventListener("click", filePanelClick);
    document.getElementById("recordPanel").addEventListener("click", recordPanel);
    // 初始化
    playInit();
}
function playInit() {
    dropdownInit();
    updateLayout();
    resizeCanvas();
    canvasGoldGoal([]);
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