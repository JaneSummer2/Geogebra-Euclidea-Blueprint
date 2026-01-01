/* editToolBag.js */

class MoveTool {
    constructor() {
        this.toolName = 'move';
    }

    /**
     * 移动工具操作 过程函数
     * @param {string} type
     * @param {number} x
     * @param {number} y
     */
    toolEvent(type, oriX, oriY) {
        const x = (oriX - transform.x) / transform.scale;
        const y = (oriY - transform.y) / transform.scale;
        
        if (type === "start") {
            this.startEventFunctionMove(x, y);
        }else if (type === "draw") {
            this.drawEventFunctionMove(oriX, oriY);
        }
    }
    
    /**
     * 开始 过程函数
     * @param {number} x
     * @param {number} y
     */
    startEventFunctionMove(x, y) {
        geometryManager.deleteTool(this.toolName);
    
        if (subTool === "moveView") return;
        
        const [pointId] = geometryManager.near([x, y], ["point"]);
        if (pointId) {
            if (geometryManager.ifIdInCache(pointId)) {
                geometryManager.deleteToolQuote(pointId);
            }else{
                geometryManager.addToolObject(this.toolName, "choice", "quote", pointId);
            }
            return;
        }
        
        const [elementId] = geometryManager.near([x, y], ["line", "circle"]);
        if (elementId) {
            if (geometryManager.ifIdInCache(elementId)) {
                geometryManager.deleteToolQuote(elementId);
            }else{
                geometryManager.addToolObject(this.toolName, "choice", "quote", elementId);
            }
        }
    }
    
    /**
     * 拖拽 过程函数
     * @param {number} x
     * @param {number} y
     */
    drawEventFunctionMove(x, y) {
        if (subTool === "moveView") {
            drawCanvas();
            return;
        }
    
        const choice = geometryManager.getToolKey(this.toolName, "choice");
    
        function drawCanvas() {
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
        }
    
        if (!choice) {
            drawCanvas();
            return;
        }
        
        const type = choice.getType();
        if (type !== "point") drawCanvas();
        // 拖拽点
        const logicX = (x - transform.x) / transform.scale;
        const logicY = (y - transform.y) / transform.scale;
        const id = choice.getId();
        geometryManager.modifyPointCoordinate(id, logicX, logicY);
    }

    /**
     * 清除
     */
    clear() {
        geometryManager.deleteTool(this.toolName);
    }
}

class EraserTool {
    constructor() {
        this.toolName = 'eraser';
    }

    // 橡皮擦工具事件
    toolEvent(type, oriX, oriY) {
        const x = (oriX - transform.x) / transform.scale;
        const y = (oriY - transform.y) / transform.scale;
    
        if (type === "click") {
            this.clickEventFunctionEraser(x, y);
        }else if (type === "draw") {
            this.drawEventFunctionEraser(x, y);
        }
    }
    
    /**
     * 点击
     * @param {number} x 
     * @param {number} y 
     */
    clickEventFunctionEraser(x, y) {
        this.deleteEraser(x, y);
    }
    
    /**
     * 拖拽
     * @param {number} x 
     * @param {number} y 
     */
    drawEventFunctionEraser(x, y) {
        this.deleteEraser(x, y);
    }
    
    /**
     * 删除
     * @param {number} x 
     * @param {number} y 
     */
    deleteEraser(x, y) {
        if (subTool === "choicePoint") {
            const [id] = geometryManager.near([x, y], ["point"]);
            if (!id) return;
            geometryManager.deleteObject(id);
        }else{
            const [id] = geometryManager.near([x, y], ["point", 'line', 'circle']);
            if (!id) return;
            geometryManager.deleteObject(id);
        }
    }
}
