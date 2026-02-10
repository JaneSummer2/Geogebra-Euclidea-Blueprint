/* tool.js */
let tool, menuTool, subTool;
const toolMenus = {
    'euclidea': [
        'move', 'point', 'line', 'circle', 'intersection', 'compass',
        'parallelLine', 'perpendicularLine', 'perpendicularBisector', 'angleBisector',
        'middlePoint', 'threePointCircle'
    ],
}
const toolMenuDefaultValue = {
    'euclidea': "line",
}
const toolItems = {
    'move': {
        'switch': ["choiceDraw", "moveView"], 
        "button": ["restoreTransform", "clear"],
    },
    'point': {
        "button": ["pointStyle"],
    },
    'eraser': {
        "switch": ["any", "choicePoint"],
    },
    'line': {
        "switch": ["line", "style"],
        "button": ["clear", "lineStyle"],
        "choice": {"line": {"point1": 'point', "point2": 'point'}},
    },
    'ray': {
        "switch": ["ray", "style"],
        "button": ["clear", "lineStyle"],
        "choice": {"ray": {"point1": 'point', "point2": 'point'}},
    },
    'lineSegment': {
        "switch": ["lineSegment", "style"],
        "button": ["clear", "lineStyle"],
        "choice": {"lineSegment": {"point1": 'point', "point2": 'point'}},
    },
    'circle': {
        "button": ["clear", "circleStyle"],
        "choice": {"general": {"point1": 'point', "point2": 'point'}},
    },
    'intersection': {
        "button": ["clear", "pointStyle"],
        "choice": {"general": {"choice1": 'any', "choice2": 'any'}},
    },
    'parallelLine': {
        "button": ["clear", "lineStyle"], 
        "choice": {"general": {"point": 'point', "line": 'line'}},
    }, 
    'perpendicularLine': {
        "button": ["clear", "lineStyle"], 
        "choice": {"general": {"point": 'point', "line": 'line'}},
    }, 
    'perpendicularBisector': {
        "button": ["clear", "lineStyle"], 
        "choice": {"general": {"point1": 'point', "point2": 'point'}},
    }, 
    'angleBisector': {
        'switch': ['threePointAngleBisector'],
        "button": ["clear", "lineStyle"], 
        "choice": {"general": {"point1": 'point', "point2": 'point', "point3": 'point'}},
    }, 
    'compass': {
        'switch': ['threePointCompass', 'compassCopy'],
        "button": ["clear", "circleStyle"], 
        "choice": {"threePointCompass": {"point1": 'point', "point2": 'point', "point3": 'point'},
            "compassCopy": {"point": 'point', "circle": 'circle'}},
    }, 
    'middlePoint': {
        'switch': ["twoPointsMiddlePoint", "circleCenter"], 
        "button": ["clear", "pointStyle"], 
        "choice": {"twoPointsMiddlePoint": {"point1": 'point', "point2": 'point'}, 
            "circleCenter": {"circle": 'circle'}},
    }, 
    'threePointCircle': {
        "button": ["clear", "circleStyle"], 
        "choice": {"general": {"point1": 'point', "point2": 'point', "point3": 'point'}},
    }, 
}

/**
 * 生成工具项
 * @param {string} selectMenuTool 
 */
function generateTool(selectMenuTool) {
    // 清空工具栏
    const toolbar = document.getElementById('container_toolbar');
    toolbar.innerHTML= '';

    // 遍历添加文档元素
    const toolsList = toolMenus[selectMenuTool];
    toolsList.forEach((item) => {
        const toolDocumentElement = document.createElement('button');
        toolDocumentElement.classList.add('tool-item');
        toolDocumentElement.classList.add('svg-button');
        toolDocumentElement.id = `button-${item}-tool`;
        toolDocumentElement.setAttribute('data-action', item);

        const template = document.getElementById(`svg-${item}`);
        if (template) {
            toolDocumentElement.innerHTML = template.innerHTML;
        }

        toolbar.appendChild(toolDocumentElement);
    })

    toolbar.style.display = 'none';
    toolbar.offsetHeight;
    toolbar.style.display = 'flex';
    choiceTool(toolMenuDefaultValue[selectMenuTool]);
}

/**
 * 加载工具小项
 */
function loadToolSwitchButton(tool) {
    const toolSwitchButton = document.getElementById("floating-bar-buttons");
    const toolSwitchs = toolItems[tool]?.switch;
    const toolButtons = toolItems[tool]?.button;
    toolSwitchButton.innerHTML = "";
    
    if (toolSwitchs) {
        toolSwitchs.forEach((element) => {
            const toolDocumentElement = document.createElement('button');
            toolDocumentElement.classList.add('tool-switch-item');
            toolDocumentElement.classList.add('floating-svg-switch-button');
            toolDocumentElement.id = `button-${tool}-${element}`;
            toolDocumentElement.setAttribute('data-action', element);
    
            const template = document.getElementById(`svg-${element}`);
            if (template) {
                toolDocumentElement.innerHTML = template.innerHTML;
            }
            
            // 添加
            toolSwitchButton.appendChild(toolDocumentElement);
        });
    }
    
    if (toolButtons) {
        toolButtons.forEach((element) => {
            const toolDocumentElement = document.createElement('button');
            toolDocumentElement.classList.add('floating-svg-button');
            toolDocumentElement.id = `button-${tool}-${element}`;
            toolDocumentElement.setAttribute('data-action', element);
    
            const template = document.getElementById(`svg-${element}`);
            if (template) {
                toolDocumentElement.innerHTML = template.innerHTML;
            }
            
            // 添加
            toolSwitchButton.appendChild(toolDocumentElement);
        });
    }

    refreshToolFloating();
    toolSwitchButton.style.display = 'none';
    toolSwitchButton.offsetHeight;
    toolSwitchButton.style.display = 'flex';
}

/**
 * 加载工具选中项
 */
function loadChoice(tool) {
    const toolChoiceDocumentElement = document.getElementById("floating-bar-elements");
    toolChoiceDocumentElement.innerHTML = "";
    createToolChoiceItems();
    
    function createToolChoiceItems() {
        // 刷新工具的选中表
        const choiceDict = toolItems[tool]?.choice;
        if (!choiceDict) return;
        // 对应工具的切换表
        let subChoiceDict;
        if (Object.keys(choiceDict).includes('general')) {
            subChoiceDict = choiceDict.general;
        }else{
            subChoiceDict = choiceDict[subTool];
        }
        if (!subChoiceDict) return;
        // 遍历项填图
        let count = 0;
        for (const value of Object.values(subChoiceDict)) {
            count++;
            const toolDocumentElement = createToolChoice(tool, value, count)
            toolChoiceDocumentElement.appendChild(toolDocumentElement);
        }
    }
    
    function createToolChoice(tool, element, count) {
        const toolDocumentElement = document.createElement('div');
        toolDocumentElement.classList.add('floating-svg-choice');
        toolDocumentElement.id = `choice-${tool}-${element}${count}`;

        const template = document.getElementById(`svg-${element}`);
        if (template) {
            toolDocumentElement.innerHTML = template.innerHTML;
        }

        return toolDocumentElement;
    }
    
    toolChoiceDocumentElement.style.display = 'none';
    toolChoiceDocumentElement.offsetHeight;
    toolChoiceDocumentElement.style.display = 'flex';
}

/**
 * 显示隐藏移动点
 * @param {boolean} bool 
 */
function showMovePoints(bool) {
    const idList = [...geometryElementLists.movepoints];
    idList.forEach((item) => {
        const element  = geometryManager.get(item);
        element.modifyVisible(bool);
    });
}

/**
 * 选中工具栏 过程函数
 * @param {string} selectTool
 */
function choiceToolMenu(selectTool) {
    menuTool = selectTool;
    generateTool(selectTool);
    drawContent();
}

/**
 * 选中工具 过程函数
 * @param {string} tool
 */
function choiceTool(selectTool) {
    if (selectTool) {
        const buttons = document.querySelectorAll('.tool-item');
        // 移除所有按钮的选中状态
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    if (selectTool) {
        if (tool === 'move') showMovePoints(false);
        tool = selectTool;
        subTool = null;
        document.getElementById(`button-${selectTool}-tool`).classList.add('active');
        subTool = selectTool;
        loadChoice(selectTool);
        loadToolSwitchButton(selectTool);
        const switchList = toolItems[tool]?.switch;
        if (switchList) choiceToolSwitch(switchList[0]);
        pointerPosition.x = 0, pointerPosition.y = 0; 
        if (menuTool === 'construct') {
            toolMenuDefaultValue.construct = selectTool;
        }
    }
    drawContent();
}

/**
 * 选中工具小项 过程函数
 * @param {string} tool
 */
function choiceToolSwitch(selectTool) {
    const buttons = document.querySelectorAll('.tool-switch-item');
    // 移除所有按钮的选中状态
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    if (subTool === 'choiceDraw') showMovePoints(false);
    subTool = selectTool;
    document.getElementById(`button-${tool}-${selectTool}`).classList.add('active');
    if (subTool === 'choiceDraw') showMovePoints(true);
    drawContent();
    loadChoice(tool);
    refreshToolFloating();
}

/**
 * 刷新工具菜单栏
 */
function refreshMenuTool() {
    if (menuTool === 'construct') {
        const constructToolMenu = document.getElementById('button-construct-menu');
        constructToolMenu.innerHTML = '';
        const template = document.getElementById(`svg-${tool}`);
        if (template) {
            constructToolMenu.innerHTML = template.innerHTML;
        }
    }
    
    const menuToolbar = document.getElementById("menu_toolbar");
    menuToolbar.style.display = 'none';
    menuToolbar.offsetHeight;
    menuToolbar.style.display = 'flex';
}

/**
 * 刷新工具浮动栏
 */
function refreshToolFloating() {
    if (panelState !== "toolbarPanel") return;
    // 刷新按钮
    const buttons = toolItems[tool]?.button;
    if (buttons) {
        buttons.forEach((item) => {
            if (item === 'restoreTransform') {
                setRestoreTransformAble(item);
            }else if (item === 'clear'){
                setClearChoiceAble(item);
            }else if (item === 'pointStyle'){
                drawStyle("point");
            }else if (item === 'lineStyle'){
                drawStyle("line");
            }else if (item === 'circleStyle'){
                drawStyle("circle");
            }
        })
    }

    // 刷新工具的选中表
    const choiceDict = toolItems[tool]?.choice;
    if (!choiceDict) return;
    // 对应工具的切换表
    let subChoiceDict;
    if (Object.keys(choiceDict).includes('general')) {
        subChoiceDict = choiceDict.general;
    }else{
        subChoiceDict = choiceDict[subTool];
    }
    if (!subChoiceDict) return;
    // 遍历项填图
    let count = 0;
    for (const [key, value] of Object.entries(subChoiceDict)) {
        count++;
        const item = geometryManager.getToolKey(tool, key);
        if (item) {
            const buttonDE = document.getElementById(`choice-${tool}-${value}${count}`);
            buttonDE.classList.remove('disable');
            buttonDE.innerHTML = "";
            const type = item.getType();
            const svg = createThumbnailSVG(item, type);
            buttonDE.appendChild(svg);
        }else{
            const buttonDE = document.getElementById(`choice-${tool}-${value}${count}`);
            buttonDE.classList.add('disable');
            const template = document.getElementById(`svg-${value}`);
            if (template) {
                buttonDE.innerHTML = template.innerHTML;
            }
            const svg = buttonDE.querySelector('svg');
            svg.classList.add('disable');
        }
    }

    function setRestoreTransformAble(item) {
        const buttonDE = document.getElementById(`button-${tool}-${item}`);
        const svg = buttonDE.querySelector('svg');
        if (transform.x !== 0 || transform.y !== 0 || transform.scale !== 1) {
            buttonDE.classList.remove('disable');
            svg.classList.remove('disable');
        }else{
            buttonDE.classList.add('disable');
            svg.classList.add('disable');
        }
    }
    function setClearChoiceAble(item) {
        const buttonDE = document.getElementById(`button-${tool}-${item}`);
        const svg = buttonDE.querySelector('svg');
        if (geometryManager.ifToolInCache(tool)) {
            buttonDE.classList.remove('disable');
            svg.classList.remove('disable');
        }else{
            buttonDE.classList.add('disable');
            svg.classList.add('disable');
        }
    }
    function createThumbnailSVG(element, type) {
        const svgNS = "http://www.w3.org/2000/svg";
        const size = 200;
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        
        if (type === "point") {
            // 中心圆点
            const centerX = size / 2;
            const centerY = size / 2;
            const color = element.getColor();
            
            const centerCircle = document.createElementNS(svgNS, "circle");
            centerCircle.setAttribute("cx", centerX);
            centerCircle.setAttribute("cy", centerY);
            centerCircle.setAttribute("r", "15");
            centerCircle.setAttribute("stroke", color);
            centerCircle.setAttribute("stroke-width", '10');
            centerCircle.setAttribute("fill", 'white');
            svg.appendChild(centerCircle);
        }else if (type === "line") {
            // 直线
            const color = element.getColor();
            const coordList = element.getCoordinate();
            const [x1, y1] = coordList[0];
            const [x2, y2] = coordList[1];
            const dx = x1 - x2;
            const dy = y1 - y2;
            const angle = Math.atan2(dy, dx);
            
            const lineLength = size * 0.4; // 线长为方块的40%
            const radian = angle;
            const centerX = size / 2;
            const centerY = size / 2;
            
            const startX = centerX - lineLength * Math.cos(radian);
            const startY = centerY - lineLength * Math.sin(radian);
            const endX = centerX + lineLength * Math.cos(radian);
            const endY = centerY + lineLength * Math.sin(radian);
            
            const directionLine = document.createElementNS(svgNS, "line");
            directionLine.setAttribute("x1", startX);
            directionLine.setAttribute("y1", startY);
            directionLine.setAttribute("x2", endX);
            directionLine.setAttribute("y2", endY);
            directionLine.setAttribute("stroke", color);
            directionLine.setAttribute("stroke-width", "10");
            directionLine.setAttribute("stroke-linecap", "round");
            svg.appendChild(directionLine);

            // 端点
            const point1 = document.createElementNS(svgNS, "circle");
            point1.setAttribute("cx", startX);
            point1.setAttribute("cy", startY);
            point1.setAttribute("r", "15");
            point1.setAttribute("stroke", color);
            point1.setAttribute("stroke-width", '10');
            point1.setAttribute("fill", 'white');
            svg.appendChild(point1);

            const point2 = document.createElementNS(svgNS, "circle");
            point2.setAttribute("cx", endX);
            point2.setAttribute("cy", endY);
            point2.setAttribute("r", "15");
            point2.setAttribute("stroke", color);
            point2.setAttribute("stroke-width", '10');
            point2.setAttribute("fill", 'white');
            svg.appendChild(point2);
        }else if (type === "circle") {
            // 圆圈
            const centerX = size / 2;
            const centerY = size / 2;
            const color = element.getColor();
            const coordList = element.getCoordinate();
            const [x1, y1] = coordList[0];
            const [x2, y2] = coordList[1];
            const dx = x1 - x2;
            const dy = y1 - y2;
            const angle = Math.atan2(dy, dx);
            
            const radius = size * 0.4;
            const radian = angle;
            const endX = centerX - radius * Math.cos(radian);
            const endY = centerY - radius * Math.sin(radian);
            
            const centerCircle = document.createElementNS(svgNS, "circle");
            centerCircle.setAttribute("cx", centerX);
            centerCircle.setAttribute("cy", centerY);
            centerCircle.setAttribute("r", radius);
            centerCircle.setAttribute("stroke", color);
            centerCircle.setAttribute("stroke-width", '10');
            centerCircle.setAttribute("fill", 'transparent');
            svg.appendChild(centerCircle);

            // 点点
            const point1 = document.createElementNS(svgNS, "circle");
            point1.setAttribute("cx", centerX);
            point1.setAttribute("cy", centerY);
            point1.setAttribute("r", "15");
            point1.setAttribute("stroke", color);
            point1.setAttribute("stroke-width", '10');
            point1.setAttribute("fill", 'white');
            svg.appendChild(point1);

            const point2 = document.createElementNS(svgNS, "circle");
            point2.setAttribute("cx", endX);
            point2.setAttribute("cy", endY);
            point2.setAttribute("r", "15");
            point2.setAttribute("stroke", color);
            point2.setAttribute("stroke-width", '10');
            point2.setAttribute("fill", 'white');
            svg.appendChild(point2);
        }
        // 名称
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", size * 0.1);
        text.setAttribute("y", size * 0.9);
        text.setAttribute("fill", "rgba(25, 25, 25, 1)");
        text.setAttribute("stroke", "rgba(200, 200, 200, 1)");
        text.setAttribute("stroke-width", "3");
        text.setAttribute("font-size", "100");
        text.setAttribute("font-weight", "bold");
        text.textContent = element.getName();
        svg.appendChild(text);
        
        return svg;
    }
    function drawStyle(type) {
        const buttonDE = document.getElementById(`button-${tool}-${type}Style`);
        buttonDE.innerHTML = "";
        const color = geometryStyle[type].color;
        const template = document.getElementById(`svg-${type}`);
        if (template) {
            buttonDE.innerHTML = template.innerHTML;
        }
        const svg = buttonDE.querySelector('svg');
        svg.style.stroke = color;
    }
}

/**
 * 工具浮动按钮点击
 */
function clickToolFloatingButton(action) {
    if (action === 'restoreTransform') {
        resetTransform();
    }else if (action === 'clear') {
        tools[tool].clear();
    }else if (action === 'pointStyle') {
        // 创建临时的input元素
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = geometryStyle.point.color; // 设置默认颜色
        
        // 监听颜色变化
        colorInput.addEventListener('change', function(e) {
            const selectedColor = e.target.value;
            geometryStyle.point.color = selectedColor;
            geometryStyle.point.colorChoice = "color";
            refreshToolFloating();
        });
        
        // 触发颜色选择器
        colorInput.click();
        
        // 可选：用完立即移除
        setTimeout(() => {
            colorInput.remove();
        }, 100);
    }else if (action === 'lineStyle') {
        // 创建临时的input元素
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = geometryStyle.line.color; // 设置默认颜色
        
        // 监听颜色变化
        colorInput.addEventListener('change', function(e) {
            const selectedColor = e.target.value;
            geometryStyle.line.color = selectedColor;
            geometryStyle.line.colorChoice = "color";
            refreshToolFloating();
        });
        
        // 触发颜色选择器
        colorInput.click();
        
        // 可选：用完立即移除
        setTimeout(() => {
            colorInput.remove();
        }, 100);
    }else if (action === 'circleStyle') {
        // 创建临时的input元素
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = geometryStyle.circle.color; // 设置默认颜色
        
        // 监听颜色变化
        colorInput.addEventListener('change', function(e) {
            const selectedColor = e.target.value;
            geometryStyle.circle.color = selectedColor;
            geometryStyle.circle.colorChoice = "color";
            refreshToolFloating();
        });
        
        // 触发颜色选择器
        colorInput.click();
        
        // 可选：用完立即移除
        setTimeout(() => {
            colorInput.remove();
        }, 100);
    }
    drawContent();
    refreshToolFloating();
}

/**
 * 事件处理 过程函数
 * @param {string} type
 * @param {number} x
 * @param {number} y
 */
function operateEventFunction(type, x, y) {
    tools[tool].toolEvent(type, x, y);
    drawContent();
    refreshToolFloating();
}
