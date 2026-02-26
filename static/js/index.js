/* index.js */
/*
文件结构

initial
canvasClip
recordStorage
canvasEvent
menu
toolbar
playStart
file
thumbnail
storage
dropdown
dataLoad
*/

// initial
/**
 * 读取程序状态
 * @returns {string}
 */
function programmeStatus() {
    return 'design';
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
storageManager.append(geometryManager.toStorage());

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
};
geometryManager.geometryElementLists = geometryElementLists;

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
        all: new Set(),
        hidden: new Set(),
        initial: new Set(),
        name: new Set(),
        movepoints: new Set(),
        'result-1': new Set(),
        'completedShow-1': new Set(),
        explore: new Set(),
        rules: new Set(),
    };
}

// 面板状态
let panelState;
let resultNumber = 1;



// canvasClip
let canvasClipState = false;
let canvasClippingState = false;
let highlightX = 0;
let highlightY = 0;
let highlightWidth = 0;
let highlightHeight = 0;
function highlightZoneRestore() {
    highlightX = 0;
    highlightY = 0;
    highlightWidth = 0;
    highlightHeight = 0;
}
const img = new Image();

function canvasClipStart(event) {
    canvasClipState = true;
    const canvasContainer = document.getElementById('container_canvas');
    canvasContainer.classList.add('high-z');
    img.src = canvas.toDataURL();
    drawContent();
}

document.addEventListener('custom event end', canvasClipEnd);
function canvasClipEnd(event) {
    canvasClipState = false;
    canvasClippingState = false;
    const canvasContainer = document.getElementById('container_canvas');
    canvasContainer.classList.remove('high-z');
    drawContent();
    screenshot(highlightX, highlightY, highlightWidth, highlightHeight);
    highlightZoneRestore();
}



// recordStorage
let recordStorage = []; // recordId:string[]
// record: dict{id, name, geometryElement, storage, thumbnail, geometryElementLists}
/**
 * 加载存储记录
 */
function loadRecordStorage() {
    const recordStorageJSON = localStorage.getItem('recordStorage');
    if (!recordStorageJSON) return;
    recordStorage = JSON.parse(recordStorageJSON);
    
    loadRecordStorageDE();
}

function loadRecordStorageDE() {
    // 加载存储记录DE
    const container = document.getElementById("storage-item-list");
    container.innerHTML = "";
    for (const [index, id] of recordStorage.entries()) {
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
        saveStatus = true;
        const len = recordStorage.length;
        let recordId;
        for (let i = 0; i <= len; i++) {
            if (!recordStorage.includes(`record-${i}`)) {
                recordId = `record-${i}`;
                break;
            }
        }
        recordStorage.push(recordId);
        localStorage.setItem('recordStorage', JSON.stringify(recordStorage));
        
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
            recordStorage.splice(recordStorage.indexOf(id), 1);
            localStorage.setItem("recordStorage", JSON.stringify(recordStorage));
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
    if (canvasClipState) {
        canvasClippingState = true;
        return;
    }

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

    // 发送事件
    if (canvasClipState) {
        document.dispatchEvent(new CustomEvent('custom event end'));
        return;
    }

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
        if (canvasClippingState) {
            highlightX = startX;
            highlightY = startY;
            highlightWidth = deltaX;
            highlightHeight = deltaY;
            drawContent();
            return;
        }

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
    if (canvasClipState) {
        canvasClippingState = true;
        return;
    }

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
    if (canvasClippingState) {
        highlightX = startX;
        highlightY = startY;
        highlightWidth = x - startX;
        highlightHeight = y - startY;
        drawContent();
        return;
    }
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

    if (canvasClipState) {
        document.dispatchEvent(new CustomEvent('custom event end'));
        return;
    }

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
    }else if (action === "redo") {
        redoStorage();
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
    if (panel === "overviewPanel") {
        Object.values(tools).forEach((item) => item?.clear?.());
        refreshToolFloating();
        
        tool = "move";
        drawContent();
        loadGeometryElements();
    }else if (panel === "filePanel") {
        Object.values(tools).forEach((item) => item?.clear?.());
        refreshToolFloating();
        
        tool = "move";
        drawContent();
    }else if (panel === "recordPanel") {
        Object.values(tools).forEach((item) => item?.clear?.());
        refreshToolFloating();
        
        tool = "move";
        drawContent();
    }else if (panel === "toolbarPanel") {
        choiceToolMenu("general-bar");
        refreshToolFloating();
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
            clear();
        }
    }else if (action === "close-menu") {
        closeMenu();
    }else if (action === "switch-construct") {
        switchPanel("toolbarPanel");
    }else if (action === "switch-overview") {
        switchPanel("overviewPanel");
    }else if (action === "switch-file") {
        switchPanel("filePanel");
    }else if (action === "switch-record") {
        switchPanel("recordPanel");
    }else if (action === "play-start") {
        playStart();
    }
}

/**
 * 清空几何容器
 */
function clear() {
    clearCanvas();
    storageManager.clear();
    storageManager.append(geometryManager.toStorage());
    refreshStorageButton();
    clearLists();
}



// toolbar
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



// playStart
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
        // 缺省补全
        const strList = key.split('-');
        if (strList[0] === 'completedShow' && value.size === 0) {
            const keyName = `result-${strList[1]}`;
            geometryElementDict[key] = [...geometryElementLists[keyName]];
        }else if (strList[0] === 'explore' && value.size === 0) {
            geometryElementDict[key] = [...geometryElementLists["result-1"]];
        }else{
            geometryElementDict[key] = [...value];
        }
    }
    sessionStorage.setItem('geometryElementLists', JSON.stringify(geometryElementDict));
    
    // 几何对象
    const elements = [];
    const geometryElements = geometryManager.getAllByOrder();
    geometryElements.forEach((item) => elements.push(item.getDict()));
    sessionStorage.setItem('elements', JSON.stringify(elements));

    // 构造记录
    const constructRecordJSON = storageManager.serialization();
    sessionStorage.setItem('constructRecord', constructRecordJSON);
}



// file
/**
 * 文件面板点击
 * @param {Event} event 
 */
function filePanelClick(event) {
    const action = event.target.getAttribute("data-action");
    if (action === 'file-load') {
        const inputDE = document.createElement('input');
        inputDE.setAttribute('type', 'file');
        //inputDE.setAttribute('accept', '.gmt, .ggb, .geb');
        inputDE.setAttribute('accept', '.gmt');
        inputDE.addEventListener('change', fileLoad);
        inputDE.click();

        setTimeout(() => {
            inputDE.remove();
        }, 100);

    }else if (action === 'file-down') {
        // 文件类型
        const fileType = dropdownValueDict.fileDown[0];
        if (fileType === 'gmt') {
            const text = gmtFileDown();
            const textBlob = new Blob([text], {type: 'text/plain'});
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(textBlob);
            link.download = `geb.${fileType}`;
            link.click();
            setTimeout(() => {
                link.remove();
            }, 500);
        }
    }else if (action === 'file-part-down') {
        // 文件类型
        const fileType = dropdownValueDict.filePartDown[0];

        // 导出图片
        const dataURL = canvas.toDataURL(`image/${fileType}`);
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `geb_canvas.${fileType}`;
        link.click();
        setTimeout(() => {
            link.remove();
        }, 500);
    }
}

/**
 * 文件上传
 * @param {Event} event 
 */
async function fileLoad(event) {
    // 1. 获取选中的文件
    const file = event.target.files[0];
    if (!file) return;
    const fileName = file.name;
    const fileType = fileName.split('.').at(-1);

    // 2. 创建FormData对象并添加文件
    const formData = new FormData();
    formData.append('userFile', file); // 'userFile'应与后端接口参数名匹配
    formData.append('fileType', fileType);

    // 3. 使用fetch API发送请求
    try {
        const response = await fetch('/file_load', { // 请替换为实际的上传地址
            method: 'POST',
            body: formData,
            // 注意：使用fetch时，不要手动设置Content-Type头，浏览器会自动设置为multipart/form-data
        });

        if (!response.ok) throw new Error('未接收到返回值');

        const flagData = await response.json();
        const flag = flagData[0];
        if (!flag) {
            throw new Error(flagData[1]);
        }
        const localData = flagData[1];
        const localEvent = new CustomEvent('file load success', {
            detail: {data: localData, fileType: fileType}
        });
        document.dispatchEvent(localEvent);

    }catch(error) {
        console.error('文件解析失败：', error);
        const localEvent = new CustomEvent('file load error', {
            detail: {message: error}
        });
        document.dispatchEvent(localEvent);
    }
}

const fileProcessInformation = document.getElementById('file-process-information');
document.addEventListener('file load success', fileLoadSuccess);
document.addEventListener('file load error', fileLoadError);

/**
 * 文件加载成功
 * @param {Event} event 
 */
function fileLoadSuccess(event) {
    // 解析文件内容
    const localData = event.detail.data;
    const fileType = event.detail.fileType;
    clear();
    resetTransform();
    if (fileType === 'gmt') {
        gmtFileParse(localData);
    }else if (fileType === 'ggb') {
        const figureData = localData['figure_data'];
        const thumbnailData = localData['thumbnail'];
        console.log(figureData);

        const dictData = {'thumbnail': {'pictureData': thumbnailData}};
        const loadChoice = ['thumbnail'];
        dictDataLoad(dictData, loadChoice);
        ggbFileParse(figureData);
    }else if (fileType === 'geb') {
        //
    }

    // DOM回显
    fileProcessInformation.textContent = '';
    fileProcessInformation.classList.add('active');
    fileProcessInformation.textContent = '加载成功';
    setTimeout(() => {
        fileProcessInformation.classList.remove("active");
    }, 3000);
}

/**
 * base64转Blob
 * @param {string} base64 
 * @param {string} contentType 
 * @returns 
 */
function base64ToBlob(base64, contentType = '') {
   const byteCharacters = atob(base64);
   const byteArrays = [];
   for (let offset = 0; offset < byteCharacters.length; offset += 512) {
       const slice = byteCharacters.slice(offset, offset + 512);
       const byteNumbers = new Array(slice.length);
       for (let i = 0; i < slice.length; i++) {
           byteNumbers[i] = slice.charCodeAt(i);
       }
       const byteArray = new Uint8Array(byteNumbers);
       byteArrays.push(byteArray);
   }
   return new Blob(byteArrays, { type: contentType });
}

/**
 * 解析gmt文件
 * @param {Object} localData 
 */
function gmtFileParse(localData) {
    const fileObjectData = JSON.parse(localData);
    const fileObjectList = fileObjectData.statements;
    // 逐项解析并添加
    for (const item of fileObjectList) {
        const objectType = item.type;
        if (objectType === 'assignment') {
            const name = item.name;
            const value = item.value;
            const figureType = value.type;
            if (figureType === 'point') {
                // 自由点
                const x = value.x;
                const y = value.y;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'point';
                dict.x = x + window.innerWidth / 2;
                dict.y = y + window.innerHeight / 2;
                dict.base = {type: "none"};

                createElement(dict);
            }else if (figureType === 'line') {
                // 直线
                const pointIds = value.points;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'line';
                dict.base = {type: 'twoPoints', basesId: pointIds, value: 0};
                dict.drawType = 'line';

                createElement(dict);
            }else if (figureType === 'circle') {
                // 圆
                const centerId = value.center;
                const pointId = value.point;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'circle';
                dict.base = {type: 'twoPoints', basesId: [centerId, pointId], value: 0};

                createElement(dict);
            }else if (figureType === 'intersect') {
                // 交点
                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'point';
                dict.x = 0;
                dict.y = 0;
                dict.base = {type: 'intersection', 
                    basesId: value.objects, 
                    value: value.index,
                    exclude: value.exclude};

                createElement(dict);
            }else if (figureType === 'line_point') {
                // 线上点
                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'point';
                dict.x = 0;
                dict.y = 0;
                dict.base = {type: 'online', 
                    basesId: [value.object], 
                    value: value.ratio};

                createElement(dict);
            }else if (figureType === 'segment') {
                // 线段
                const pointIds = value.points;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'line';
                dict.base = {type: 'twoPoints', basesId: pointIds, value: 0};
                dict.drawType = 'lineSegment';

                createElement(dict);
            }else if (figureType === 'ray') {
                // 射线
                const pointIds = value.points;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'line';
                dict.base = {type: 'twoPoints', basesId: pointIds, value: 0};
                dict.drawType = 'ray';

                createElement(dict);
            }else if (figureType === 'circle3') {
                // 三点圆
                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'circle';
                dict.base = {type: 'threePointCircle', basesId: value.points, value: 0};

                createElement(dict);
            }else if (figureType === 'compass') {
                // 圆规
                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'circle';
                dict.base = {type: 'compass', basesId: value.points, value: 0};

                createElement(dict);
            }else if (figureType === 'angle_bisector') {
                // 角平分线
                const pointIds = value.points;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'line';
                dict.base = {type: 'threePointAngleBisector', basesId: pointIds, value: 0};
                dict.drawType = 'line';

                createElement(dict);
            }else if (figureType === 'perpendicular') {
                // 垂线
                const pointId = value.point;
                const lineId = value.object;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'line';
                dict.base = {type: 'perpendicular', basesId: [pointId, lineId], value: 0};
                dict.drawType = 'line';

                createElement(dict);
            }else if (figureType === 'perpendicular_bisector') {
                // 垂直平分线
                const pointIds = value.points;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'line';
                dict.base = {type: 'perpendicularBisector', basesId: pointIds, value: 0};
                dict.drawType = 'line';

                createElement(dict);
            }else if (figureType === 'parallel') {
                // 平行线
                const pointId = value.point;
                const lineId = value.object;

                const dict = {};
                dict.id = name;
                dict.name = name;
                dict.type = 'line';
                dict.base = {type: 'parallel', basesId: [pointId, lineId], value: 0};
                dict.drawType = 'line';

                createElement(dict);
            }
        }else if (objectType === 'initial') {
            const objectIdList = item.objects;
            geometryElementLists.initial = new Set(objectIdList);
        }else if (objectType === 'movepoints') {
            const objectIdList = item.points;
            geometryElementLists.movepoints = new Set(objectIdList);
        }else if (objectType === 'named') {
            const objectIdList = item.objects;
            const nameList = [];
            for (const item of objectIdList) {
                const nameFront = item['name_front'];
                const nameBack = item['name_back'];
                nameList.push(nameFront);
                if (nameFront !== nameBack) {
                    const element = geometryManager.get(nameFront);
                    element.modifyName(nameBack);
                }
            }
            geometryElementLists.name = new Set(nameList);
        }else if (objectType === 'result') {
            // 定位当前没有的result项
            let findFlag = false;
            let count = 1;
            let resultName = 'result-1';
            while (!findFlag) {
                resultName = `result-${count}`;
                if (Object.keys(geometryElementLists).includes(resultName)) {
                    findFlag = true;
                    break;
                }
                count++;
            }
            const displayName = `completedShow-${count}`;
            setRefreshOverviewResultNumber(count);

            geometryElementLists[resultName] = new Set(item.result);
            if (item.display) geometryElementLists[displayName] = new Set(item.display);
        }else if (objectType === 'explore') {
            const objectIdList = item.objects;
            geometryElementLists.explore = new Set(objectIdList);
        }else if (objectType === 'rules') {
            const objectIdList = item.expressions;
            geometryElementLists.rules = objectIdList;
        }
    }

    setTimeout(() => {
        playStart();
    }, 500);


    /**
     * 生成元素
     * @param {{type: string, 
     *          id: string, 
     *          name: string, 
     *          x?: number, 
     *          y?: number, 
     *          drawType?: string}} elementDict 
     * @returns {Object}
     */
    function deserialization(elementDict) {
        const type = elementDict.type;
        const id = elementDict.id;
        const name = elementDict.name;
        
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
        return element;
    }

    /**
     * 生成元素
     * @param {{type: string, 
     *          id: string, 
     *          name: string, 
     *          x?: number, 
     *          y?: number, 
     *          drawType?: string,
     *          base: {type: string, 
     *              basesId?: string[], 
     *              value?: number, 
     *              exclude?: string}
     *          }} dict 
     */
    function createElement(dict) {
        // 1.添加元素
        const element = deserialization(dict);
        geometryManager.addObject(element);

        // 2.添加元素间连接
        const bases = dict.base;
        const basesType = bases.type;

        if (basesType === 'none') return;
        const id = dict.id;
        const currentElement = geometryManager.get(id);
        const currentElementType = dict.type;
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

        drawContent();
    }
}

/**
 * 解析ggb文件
 * @param {Object} localData 
 */
function ggbFileParse(localData) {
    //return;
    const fileObjectData = localData;
    const fileObjectList = fileObjectData.geogebra.construction.element;
    const operateList = fileObjectData.geogebra.construction.command;
    const figureLabel = {};
    const multipleLabel = {};
    // 逐项解析并添加
    for (const item of fileObjectList) {
        const name = item['@label'];
        const figureType = item['@type'];
        if (figureType === 'point') {
            // 判断点类型
            let pointType = 'none';
            for (const [index, item2] of operateList.entries()) {
                const outputList = Object.values(item2['output']);
                if (!outputList.includes(name)) continue;

                const item2Type = item2['@name'];
                if (item2Type === 'Point') {
                    pointType = 'online';
                    figureLabel[name] = index;
                }else if (item2Type === 'Intersect') {
                    pointType = 'intersection';
                    figureLabel[name] = index;
                    if (outputList.length > 1) {
                        multipleLabel[name] = outputList.indexOf(name);
                    }
                }else if (item2Type === 'Midpoint') {
                    pointType = 'middlePoint';
                    figureLabel[name] = index;
                }else if (item2Type === 'Center') {
                    pointType = 'center';
                    figureLabel[name] = index;
                }
            }

            const dict = {};
            dict.id = item['@label'];
            if (Object.keys(item).includes('caption')) {
                dict.name = item['caption']['@val'];
            }else{
                dict.name = item['@label'];
            }
            dict.type = 'point';
            const color = [item['objColor']['@r'],
                item['objColor']['@g'],
                item['objColor']['@b'],];
            dict.color = rgbToHex(color);
            if (item['show']['@object'] === 'true') {
                dict.visible = true;
            }else{
                dict.visible = false;
            }
            if (item['show']['@label'] === 'true') {
                dict.showName = true;
            }else{
                dict.showName = false;
            }

            if (pointType === 'none') {
                // 自由点
                const x = item['coords']['@x'];
                const y = item['coords']['@y'];
                
                dict.x = x + window.innerWidth / 2;
                dict.y = y + window.innerHeight / 2;
                dict.base = {type: "none"};

                createElement(dict);
            }else if (pointType === 'intersection') {
                // 交点
                dict.x = 0;
                dict.y = 0;
                const baseFigure = operateList[figureLabel[name]];
                const id1 = baseFigure['@a0'];
                const id2 = baseFigure['@a1'];
                let index = 0;
                if (Object.keys(baseFigure).includes('@a2')) {
                    index = baseFigure['@a2'];
                }else{
                    index = multipleLabel[name];
                }
                const ids = [id1, id2];
                const [excludeFlag, excludeSet] = ToolsFunction.excludePoint([element1, element2]);
                const exclude = [...excludeSet][0].getId();
                if (excludeFlag) {
                    dict.base = {type: 'intersection', 
                        basesId: ids, 
                        value: index,
                        exclude: exclude};
                }else{
                    dict.base = {type: 'intersection', 
                        basesId: ids, 
                        value: index};
                }
                
                createElement(dict);
            }else if (figureType === 'online') {
                // 线上点
                const x = item['coords']['@x'];
                const y = item['coords']['@y'];
                const baseFigure = operateList[figureLabel[name]];
                const id = baseFigure['@a0'];
                const figure = geometryManager.get(id);
                const figureType = figure.getType();
                let ratio = 0;
                if (figureType === 'line') {
                    ratio = ToolsFunction.nearPointOnLineElement(figure, [x, y]);
                }else if (figureType === 'circle') {
                    ratio = ToolsFunction.nearPointOnCircleElement(figure, [x, y]);
                }
                dict.base = {type: 'online', 
                    basesId: [id], 
                    value: ratio};

                createElement(dict);
            }else if (figureType === 'middlePoint') {
                // 中点
                const id1 = baseFigure['@a0'];
                const id2 = baseFigure['@a1'];
                const ids = [id1, id2];
                const baseFigure = operateList[figureLabel[name]];
                dict.base = {type: 'middlePoint', 
                    basesId: ids};

                createElement(dict);
            }else if (figureType === 'center') {
                // 圆心
                const id = baseFigure['@a0'];
                const baseFigure = operateList[figureLabel[name]];
                dict.base = {type: 'center', 
                    basesId: [id]};

                createElement(dict);
            }
        }else if (figureType === 'line') {
            // 直线
            // 判断类型
            let lineType = 'none';
            for (const [index, item2] of operateList.entries()) {
                const outputList = Object.values(item2['output']);
                if (!outputList.includes(name)) continue;

                const item2Type = item2['@name'];
                if (item2Type === 'Line') {
                    const figures = Object.values(item2['@input']);
                    const element1Id = figures[0];
                    const element2Id = figures[1];
                    const element1 = geometryManager.get(element1Id);
                    const element2 = geometryManager.get(element2Id);
                    const element1Type = element1.getType();
                    const element2Type = element2.getType();
                    if (element1Type === 'line' || element2Type === 'line') {
                        lineType = 'parallel';
                    }else{
                        lineType = 'twoPoints';
                    }
                    figureLabel[name] = index;
                }else if (item2Type === 'OrthogonalLine') {
                    lineType = 'perpendicular';
                    figureLabel[name] = index;
                }else if (item2Type === 'LineBisector') {
                    lineType = 'perpendicularBisector';
                    figureLabel[name] = index;
                }else if (item2Type === 'AngularBisector') {
                    if (item2['input'].length === 3) {
                        lineType = 'threePointAngleBisector';
                    }else if (item2['input'].length === 2) {
                        lineType = 'twoLineAngleBisector';
                        if (outputList.length > 1) {
                            multipleLabel[name] = outputList.indexOf(name);
                        }
                    }
                    figureLabel[name] = index;
                }
            }

            const dict = {};
            dict.id = item['@label'];
            if (Object.keys(item).includes('caption')) {
                dict.name = item['caption']['@val'];
            }else{
                dict.name = item['@label'];
            }
            dict.type = 'line';
            dict.drawType = 'line';
            const color = [item['objColor']['@r'],
                item['objColor']['@g'],
                item['objColor']['@b'],];
            dict.color = rgbToHex(color);
            if (item['show']['@object'] === 'true') {
                dict.visible = true;
            }else{
                dict.visible = false;
            }
            if (item['show']['@label'] === 'true') {
                dict.showName = true;
            }else{
                dict.showName = false;
            }

            if (lineType === 'twoPoints') {
                const pointIds = Object.values(operateList[figureLabel[name]]['@input']);
                dict.base = {type: 'twoPoints', basesId: pointIds, value: 0};
                createElement(dict);
            }else if (lineType === 'parallel') {
                const figureList = Object.values(operateList[figureLabel[name]]['@input']);
                const element1Id = figureList[0];
                const element1 = geometryManager.get(element1Id);
                const element1Type = element1.getType();
                if (element1Type === 'line') {
                    dict.base = {type: 'parallel', basesId: [element1Id, figureList[1]], value: 0};
                }else{
                    dict.base = {type: 'parallel', basesId: [figureList[1], element1Id], value: 0};
                }
                createElement(dict);
            }else if (lineType === 'perpendicular') {
                const figureList = Object.values(operateList[figureLabel[name]]['@input']);
                const element1Id = figureList[0];
                const element1 = geometryManager.get(element1Id);
                const element1Type = element1.getType();
                if (element1Type === 'line') {
                    dict.base = {type: 'perpendicular', basesId: [element1Id, figureList[1]], value: 0};
                }else{
                    dict.base = {type: 'perpendicular', basesId: [figureList[1], element1Id], value: 0};
                }
                createElement(dict);
            }else if (lineType === 'perpendicularBisector') {
                const pointIds = Object.values(operateList[figureLabel[name]]['@input']);
                dict.base = {type: 'perpendicularBisector', basesId: pointIds, value: 0};
                createElement(dict);
            }else if (lineType === 'threePointAngleBisector') {
                const pointIds = Object.values(operateList[figureLabel[name]]['@input']);
                dict.base = {type: 'threePointAngleBisector', basesId: pointIds, value: 0};
                createElement(dict);
            }else if (lineType === 'twoLineAngleBisector') {
                const lineIds = Object.values(operateList[figureLabel[name]]['@input']);
                dict.base = {type: 'twoLineAngleBisector', basesId: lineIds, value: multipleLabel[name]};
                createElement(dict);
            }
        }else if (figureType === 'circle') {
            // 圆
            // 判断类型
            let circleType = 'none';
            for (const [index, item2] of operateList.entries()) {
                const outputList = Object.values(item2['output']);
                if (!outputList.includes(name)) continue;

                const item2Type = item2['@name'];
                if (item2Type !== 'Circle') continue;

                if (Object.values(item2['input']).length > 2) {
                    // 三点圆
                    circleType = 'threePointCircle';
                    figureLabel[name] = index;
                }else if (Object.values(item2['input']).length === 2) {
                    const param2 = item2['input']['@a1'];
                    if (param2.includes('Segment')) {
                        // 三点圆规
                        circleType = 'compass';
                        figureLabel[name] = index;
                    }else if (param2.includes('Radius')) {
                        // 复制圆规
                        circleType = 'copyCompass';
                        figureLabel[name] = index;
                    }else{
                        // 圆
                        circleType = 'twoPoints';
                        figureLabel[name] = index;
                    }
                }
            }

            const dict = {};
            dict.id = item['@label'];
            if (Object.keys(item).includes('caption')) {
                dict.name = item['caption']['@val'];
            }else{
                dict.name = item['@label'];
            }
            dict.type = 'circle';
            const color = [item['objColor']['@r'],
                item['objColor']['@g'],
                item['objColor']['@b'],];
            dict.color = rgbToHex(color);
            if (item['show']['@object'] === 'true') {
                dict.visible = true;
            }else{
                dict.visible = false;
            }
            if (item['show']['@label'] === 'true') {
                dict.showName = true;
            }else{
                dict.showName = false;
            }

            if (circleType === 'twoPoints') {
                const pointIds = Object.values(operateList[figureLabel[name]]['@input']);
                dict.base = {type: 'twoPoints', basesId: pointIds, value: 0};
                createElement(dict);
            }else if (circleType === 'compass') {
                const paramList = Object.values(operateList[figureLabel[name]]['@input']);
                const centerId = paramList[0];
                const pointIdList = ToolsFunction.stringArraySplit(paramList[1]);
                const pointId1 = pointIdList[0];
                const pointId2 = pointIdList[1];
                dict.base = {type: 'compass', basesId: [centerId, pointId1, pointId2], value: 0};
                createElement(dict);
            }else if (circleType === 'copyCompass') {
                const paramList = Object.values(operateList[figureLabel[name]]['@input']);
                const centerId = paramList[0];
                const pointIdList = ToolsFunction.stringArraySplit(paramList[1]);
                const circleId = pointIdList[0];
                dict.base = {type: 'copyCompass', basesId: [centerId, circleId], value: 0};
                createElement(dict);
            }else if (circleType === 'threePointCircle') {
                const pointIds = Object.values(operateList[figureLabel[name]]['@input']);
                dict.base = {type: 'threePointCircle', basesId: pointIds, value: 0};
                createElement(dict);
            }
        }else if (figureType === 'segment') {
            // 线段
            for (const [index, item2] of operateList.entries()) {
                const outputList = Object.values(item2['output']);
                if (!outputList.includes(name)) continue;

                const item2Type = item2['@name'];
                if (item2Type === 'Segment') {
                    figureLabel[name] = index;
                }
            }
            const pointIds = Object.values(operateList[figureLabel[name]]['@input']);

            const dict = {};
            dict.id = name;
            dict.name = name;
            dict.type = 'line';
            dict.base = {type: 'twoPoints', basesId: pointIds, value: 0};
            dict.drawType = 'lineSegment';

            createElement(dict);
        }else if (figureType === 'ray') {
            // 射线
            for (const [index, item2] of operateList.entries()) {
                const outputList = Object.values(item2['output']);
                if (!outputList.includes(name)) continue;

                const item2Type = item2['@name'];
                if (item2Type === 'Ray') {
                    figureLabel[name] = index;
                }
            }
            const pointIds = Object.values(operateList[figureLabel[name]]['@input']);

            const dict = {};
            dict.id = name;
            dict.name = name;
            dict.type = 'line';
            dict.base = {type: 'twoPoints', basesId: pointIds, value: 0};
            dict.drawType = 'ray';

            createElement(dict);
        }
        if (objectType === 'initial') {
            const objectIdList = item.objects;
            geometryElementLists.initial = new Set(objectIdList);
        }else if (objectType === 'movepoints') {
            const objectIdList = item.points;
            geometryElementLists.movepoints = new Set(objectIdList);
        }else if (objectType === 'named') {
            const objectIdList = item.objects;
            const nameList = [];
            for (const item of objectIdList) {
                const nameFront = item['name_front'];
                const nameBack = item['name_back'];
                nameList.push(nameFront);
                if (nameFront !== nameBack) {
                    const element = geometryManager.get(nameFront);
                    element.modifyName(nameBack);
                }
            }
            geometryElementLists.name = new Set(nameList);
        }else if (objectType === 'result') {
            // 定位当前没有的result项
            let findFlag = false;
            let count = 1;
            let resultName = 'result-1';
            while (!findFlag) {
                resultName = `result-${count}`;
                if (Object.keys(geometryElementLists).includes(resultName)) {
                    findFlag = true;
                    break;
                }
                count++;
            }
            const displayName = `completedShow-${count}`;
            setRefreshOverviewResultNumber(count);

            geometryElementLists[resultName] = new Set(item.result);
            if (item.display) geometryElementLists[displayName] = new Set(item.display);
        }else if (objectType === 'explore') {
            const objectIdList = item.objects;
            geometryElementLists.explore = new Set(objectIdList);
        }else if (objectType === 'rules') {
            const objectIdList = item.expressions;
            geometryElementLists.rules = objectIdList;
        }
    }

    setTimeout(() => {
        playStart();
    }, 500);


    /**
     * 生成元素
     * @param {{type: string, 
     *          id: string, 
     *          name: string, 
     *          x?: number, 
     *          y?: number, 
     *          drawType?: string,
     *          color: string,
     *          visible: boolean,
     *          showName: boolean}} elementDict 
     * @returns {Object}
     */
    function deserialization(elementDict) {
        const type = elementDict.type;
        const id = elementDict.id;
        const name = elementDict.name;
        
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
        return element;
    }

    /**
     * 生成元素
     * @param {{type: string, 
     *          id: string, 
     *          name: string, 
     *          x?: number, 
     *          y?: number, 
     *          drawType?: string,
     *          base: {type: string, 
     *              basesId?: string[], 
     *              value?: number, 
     *              exclude?: string},
     *          color: string,
     *          visible: boolean,
     *          showName: boolean,
     *          }} dict 
     */
    function createElement(dict) {
        // 1.添加元素
        const element = deserialization(dict);
        geometryManager.addObject(element);

        // 2.添加元素间连接
        const bases = dict.base;
        const basesType = bases.type;

        if (basesType === 'none') return;
        const id = dict.id;
        const currentElement = geometryManager.get(id);
        const currentElementType = dict.type;
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

        drawContent();
    }

    /**
     * rgb转16进制
     * @param {string[]} rgb 
     * @returns {string}
     */
    function rgbToHex(rgb) {
        var hex = "#";
        rgb.forEach(function(value) {
            var hexPart = parseInt(value).toString(16);
            hex += hexPart.length === 1 ? "0" + hexPart : hexPart;
        });
        console.log(hex)
        return hex;
    }
}

/**
 * 文件加载失败
 * @param {Event} event 
 */
function fileLoadError(event) {
    fileProcessInformation.innerHTML = '';
    fileProcessInformation.classList.add('active');
    fileProcessInformation.classList.add('fail');

    const text1DE = document.createElement('div');
    text1DE.textContent = '加载失败';
    fileProcessInformation.appendChild(text1DE);

    const text2DE = document.createElement('div');
    text2DE.textContent = '点击查看详细内容';
    text2DE.setAttribute('class', 'text2DE');
    text2DE.addEventListener('click', openFileImformationModal);
    const modal = document.getElementById('file-information-container');
    modal.textContent = event?.detail?.message;
    fileProcessInformation.appendChild(text2DE);

    setTimeout(() => {
        fileProcessInformation.classList.remove("active");
        fileProcessInformation.classList.remove("fail");
    }, 5000);
}

/**
 * 打开文件加载信息
 * @param {Event} event 
 */
function openFileImformationModal(event) {
    const modal = document.getElementById('file-information');
    const masks = document.getElementById('file-information-masks');
    modal.style.display = 'flex';
    modal.classList.add('active');
    masks.style.display = 'block';
}

document.getElementById('file-information-masks').addEventListener('click', closeFileImformationModal);
document.getElementById('file-information-button').addEventListener('click', closeFileImformationModal);

/**
 * 关闭文件加载信息
 * @param {Event} event 
 */
function closeFileImformationModal(event) {
    const modal = document.getElementById('file-information');
    const masks = document.getElementById('file-information-masks');
    modal.style.display = 'none';
    modal.classList.remove('active');
    masks.style.display = 'none';
}

/**
 * gmt文件导出
 * @returns {string}
 */
function gmtFileDown() {
    let text = '';
    const rename = {};
    // 几何对象
    const figureList = geometryManager.getAllByOrder();
    figureList.forEach((element) => {
        const id = element.getId();
        const name = element.getName();
        if (id !== name) rename[id] = name;
        const type = element.getType();
        const base = element.getBase();
        const baseType = base.type;

        if (type === 'point') {
            if (baseType === 'none') {
                const [x, y] = element.getCoordinate();
                const elementText = `${id}=[${x - window.innerWidth / 2},${y - window.innerHeight / 2}]\n`;
                text += elementText;
            }else if (baseType === 'intersection') {
                const [baseFigure1, baseFigure2] = base.bases;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId();
                const value = base.value;
                if (Object.keys(base).includes('exclude')) {
                    const exclude = base.exclude;
                    const elementText = `${id}=Intersect[${baseFigure1id},${baseFigure2id},${value},${exclude}]\n`;
                    text += elementText;
                }else{
                    const elementText = `${id}=Intersect[${baseFigure1id},${baseFigure2id},${value}]\n`;
                    text += elementText;
                }
            }else if (baseType === 'online') {
                const [baseFigure] = base.bases;
                const baseFigureId = baseFigure.getId();
                const value = base.value;
                const elementText = `${id}=Linepoint[${baseFigureId},${value}]\n`;
                text += elementText;
            }else if (baseType === 'middlePoint') {
                const [baseFigure1, baseFigure2] = base.bases;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId();
                const elementText = `${id}=Midpoint[${baseFigure1id},${baseFigure2id}]\n`;
                text += elementText;
            }else if (baseType === 'center') {
                const [baseFigure] = base.bases;
                const baseFigureId = baseFigure.getId();
                const elementText = `${id}=CenterPoint[${baseFigureId}]\n`;
                text += elementText;
            }
        }else if (type === 'line') {
            if (baseType === 'twoPoints') {
                const lineType = element.getDrawType();
                const [baseFigure1, baseFigure2] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId();
                if (lineType === 'line') {
                    const elementText = `${id}=Line[${baseFigure1id},${baseFigure2id}]\n`;
                    text += elementText;
                }else if (lineType === 'lineSegment') {
                    const elementText = `${id}=Segment[${baseFigure1id},${baseFigure2id}]\n`;
                    text += elementText;
                }else if (lineType === 'ray') {
                    const elementText = `${id}=Ray[${baseFigure1id},${baseFigure2id}]\n`;
                    text += elementText;
                }
            }else if (baseType === 'parallel') {
                const [baseFigure1, baseFigure2] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId();
                const elementText = `${id}=Parallel[${baseFigure1id},${baseFigure2id}]\n`;
                text += elementText;
            }else if (baseType === 'perpendicular') {
                const [baseFigure1, baseFigure2] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId();
                const elementText = `${id}=Perp[${baseFigure1id},${baseFigure2id}]\n`;
                text += elementText;
            }else if (baseType === 'perpendicularBisector') {
                const [baseFigure1, baseFigure2] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId();
                const elementText = `${id}=PBisect[${baseFigure1id},${baseFigure2id}]\n`;
                text += elementText;
            }else if (baseType === 'threePointAngleBisector') {
                const [baseFigure1, baseFigure2, baseFigure3] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId(), baseFigure3id = baseFigure3.getId();
                const elementText = `${id}=ABisect[${baseFigure1id},${baseFigure2id},${baseFigure3id}]\n`;
                text += elementText;
            }
        }else if (type === 'circle') {
            if (baseType === 'twoPoints') {
                const [baseFigure1, baseFigure2] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId();
                const elementText = `${id}=Circle[${baseFigure1id},${baseFigure2id}]\n`;
                text += elementText;
            }else if (baseType === 'compass') {
                const [baseFigure1, baseFigure2, baseFigure3] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId(), baseFigure3id = baseFigure3.getId();
                const elementText = `${id}=Compass[${baseFigure1id},${baseFigure2id},${baseFigure3id}]\n`;
                text += elementText;
            }else if (baseType === 'threePointCircle') {
                const [baseFigure1, baseFigure2, baseFigure3] = base.figure;
                const baseFigure1id = baseFigure1.getId(), baseFigure2id = baseFigure2.getId(), baseFigure3id = baseFigure3.getId();
                const elementText = `${id}=Circle3[${baseFigure1id},${baseFigure2id},${baseFigure3id}]\n`;
                text += elementText;
            }
        }
    });

    // 选择表
    text += '\n';
    for (const [key, setValue] of Object.entries(geometryElementLists)) {
        if (setValue.size === 0) continue;
        const frontName = key.split('-')[0];
        if (key === 'initial') {
            const listText = `initial=${[...setValue]}\n`;
            text += listText;
        }else if (key === 'movepoints') {
            const listText = `movepoints=${[...setValue]}\n`;
            text += listText;
        }else if (key === 'name') {
            let nameText = '';
            setValue.forEach((id) => {
                if (Object.keys(rename).includes(id)) {
                    nameText += `${id}.${rename[id]},`;
                }else{
                    nameText += `${id},`;
                }
            });
            const listText = `named=${nameText.slice(0, -1)}\n`;
            text += listText;
        }else if (frontName === 'result') {
            const value = key.split('-')[1];
            const display = geometryElementLists[`completedShow-${value}`];
            if (display.size !== 0 && setValue !== display) {
                const listText = `result=${[...setValue]}:${[...display]}\n`;
                text += listText;
            }else{
                const listText = `result=${[...setValue]}\n`;
                text += listText;
            }
        }else if (key === 'explore') {
            const listText = `explore=${[...setValue]}\n`;
            text += listText;
        }
    }
    return text;
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
        document.getElementById("body_inf").textContent = document.getElementById("body_input").value;
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

document.getElementById("thumbnail-screenshot-button").addEventListener("click", canvasClipStart);
/**
 * 截图
 */
function screenshot(highlightX, highlightY, highlightWidth, highlightHeight) {
    const canvas2 = document.createElement('canvas');
    canvas2.setAttribute('width', highlightWidth);
    canvas2.setAttribute('height', highlightHeight);
    const ctx = canvas2.getContext('2d');
    ctx.drawImage(img, 
        highlightX, 
        highlightY, 
        highlightWidth, 
        highlightHeight, // 从原图裁剪的位置和大小
        0, 
        0, 
        highlightWidth, 
        highlightHeight  // 画布上绘制的位置和大小
    );

    let pictureDE = document.getElementById('thumbnail-picture');
    if (pictureDE) {
        pictureDE.src = canvas2.toDataURL();
    }else{
        pictureDE = document.createElement('img');
        pictureDE.id = 'thumbnail-picture';
        pictureDE.src = canvas2.toDataURL();
        pictureDE.alt = "此处放置缩略图";
    }
    setTimeout(() => {
        canvas2.remove();
    }, 100);

    const container = document.getElementById('thumbnail-picture-frame');
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
    saveStatus = false;
    const elements = geometryManager.toStorage();
    storageManager.append(elements);
    refreshStorageButton();
}



// dropdown
function overviewTitleClick(event) {
    const action = event.target?.dataset?.action;
    if (action === 'result-number-add') {
        setRefreshOverviewResultNumber(resultNumber++);
    }else if (action === 'result-number-sub') {
        if (resultNumber <= 1) return;
        setRefreshOverviewResultNumber(resultNumber--);
    }
}

/**
 * 设定选择列表解的数量并刷新一览面板
 * @param {number} cacheNumber 
 */
function setRefreshOverviewResultNumber(cacheNumber) {
    setResultNumber(cacheNumber);
    resultNumber = cacheNumber;
    
    dropdownRefresh();
    const resultNumberDE = document.getElementById('overview-result-number');
    resultNumberDE.textContent = cacheNumber;
}

/**
 * 设定选择列表解的数量
 * @param {number} cacheNumber 
 */
function setResultNumber(cacheNumber) {
    if (cacheNumber > resultNumber) {
        for (let i = resultNumber + 1; i <= cacheNumber; i++) {
            const newResult = `result-${i}`;
            geometryElementLists[newResult] = new Set();
            const newShow = `completedShow-${i}`;
            geometryElementLists[newShow] = new Set();
        }
    }else if (cacheNumber < resultNumber) {
        for (let i = resultNumber; i > cacheNumber; i--) {
            const newResult = `result-${i}`;
            delete geometryElementLists[newResult];
            const newShow = `completedShow-${i}`;
            delete geometryElementLists[newShow];
        }
    }
}

const fileDownDict = {
    gmt: 'Geometry',
    //ggb: 'Geogebra',
    //geb: 'Geogebra-Euclidea-Blueprint',
}
const filePartDownDict = {
    jpg: 'Joint Photographic Experts Group',
    png: 'Portable Network Graphics',
}
const filePartDownTypeDict = {
    screenshot: '截图',
    //thumbnail: '截图加信息',
}

const dropdownTriggerChoice = document.getElementById('dropdownTriggerChoice');
const dropdownMenuChoice = document.getElementById('dropdownMenuChoice');
const dropdownTriggerFileDown = document.getElementById('dropdownTriggerFileDown');
const dropdownMenuFileDown = document.getElementById('dropdownMenuFileDown');
const dropdownTriggerFilePartDown = document.getElementById('dropdownTriggerFilePartDown');
const dropdownMenuFilePartDown = document.getElementById('dropdownMenuFilePartDown');
const dropdownTriggerFilePartDownType = document.getElementById('dropdownTriggerFilePartDownType');
const dropdownMenuFilePartDownType = document.getElementById('dropdownMenuFilePartDownType');
const dropdownDEDict = {
    choice: [dropdownTriggerChoice, dropdownMenuChoice],
    fileDown: [dropdownTriggerFileDown, dropdownMenuFileDown],
    filePartDown: [dropdownTriggerFilePartDown, dropdownMenuFilePartDown],
    filePartDownType: [dropdownTriggerFilePartDownType, dropdownMenuFilePartDownType],
}
let dropdownValueDict = {
    choice: [Object.keys(geometryElementLists)[0], geometryElementLists],
    fileDown: [Object.keys(fileDownDict)[0], fileDownDict],
    filePartDown: [Object.keys(filePartDownDict)[0], filePartDownDict],
    filePartDownType: [Object.keys(filePartDownTypeDict)[0], filePartDownTypeDict],
}

/**
 * 手动刷新下拉栏值
 */
function refreshDropdownValueDict() {
    dropdownValueDict = {
        choice: [Object.keys(geometryElementLists)[0], geometryElementLists],
        fileDown: [Object.keys(fileDownDict)[0], fileDownDict],
        filePartDown: [Object.keys(filePartDownDict)[0], filePartDownDict],
        filePartDownType: [Object.keys(filePartDownTypeDict)[0], filePartDownTypeDict],
    }
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
    }else if (index === 'filePartDownType') {
        const spanDE = document.getElementById('file-part-down-type-text-type');
        spanDE.textContent = filePartDownTypeDict[item];
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
        
        refreshDropdownValueDict();
        const dropdownDict = dropdownValueDict[index][1];
        // 默认选择第一项
        setTimeout(() => {
            selectOption(index, Object.keys(dropdownDict)[0]);
        }, 100);
    }
}



// dataLoad
/**
 * 数据加载
 */
function dataLoad() {
    // 缩略图
    const thumbnailJSON = sessionStorage.getItem('thumbnail');
    if (thumbnailJSON) {
        const thumbnail = JSON.parse(thumbnailJSON);
        document.getElementById("title_inf").textContent = thumbnail.title_input;
        document.getElementById("body_inf").textContent = thumbnail.body_input;
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
    geometryManager.geometryElementLists = geometryElementLists;
    
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

        drawContent();
    }

    // 构造记录
    const constructRecordJSON = sessionStorage.getItem('constructRecord');
    if (constructRecordJSON) storageManager.deserialization(constructRecordJSON);
    refreshStorageButton();
    
    
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

/**
 * 选择性文件数据加载
 * @param {{figure: Object[], choice: Object}} dictData 
 * @param {string[]} loadChoice 
 * loadChoice = ['geometryElementLists', 
 *      'geometryElements', 
 *      'constructRecord',
 *      'thumbnail']
 */
function dictDataLoad(dictData, loadChoice) {
    if (loadChoice.includes('thumbnail')) {
        const thumbnail = dictData.thumbnail;
        if (thumbnail.title_input) document.getElementById("title_inf").textContent = thumbnail.title_input;
        if (thumbnail.body_input) document.getElementById("body_inf").textContent = thumbnail.body_input;
        if (thumbnail.bottom_input) document.getElementById("bottom_inf").textContent = thumbnail.bottom_input;
        if (thumbnail.title_input) document.getElementById("title_input").value = thumbnail.title_input;
        if (thumbnail.body_input) document.getElementById("body_input").value = thumbnail.body_input;
        if (thumbnail.bottom_input) document.getElementById("bottom_input").value = thumbnail.bottom_input;

        if (thumbnail.pictureData) {
            const picture = document.getElementById('thumbnail-picture');
            if (picture) {
                if (thumbnail.pictureData) {
                    picture.src = `data:image/png;base64,${thumbnail.pictureData}`;
                }else{
                    picture.remove();
                }
            }else if (thumbnail.pictureData) {
                const pictureDE = document.createElement('img');
                pictureDE.id = 'thumbnail-picture';
                pictureDE.src = `data:image/png;base64,${thumbnail.pictureData}`;
                pictureDE.alt = "此处放置缩略图";
                const container = document.getElementById('thumbnail-picture-frame');
                container.appendChild(pictureDE);
            }
        }
    }

    if (loadChoice.includes('geometryElementLists')) {
        // 选定栏
        clearLists();
        const geometryElementListsLoad = dictData.choice;
        if (geometryElementListsLoad) {
            for (const [key, value] of Object.entries(geometryElementListsLoad)) {
                geometryElementLists[key] = new Set(value);
            }
        }
        geometryManager.geometryElementLists = geometryElementLists;
    }
    
    if (loadChoice.includes('geometryElements')) {
        // 几何对象
        const elements = dictData.figure;
        if (!elements) return;

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

            drawContent();
        }
    }

    if (loadChoice.includes('constructRecord')) {
        // 构造记录
        const constructRecordJSON = dictData.constructRecord;
        if (constructRecordJSON) storageManager.deserialization(constructRecordJSON);
        refreshStorageButton();
    }


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
    document.getElementById("overview-title").addEventListener("click", overviewTitleClick);
    document.getElementById("container_overview").addEventListener("click", selectElementByOverview);
    document.getElementById("geometry-item").addEventListener("click", geometryItemClick);
    document.getElementById("filePanel").addEventListener("click", filePanelClick);
    document.getElementById("recordPanel").addEventListener("click", recordPanel);
    // 初始化
    dropdownInit();
    updateLayout();
    resizeCanvas();
    drawContent();
    switchPanel("toolbarPanel");
    refreshMenuTool();
    refreshStorageButton();
    dataLoad();
    loadRecordStorage();
}