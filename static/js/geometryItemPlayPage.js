/* geometryItem.js */

let overviewPanelSelect = 'all';
function updateSelectChoice(currentSelected) {
    overviewPanelSelect = currentSelected;
    loadGeometryElements();
}

/**
 * 加载几何元素预览
 */
function loadGeometryElements() {
    const overview = document.getElementById("container_overview");
    const geometryElements = geometryManager.getAllByOrder();
    let count = 0;
    overview.innerHTML = "";
    
    for (const element of geometryElements) {
        // 生成
        const item = document.createElement("div");
        const itemText = document.createElement("div");
        const itemIndex = document.createElement("span");
        const itemName = document.createElement("span");
        
        const type = element.getType();
        const name = element.getName();
        const elementId = element.getId();
        count += 1;
        const flag = geometryElementLists.itemHidden.has(elementId);
        if (flag) continue;
        
        // 创建SVG元素
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
            return svg;
        }
        itemText.className = "overview-item-text";
        itemIndex.textContent = `${count}`;
        itemName.textContent = `${name}`;
        
        // 添加
        const id = element.getId();

        const svg = createThumbnailSVG(element, type);
        svg.setAttribute('class', 'svg-item');
        itemText.appendChild(itemIndex);
        itemText.appendChild(itemName);
        item.appendChild(svg);
        item.appendChild(itemText);
        item.className = "overview-item";
        item.setAttribute('data-action', id);
        overview.appendChild(item);

        const set = geometryElementLists[overviewPanelSelect];
        if (set?.has(id)) item.classList.add('select');
    }
    overview.style.display = 'none';
    overview.offsetHeight;
    overview.style.display = 'grid';
}

/**
 * 从元素一览选中元素
 */
function selectElementByOverview(event) {
    const target = event.target;
    const id = event.target?.dataset.action;
    if (!id) return;
    
    if (overviewPanelSelect === "all") {
        show(id);
    }else{
        const set = geometryElementLists[overviewPanelSelect];
        if (!set) return;
        select(target, id, set);
    }

    function show(id) {
        const overviewMode = document.getElementById("geometry-item-list");
        const viewerMode = document.getElementById("geometry-item");
        overviewMode.style.display = "none";
        viewerMode.style.display = "flex";
        viewerMode.innerHTML = "";
        
        const element = geometryManager.get(id);
        if (widthTypeEquipment === 'mobile') {
            const type = element.getType();
            let dataItem;
            
            if (type === "point") {
                // 标题行
                dataItem = titleRow(type, element);
                viewerMode.appendChild(dataItem);
                // id行
                dataItem = idRow(element);                
                viewerMode.appendChild(dataItem);
                // xy行
                dataItem = xyRow(element);                
                viewerMode.appendChild(dataItem);
                // 基底行
                dataItem = baseRow(element);
                viewerMode.appendChild(dataItem);
                // 显示行
                dataItem = showRow(element);                
                viewerMode.appendChild(dataItem);
                // 颜色行
                dataItem = colorRow(element);                
                viewerMode.appendChild(dataItem);
                // 有效性行
                dataItem = validRow(element);                
                viewerMode.appendChild(dataItem);
                // 上层构造行
                dataItem = superstructureRow(element);
                viewerMode.appendChild(dataItem);
            }else if (type === "line" || type === "circle") {
                // 标题行
                dataItem = titleRow(type, element);
                viewerMode.appendChild(dataItem);
                // id行
                dataItem = idRow(element);                
                viewerMode.appendChild(dataItem);
                // 二坐标行
                dataItem = twoCoordinateRow(element);                
                viewerMode.appendChild(dataItem);
                // 基底行
                dataItem = baseRow(element);
                viewerMode.appendChild(dataItem);
                // 显示行
                dataItem = showRow(element);                
                viewerMode.appendChild(dataItem);
                // 颜色行
                dataItem = colorRow(element);                
                viewerMode.appendChild(dataItem);
                // 有效性行
                dataItem = validRow(element);                
                viewerMode.appendChild(dataItem);
                // 上层构造行
                dataItem = superstructureRow(element);
                viewerMode.appendChild(dataItem);
            }
        }else{
            // 电脑端
            const type = element.getType();
            if (type === "point") {
                // 标题行
                dataItem = titleRowDesktop(type, element);
                viewerMode.appendChild(dataItem);

                const body = document.createElement('div');
                body.className = "item-container-row";
                const container1 = document.createElement('div');
                container1.className = "item-container-column";
                const container2 = document.createElement('div');
                container2.className = "item-container-column";
                const container3 = document.createElement('div');
                container3.className = "item-container-column";

                // xy行
                dataItem = xyRow(element);                
                container1.appendChild(dataItem);
                // 基底行
                dataItem = baseRow(element);
                container1.appendChild(dataItem);
                // 显示行
                dataItem = showRow(element);                
                container2.appendChild(dataItem);
                // 颜色行
                dataItem = colorRow(element);                
                container2.appendChild(dataItem);
                // 有效性行
                dataItem = validRow(element);                
                container2.appendChild(dataItem);
                // 上层构造行
                dataItem = superstructureRow(element);
                container3.appendChild(dataItem);

                body.appendChild(container1);
                body.appendChild(container2);
                body.appendChild(container3);
                viewerMode.appendChild(body);
            }else if (type === "line" || type === "circle") {
                // 标题行
                dataItem = titleRowDesktop(type, element);
                viewerMode.appendChild(dataItem);

                const body = document.createElement('div');
                body.className = "item-container-row";
                const container1 = document.createElement('div');
                container1.className = "item-container-column";
                const container2 = document.createElement('div');
                container2.className = "item-container-column";
                const container3 = document.createElement('div');
                container3.className = "item-container-column";

                // 二坐标行
                dataItem = twoCoordinateRow(element);           
                container1.appendChild(dataItem);
                // 基底行
                dataItem = baseRow(element);
                container1.appendChild(dataItem);
                // 显示行
                dataItem = showRow(element);                
                container2.appendChild(dataItem);
                // 颜色行
                dataItem = colorRow(element);                
                container2.appendChild(dataItem);
                // 有效性行
                dataItem = validRow(element);                
                container2.appendChild(dataItem);
                // 上层构造行
                dataItem = superstructureRow(element);
                container3.appendChild(dataItem);

                body.appendChild(container1);
                body.appendChild(container2);
                body.appendChild(container3);
                viewerMode.appendChild(body);
            }
        }
    }
    function titleRow(type, element) {
        // 标题行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-title";

        const backButton = document.createElement('div');
        backButton.className = 'item-container-button';
        backButton.setAttribute('data-action', 'back');
        const template = document.getElementById(`svg-back`);
        if (template) {
            backButton.innerHTML = template.innerHTML;
        }
        dataItem.appendChild(backButton);

        let textNode = document.createElement('p');
        if (type === "point") {
            textNode.textContent = '点';
        }else if (type === "line") {
            textNode.textContent = '线';
        }else if (type === "circle") {
            textNode.textContent = '圆';
        }
        dataItem.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = element.getName();
        dataItem.appendChild(textNode);
        
        return dataItem;
    }
    function titleRowDesktop(type, element) {
        // 电脑端标题行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-title";

        const backButton = document.createElement('div');
        backButton.className = 'item-container-button';
        backButton.setAttribute('data-action', 'back');
        const template = document.getElementById(`svg-back`);
        if (template) {
            backButton.innerHTML = template.innerHTML;
        }
        dataItem.appendChild(backButton);

        let textNode = document.createElement('p');
        if (type === "point") {
            textNode.textContent = '点';
        }else if (type === "line") {
            textNode.textContent = '线';
        }else if (type === "circle") {
            textNode.textContent = '圆';
        }
        dataItem.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = element.getName();
        dataItem.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = "id";
        dataItem.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = element.getId();
        dataItem.appendChild(textNode);
        
        return dataItem;
    }
    function idRow(element) {
        // id行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-row";

        const textNode = document.createElement('p');
        textNode.textContent = 'id';
        dataItem.appendChild(textNode);

        const textNode2 = document.createElement('p');
        textNode2.textContent = element.getId();
        dataItem.appendChild(textNode2);
        
        return dataItem;
    }
    function xyRow(element) {
        // xy行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-row";
        const [x, y] = element.getCoordinate();

        let textNode = document.createElement('p');
        textNode.textContent = 'x';
        dataItem.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = x;
        dataItem.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = "y";
        dataItem.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = y;
        dataItem.appendChild(textNode);
        
        return dataItem;
    }
    function twoCoordinateRow(element) {
        // 二坐标行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-column";
        const dataItem1 = document.createElement("div");
        dataItem1.className = "item-container-row";
        const dataItem2 = document.createElement("div");
        dataItem2.className = "item-container-row";
        const coordList = element.getCoordinate();
        const type = element.getType();

        let textNode = document.createElement('p');
        if (type === "line") {
            textNode.textContent = '点1';
        }else if (type === "circle") {
            textNode.textContent = '圆心';
        }
        dataItem1.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = coordList[0];
        dataItem1.appendChild(textNode);
        
        textNode = document.createElement('p');
        if (type === "line") {
            textNode.textContent = '点2';
        }else if (type === "circle") {
            textNode.textContent = '圆上点';
        }
        dataItem2.appendChild(textNode);

        textNode = document.createElement('p');
        textNode.textContent = coordList[1];
        dataItem2.appendChild(textNode);
        
        dataItem.appendChild(dataItem1);
        dataItem.appendChild(dataItem2);
        return dataItem;
    }
    function baseRow(element) {
        // 基底行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-column";
        const type = element.getType();
        const elementBase = element.getBase();

        const dataItem1 = document.createElement("div");
        dataItem1.className = "item-container-row";

        const textNode = document.createElement('p');
        textNode.textContent = '基底';
        dataItem1.appendChild(textNode);

        const textNode2 = document.createElement('p');
        textNode2.textContent = elementBase.type;
        dataItem1.appendChild(textNode2);

        dataItem.appendChild(dataItem1);

        if (elementBase.type !== 'none') {
            const dataItem2 = document.createElement("div");
            dataItem2.className = "item-container-row";
            let bases;
            if (type === "point") {
                bases = elementBase.bases;
            }else if (type === "line" || type === "circle") {
                bases = elementBase.figure;
            }

            bases.forEach((item) => {
                const textNode = document.createElement('p');
                textNode.textContent = item.getId();
                dataItem2.appendChild(textNode);
            });

            const textNode = document.createElement('p');
            textNode.textContent = '值';
            dataItem2.appendChild(textNode);

            const inputDE = document.createElement('p');
            inputDE.textContent = elementBase.value;
            dataItem2.appendChild(inputDE);

            dataItem.appendChild(dataItem2);
        }
        
        return dataItem;
    }
    function showRow(element) {
        // 显示行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-row";

        const textNode = document.createElement('p');
        textNode.textContent = '显示';
        dataItem.appendChild(textNode);

        const inputDE = document.createElement('p');
        if (element.getVisible()) {
            inputDE.textContent = "true";
        }else{
            inputDE.textContent = "false";
        }
        dataItem.appendChild(inputDE);

        const textNode2 = document.createElement('p');
        textNode2.textContent = '显示名称';
        dataItem.appendChild(textNode2);

        const inputDE2 = document.createElement('p');
        if (element.getShowName()) {
            inputDE2.textContent = "true";
        }else{
            inputDE2.textContent = "false";
        }
        dataItem.appendChild(inputDE2);
        
        return dataItem;
    }
    function colorRow(element) {
        // 颜色行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-row";

        const textNode = document.createElement('p');
        textNode.textContent = '颜色';
        dataItem.appendChild(textNode);
        
        const inputDE = document.createElement('p');
        inputDE.textContent = element.getColor();
        dataItem.appendChild(inputDE);
        
        return dataItem;
    }
    function validRow(element) {
        // 有效性行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-row";

        const textNode = document.createElement('p');
        textNode.textContent = '有效性';
        dataItem.appendChild(textNode);

        const textNode2 = document.createElement('p');
        if (element.getValid()) {
            textNode2.textContent = '有效';
        }else{
            textNode2.textContent = '无效';
        }
        dataItem.appendChild(textNode2);
        
        return dataItem;
    }
    function superstructureRow(element) {
        // 上层构造行
        const dataItem = document.createElement("div");
        dataItem.className = "item-container-column";
        const dataItem1 = document.createElement("div");
        dataItem1.className = "item-container-row";
        const dataItem2 = document.createElement("div");
        dataItem2.className = "item-container-row";
        const superstructure = element.getSuperstructure();

        const textNode = document.createElement('p');
        textNode.textContent = '上层构造';
        dataItem1.appendChild(textNode);

        if (superstructure.length === 0) {
            const textNode = document.createElement('p');
            textNode.textContent = '无';
            dataItem2.appendChild(textNode);
        }else{
            superstructure.forEach((item) => {
                const textNode = document.createElement('p');
                textNode.textContent = item.getId();
                dataItem2.appendChild(textNode);
            });
        }
        
        dataItem.appendChild(dataItem1);
        dataItem.appendChild(dataItem2);
        
        return dataItem;
    }
    function select(target, id, set) {
        if (set.has(id)) {
            set.delete(id);
            target.classList.remove('select');
            
            if (overviewPanelSelect === 'hidden') {
                const geometryElement = geometryManager.get(id);
                geometryElement.modifyVisible(true);
                drawContent();
            }
        }else{
            set.add(id);
            target.classList.add('select');
    
            if (overviewPanelSelect === 'hidden') {
                const geometryElement = geometryManager.get(id);
                geometryElement.modifyVisible(false);
                drawContent();
            }
        }
    }
}

/**
 * 几何查看器点击事件
 * @param {Object} event 
 */
function geometryItemClick(event) {
    const action = event.target?.dataset.action;
    if (!action) return;
    if (action === 'back') {
        closeItem();
    }
}

/**
 * 关闭元素查看器
 */
function closeItem() {
    const overviewMode = document.getElementById("geometry-item-list");
    const viewerMode = document.getElementById("geometry-item");
    overviewMode.style.display = "block";
    viewerMode.style.display = "none";
}
