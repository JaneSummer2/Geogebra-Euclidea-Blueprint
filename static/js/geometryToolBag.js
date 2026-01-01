/* geometryToolBag.js */

class PointTool {
    constructor() {
        this.cachePointFlag = false;
        this.toolName = 'point';
    }

    /**
     * 点工具 过程函数
     * @param {string} type
     * @param {number} oriX 原x坐标
     * @param {number} oriY 原y坐标
     */
    toolEvent(type, oriX, oriY) {
        const x = (oriX - transform.x) / transform.scale;
        const y = (oriY - transform.y) / transform.scale;
        if (type === "click") {
            this.clickEventFunctionPoint(x, y);
        }else if (type === "draw") {
            this.drawEventFunctionPoint(x, y);
        }else if (type === "drawComplete") {
            this.drawCompleteEventFunctionPoint(x, y);
        }else if (type === "cancel") {
            this.cancelEventFunctionPoint();
        }
    }
    
    /**
     * 点击 过程函数
     * @param {number} x
     * @param {number} y
     */
    clickEventFunctionPoint(x, y) {
        this.createPoint(x, y);
        // 触发存储事件
        const event = new CustomEvent("storage", {
            detail: {
                type: "point",
            },
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 拖拽 过程函数
     * @param {number} x
     * @param {number} y
     */
    drawEventFunctionPoint(x, y) {
        if (!this.cachePointFlag) {
            this.createPointCache(x, y);
            this.cachePointFlag = true;
        }
        this.moveCachePoint(x, y);
    }
    
    /**
     * 拖拽完成 过程函数
     * @param {number} x
     * @param {number} y
     */
    drawCompleteEventFunctionPoint(x, y) {
        geometryManager.loadTool("point");
        this.cachePointFlag = false;
        // 触发存储事件
        const event = new CustomEvent("storage", {
            detail: {
                type: "point",
            },
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 取消 过程函数
     */
    cancelEventFunctionPoint() {
        if (this.cachePointFlag) {
            geometryManager.deleteTool("point");
            this.cachePointFlag = false;
        }
    }
    
    /**
     * 创建点 过程函数
     * @param {number} x
     * @param {number} y
     */
    createPoint(x, y) {
        let goalX = x,
            goalY = y;
        const exceptPoints = geometryManager.near([x, y], ["line", "circle"], 2);
        if (exceptPoints.length === 2) {
            const element1 = geometryManager.get(exceptPoints[0]);
            const element2 = geometryManager.get(exceptPoints[1]);
            if (element1.getType() === "line") {
                if (element2.getType() === "line") {
                    const flagValue = ToolsFunction.lineIntersectionByGeometryObject(element1, element2);
                    if (!flagValue) return;
                    const coord = flagValue.value;
                    goalX = coord.x;
                    goalY = coord.y;
                    
                    const pointObject = geometryManager.createPoint(goalX, goalY);
                    pointObject.modifyBase("intersection", [element1, element2], 0);
                    element1.addSuperstructure(pointObject);
                    element2.addSuperstructure(pointObject);
                    geometryManager.addObject(pointObject);
                
                }else if (element2.getType() === "circle") {
                    const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element1, element2);
                    if (countValue.count === 0) return;
                    
                    if (countValue.count === 1) {
                        const [coord] = countValue.value;
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        const pointObject = geometryManager.createPoint(goalX, goalY);
                        pointObject.modifyBase("intersection", [element1, element2], index);
                        element1.addSuperstructure(pointObject);
                        element2.addSuperstructure(pointObject);
                        geometryManager.addObject(pointObject);
                        
                    }else if (countValue.count === 2) {
                        const coord1 = countValue.value[0];
                        const coord2 = countValue.value[1];
                        const p3 = {x, y};
                        const distance1 = ToolsFunction.distance(coord1, p3);
                        const distance2 = ToolsFunction.distance(coord2, p3);
                        let index = 0;
                        if (distance1 > distance2) index = 1;
                        
                        const coord = countValue.value[index];
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        const pointObject = geometryManager.createPoint(goalX, goalY);
                        pointObject.modifyBase("intersection", [element1, element2], index);
                        element1.addSuperstructure(pointObject);
                        element2.addSuperstructure(pointObject);
                        geometryManager.addObject(pointObject);
                        
                    }
                }
            }else if (element1.getType() === "circle") {
                if (element2.getType() === "line") {
                    const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element2, element1);
                    if (countValue.count === 0) return;
                    
                    if (countValue.count === 1) {
                        const [coord] = countValue.value;
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        const pointObject = geometryManager.createPoint(goalX, goalY);
                        pointObject.modifyBase("intersection", [element1, element2], index);
                        element1.addSuperstructure(pointObject);
                        element2.addSuperstructure(pointObject);
                        geometryManager.addObject(pointObject);
                        
                    }else if (countValue.count === 2) {
                        const coord1 = countValue.value[0];
                        const coord2 = countValue.value[1];
                        const p3 = {x, y};
                        const distance1 = ToolsFunction.distance(coord1, p3);
                        const distance2 = ToolsFunction.distance(coord2, p3);
                        let index = 0;
                        if (distance1 > distance2) index = 1;
                        
                        const coord = countValue.value[index];
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        const pointObject = geometryManager.createPoint(goalX, goalY);
                        pointObject.modifyBase("intersection", [element1, element2], index);
                        element1.addSuperstructure(pointObject);
                        element2.addSuperstructure(pointObject);
                        geometryManager.addObject(pointObject);
                        
                    }
                }else if (element2.getType() === "circle") {
                    const countValue = ToolsFunction.circleCircleIntersectionByGeometryObject(element1, element2);
                    if (countValue.count === 0) return;
                    
                    if (countValue.count === 1) {
                        const [coord] = countValue.value;
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        const pointObject = geometryManager.createPoint(goalX, goalY);
                        pointObject.modifyBase("intersection", [element1, element2], index);
                        element1.addSuperstructure(pointObject);
                        element2.addSuperstructure(pointObject);
                        geometryManager.addObject(pointObject);
                        
                    }else if (countValue.count === 2) {
                        const coord1 = countValue.value[0];
                        const coord2 = countValue.value[1];
                        const p3 = {x, y};
                        const distance1 = ToolsFunction.distance(coord1, p3);
                        const distance2 = ToolsFunction.distance(coord2, p3);
                        let index = 0;
                        if (distance1 > distance2) index = 1;
                        
                        const coord = countValue.value[index];
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        const pointObject = geometryManager.createPoint(goalX, goalY);
                        pointObject.modifyBase("intersection", [element1, element2], index);
                        element1.addSuperstructure(pointObject);
                        element2.addSuperstructure(pointObject);
                        geometryManager.addObject(pointObject);
                    }
                }
            }
            
        }else if (exceptPoints.length === 1) {
            
            const item = geometryManager.get(exceptPoints[0]);
            if (item.getType() === "line") {
                const coordList = item.getCoordinate();
                const point1Coord = coordList[0];
                const point2Coord = coordList[1];
                const p1 = {x: point1Coord[0], y: point1Coord[1]};
                const p2 = {x: point2Coord[0], y: point2Coord[1]};
                const p3 = {x, y};
                
                const value = ToolsFunction.nearPointOnLine(p1, p2, p3);
                if (!value) return;
                const coord = ToolsFunction.scalePoint(p1, p2, value);
                goalX = coord.x;
                goalY = coord.y;
                
                const pointObject = geometryManager.createPoint(goalX, goalY);
                const geometryObject = item;
                pointObject.modifyBase("online", [geometryObject], value);
                geometryObject.addSuperstructure(pointObject);
                geometryManager.addObject(pointObject);
                
            }else if (item.getType() === "circle") {
                const coordList = item.getCoordinate();
                const point1Coord = coordList[0];
                const point2Coord = coordList[1];
                const p1 = {x: point1Coord[0], y: point1Coord[1]};
                const p2 = {x: point2Coord[0], y: point2Coord[1]};
                const p3 = {x, y};
                
                const value = ToolsFunction.nearPointOnCircle(p1, p3);
                const coord = ToolsFunction.radianToCoordinate(p1, p2, value);
                goalX = coord.x;
                goalY = coord.y;
                
                const pointObject = geometryManager.createPoint(goalX, goalY);
                const geometryObject = item;
                pointObject.modifyBase("online", [geometryObject], value);
                geometryObject.addSuperstructure(pointObject);
                geometryManager.addObject(pointObject);
            }
        }else if (exceptPoints.length === 0) {
            const pointObject = geometryManager.createPoint(goalX, goalY);
            geometryManager.addObject(pointObject);
        }
    }
    
    /**
     * 创建缓存点 过程函数
     * @param {number} x
     * @param {number} y
     */
    createPointCache(x, y) {
        geometryManager.addToolObject(this.toolName, "cache", "create", [x, y]);
    }
    
    /**
     * 移动缓存点 过程函数
     * @param {number} x
     * @param {number} y
     */
    moveCachePoint(x, y) {
        const point = geometryManager.getToolKey(this.toolName, "cache");
        const id = point.getId();
        let goalX = x,
            goalY = y;
        
        const exceptPoints = geometryManager.near([x, y], ["line", "circle"], 2);
        if (exceptPoints.length === 2) {
            geometryManager.deleteToolKey(this.toolName, "adsorb");
            point.clearBase();
            
            const element1 = geometryManager.get(exceptPoints[0]);
            const element2 = geometryManager.get(exceptPoints[1]);
            if (element1.getType() === "line") {
                if (element2.getType() === "line") {
                    const flagValue = ToolsFunction.lineIntersectionByGeometryObject(element1, element2);
                    if (!flagValue) return;
                    const coord = flagValue.value;
                    goalX = coord.x;
                    goalY = coord.y;
                    
                    point.modifyBase("intersection", [element1, element2], 0);
                    geometryManager.addToolObject(this.toolName, "inter1", "quote", exceptPoints[0]);
                    geometryManager.addToolObject(this.toolName, "inter2", "quote", exceptPoints[1]);
                
                }else if (element2.getType() === "circle") {
                    const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element1, element2);
                    if (countValue.count === 0) return;
                    
                    if (countValue.count === 1) {
                        const [coord] = countValue.value;
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        point.modifyBase("intersection", [element1, element2], 0);
                        geometryManager.addToolObject(this.toolName, "inter1", "quote", exceptPoints[0]);
                        geometryManager.addToolObject(this.toolName, "inter2", "quote", exceptPoints[1]);
                        
                    }else if (countValue.count === 2) {
                        const coord1 = countValue.value[0];
                        const coord2 = countValue.value[1];
                        const p3 = {x, y};
                        const distance1 = ToolsFunction.distance(coord1, p3);
                        const distance2 = ToolsFunction.distance(coord2, p3);
                        let index = 0;
                        if (distance1 > distance2) index = 1;
                        
                        const coord = countValue.value[index];
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        point.modifyBase("intersection", [element1, element2], index);
                        geometryManager.addToolObject(this.toolName, "inter1", "quote", exceptPoints[0]);
                        geometryManager.addToolObject(this.toolName, "inter2", "quote", exceptPoints[1]);
                        
                    }
                }
            }else if (element1.getType() === "circle") {
                if (element2.getType() === "line") {
                    const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element2, element1);
                    if (countValue.count === 0) return;
                    
                    if (countValue.count === 1) {
                        const [coord] = countValue.value;
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        point.modifyBase("intersection", [element1, element2], 0);
                        geometryManager.addToolObject(this.toolName, "inter1", "quote", exceptPoints[0]);
                        geometryManager.addToolObject(this.toolName, "inter2", "quote", exceptPoints[1]);
                        
                    }else if (countValue.count === 2) {
                        const coord1 = countValue.value[0];
                        const coord2 = countValue.value[1];
                        const p3 = {x, y};
                        const distance1 = ToolsFunction.distance(coord1, p3);
                        const distance2 = ToolsFunction.distance(coord2, p3);
                        let index = 0;
                        if (distance1 > distance2) index = 1;
                        
                        const coord = countValue.value[index];
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        point.modifyBase("intersection", [element1, element2], index);
                        geometryManager.addToolObject(this.toolName, "inter1", "quote", exceptPoints[0]);
                        geometryManager.addToolObject(this.toolName, "inter2", "quote", exceptPoints[1]);
                        
                    }
                }else if (element2.getType() === "circle") {
                    const countValue = ToolsFunction.circleCircleIntersectionByGeometryObject(element1, element2);
                    if (countValue.count === 0) return;
                    
                    if (countValue.count === 1) {
                        const [coord] = countValue.value;
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        point.modifyBase("intersection", [element1, element2], 0);
                        geometryManager.addToolObject(this.toolName, "inter1", "quote", exceptPoints[0]);
                        geometryManager.addToolObject(this.toolName, "inter2", "quote", exceptPoints[1]);
                        
                    }else if (countValue.count === 2) {
                        const coord1 = countValue.value[0];
                        const coord2 = countValue.value[1];
                        const p3 = {x, y};
                        const distance1 = ToolsFunction.distance(coord1, p3);
                        const distance2 = ToolsFunction.distance(coord2, p3);
                        let index = 0;
                        if (distance1 > distance2) index = 1;
                        
                        const coord = countValue.value[index];
                        goalX = coord.x;
                        goalY = coord.y;
                        
                        point.modifyBase("intersection", [element1, element2], index);
                        geometryManager.addToolObject(this.toolName, "inter1", "quote", exceptPoints[0]);
                        geometryManager.addToolObject(this.toolName, "inter2", "quote", exceptPoints[1]);
                        
                    }
                }
            }
            
        }else if (exceptPoints.length === 1) {
            geometryManager.deleteToolKey(this.toolName, "inter1");
            geometryManager.deleteToolKey(this.toolName, "inter2");
            point.clearBase();
            
            const item = geometryManager.get(exceptPoints[0]);
            if (item.getType() === "line") {
                const coordList = item.getCoordinate();
                const point1Coord = coordList[0];
                const point2Coord = coordList[1];
                const p1 = {x: point1Coord[0], y: point1Coord[1]};
                const p2 = {x: point2Coord[0], y: point2Coord[1]};
                const p3 = {x, y};
                
                const value = ToolsFunction.nearPointOnLine(p1, p2, p3);
                if (!value) return;
                const coord = ToolsFunction.scalePoint(p1, p2, value);
                goalX = coord.x;
                goalY = coord.y;
                
                const geometryObject = item;
                point.modifyBase("online", [geometryObject], value);
                geometryManager.addToolObject(this.toolName, "adsorb", "quote", exceptPoints[0]);
                
            }else if (item.getType() === "circle") {
                const coordList = item.getCoordinate();
                const point1Coord = coordList[0];
                const point2Coord = coordList[1];
                const p1 = {x: point1Coord[0], y: point1Coord[1]};
                const p2 = {x: point2Coord[0], y: point2Coord[1]};
                const p3 = {x, y};
                
                const value = ToolsFunction.nearPointOnCircle(p1, p3);
                const coord = ToolsFunction.radianToCoordinate(p1, p2, value);
                goalX = coord.x;
                goalY = coord.y;
                
                const geometryObject = item;
                point.modifyBase("online", [geometryObject], value);
                geometryManager.addToolObject(this.toolName, "adsorb", "quote", exceptPoints[0]);
            }
        }else if (exceptPoints.length === 0) {
            geometryManager.deleteToolKey(this.toolName, "inter1");
            geometryManager.deleteToolKey(this.toolName, "inter2");
            geometryManager.deleteToolKey(this.toolName, "adsorb");
            point.clearBase();
        }
        geometryManager.modifyToolObject(this.toolName, "cache", "create", [goalX, goalY]);
    }
    
    /**
     * 清空
     */
    clear() {
        geometryManager.deleteTool(this.toolName);
        this.cachePointFlag = false;
    }
}

class LineTool {
    constructor() {
        this.toolName = 'line';
        this.maxStatus = 2;
        this.goal = "line";
        this.goalType = "line";
        this.define = "twoPoints";
        this.drawType = "line";
        
        this.lineMode = new PointBaseToolTemplate(
            this.toolName,
            this.maxStatus,
            this.goal,
            this.goalType,
            this.define,
            this.drawType
            );
    }
    
    /**
     * 直线工具
     * @param {string} type
     * @param {number} oriX 原x坐标
     * @param {number} oriY 原y坐标
     */
    toolEvent(type, oriX, oriY) {
        if (subTool === 'style') {
            const x = (oriX - transform.x) / transform.scale;
            const y = (oriY - transform.y) / transform.scale;
            if (type === "click") {
                this.modifyLineStyle(x, y);
            }else if (type === "draw") {
                this.modifyLineStyle(x, y);
            }
        }else if (subTool === 'line') {
            this.lineMode.toolEvent(type, oriX, oriY);
        }
    }
    
    /**
     * 修改样式
     */
    modifyLineStyle(x, y) {
        const [id] = geometryManager.near([x, y], ['line']);
        if (!id) return;
        const line = geometryManager.get(id);
        line.modifyDrawType(this.toolName);
    }
    
    /**
     * 清空
     */
    clear() {
        this.lineMode.clear();
    }
}

class RayTool {
    constructor() {
        this.toolName = 'ray';
        this.maxStatus = 2;
        this.goal = "ray";
        this.goalType = "line";
        this.define = "twoPoints";
        this.drawType = "ray";
        
        this.lineMode = new PointBaseToolTemplate(
            this.toolName,
            this.maxStatus,
            this.goal,
            this.goalType,
            this.define,
            this.drawType
            );
    }
    
    /**
     * 射线工具
     * @param {string} type
     * @param {number} oriX 原x坐标
     * @param {number} oriY 原y坐标
     */
    toolEvent(type, oriX, oriY) {
        if (subTool === 'style') {
            const x = (oriX - transform.x) / transform.scale;
            const y = (oriY - transform.y) / transform.scale;
            if (type === "click") {
                this.modifyLineStyle(x, y);
            }else if (type === "draw") {
                this.modifyLineStyle(x, y);
            }
        }else if (subTool === 'ray') {
            this.lineMode.toolEvent(type, oriX, oriY);
        }
    }
    
    /**
     * 修改样式
     */
    modifyLineStyle(x, y) {
        const [id] = geometryManager.near([x, y], ['line']);
        if (!id) return;
        const line = geometryManager.get(id);
        line.modifyDrawType(this.toolName);
    }
    
    /**
     * 清空
     */
    clear() {
        this.lineMode.clear();
    }
}

class LineSegmentTool {
    constructor() {
        this.toolName = 'lineSegment';
        this.maxStatus = 2;
        this.goal = "lineSegment";
        this.goalType = "line";
        this.define = "twoPoints";
        this.drawType = "lineSegment";
        
        this.lineMode = new PointBaseToolTemplate(
            this.toolName,
            this.maxStatus,
            this.goal,
            this.goalType,
            this.define,
            this.drawType,
            );
    }
    
    /**
     * 线段工具
     * @param {string} type
     * @param {number} oriX 原x坐标
     * @param {number} oriY 原y坐标
     */
    toolEvent(type, oriX, oriY) {
        if (subTool === 'style') {
            const x = (oriX - transform.x) / transform.scale;
            const y = (oriY - transform.y) / transform.scale;
            if (type === "click") {
                this.modifyLineStyle(x, y);
            }else if (type === "draw") {
                this.modifyLineStyle(x, y);
            }
        }else if (subTool === 'lineSegment') {
            this.lineMode.toolEvent(type, oriX, oriY);
        }
    }
    
    /**
     * 修改样式
     */
    modifyLineStyle(x, y) {
        const [id] = geometryManager.near([x, y], ['line']);
        if (!id) return;
        const line = geometryManager.get(id);
        line.modifyDrawType(this.toolName);
    }
    
    /**
     * 清空
     */
    clear() {
        this.lineMode.clear();
    }
}

class CircleTool {
    constructor() {
        this.toolName = 'circle';
        this.maxStatus = 2;
        this.goal = "circle";
        this.goalType = "circle";
        this.define = "twoPoints";
        
        this.circleMode = new PointBaseToolTemplate(
            this.toolName,
            this.maxStatus,
            this.goal,
            this.goalType,
            this.define
            );
    }
    
    /**
     * 圆工具
     * @param {string} type
     * @param {number} oriX 原x坐标
     * @param {number} oriY 原y坐标
     */
    toolEvent(type, oriX, oriY) {
        this.circleMode.toolEvent(type, oriX, oriY);
    }
    
    /**
     * 清空
     */
    clear() {
        this.circleMode.clear();
    }
}

class IntersectionTool {
    constructor() {
        this.toolName = 'intersection';
        this.maxStatus = 2;
        this.exceptPointList = ["line", "circle"];
        
        this.intersectionMode = new ExceptPointBaseToolTemplate(
            this.toolName,
            this.maxStatus,
            this.exceptPointList,
            this.createIntersection
            );
    }
    
    /**
     * 交点工具
     * @param {string} type
     * @param {number} oriX 原x坐标
     * @param {number} oriY 原y坐标
     */
    toolEvent(type, oriX, oriY) {
        this.intersectionMode.toolEvent(type, oriX, oriY);
    }
    
    /**
     * 创建交点 过程函数
     */
    createIntersection() {
        const element1 = geometryManager.getToolKey(this.toolName, "choice1");
        const element2 = geometryManager.getToolKey(this.toolName, "choice2");
        const element1Type = element1.getType();
        const element2Type = element2.getType();
        
        if (element1Type === "line") {
            if (element2Type === "line") {
                const flagValue = ToolsFunction.lineIntersectionByGeometryObject(element1, element2);
                const flag = flagValue.flag;
                if (flag) {
                    const {x, y} = flagValue.value;
                    const point = geometryManager.createPoint(x, y);
                    point.modifyBase(this.toolName, [element1, element2], 0);
                    element1.addSuperstructure(point);
                    element2.addSuperstructure(point);
                    geometryManager.addToolObject(this.toolName, "intersection", "append", point);
                }
            }else if (element2Type === "circle") {
                const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element1, element2);
                const count = countValue.count;
                if (count === 0) {
                    inter2Has0(element1, element2);
                }else if (count === 1) {
                    inter2Has1(element1, element2, countValue);
                }else if (count === 2) {
                    inter2Has2(element1, element2, countValue);
                }
            }
        }else if (element1Type === "circle") {
            if (element2Type === "line") {
                const countValue = ToolsFunction.lineCircleIntersectionByGeometryObject(element2, element1);
                const count = countValue.count;
                if (count === 0) {
                    inter2Has0(element1, element2);
                }else if (count === 1) {
                    inter2Has1(element1, element2, countValue);
                }else if (count === 2) {
                    inter2Has2(element1, element2, countValue);
                }
            }else if (element2Type === "circle") {
                const countValue = ToolsFunction.circleCircleIntersectionByGeometryObject(element1, element2);
                const count = countValue.count;
                if (count === 0) {
                    inter2Has0(element1, element2);
                }else if (count === 1) {
                    inter2Has1(element1, element2, countValue);
                }else if (count === 2) {
                    inter2Has2(element1, element2, countValue);
                }
            }
        }
        
        function inter2Has0(element1, element2) {
            geometryManager.addToolObject('intersection', "intersection1", "create", [0, 0]);
            geometryManager.addToolObject('intersection', "intersection2", "create", [0, 0]);
            link(element1, element2);
            const inter1 = geometryManager.getToolKey('intersection', "intersection1");
            const inter2 = geometryManager.getToolKey('intersection', "intersection2");
            inter1.modifyValid(false);
            inter2.modifyValid(false);
        }
        function inter2Has1(element1, element2, countValue) {
            const coord = countValue.value[0];
            geometryManager.addToolObject('intersection', "intersection1", "create", [coord.x, coord.y]);
            geometryManager.addToolObject('intersection', "intersection2", "create", [0, 0]);
            link(element1, element2);
            const inter2 = geometryManager.getToolKey('intersection', "intersection2");
            inter2.modifyValid(false);
        }
        function inter2Has2(element1, element2, countValue) {
            const coord1 = countValue.value[0];
            const coord2 = countValue.value[1];
            geometryManager.addToolObject('intersection', "intersection1", "create", [coord1.x, coord1.y]);
            geometryManager.addToolObject('intersection', "intersection2", "create", [coord2.x, coord2.y]);
            link(element1, element2);
        }
        function link(element1, element2) {
            const inter1 = geometryManager.getToolKey('intersection', "intersection1");
            inter1.modifyBase("intersection", [element1, element2], 0);
            element1.addSuperstructure(inter1);
            element2.addSuperstructure(inter1);
            const inter2 = geometryManager.getToolKey('intersection', "intersection2");
            inter2.modifyBase("intersection", [element1, element2], 1);
            element1.addSuperstructure(inter2);
            element2.addSuperstructure(inter2);
        }
        
        geometryManager.loadTool(this.toolName);
    }
    
    /**
     * 清空
     */
    clear() {
        this.intersectionMode.clear();
    }
}
