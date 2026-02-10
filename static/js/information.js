const infDict = {
    "restore": {title: "撤销", context: "撤回上一步"},
    "redo": {title: "重做", context: "还原下一步"},
    "open-menu": {title: "菜单", context: "里面的功能主要针对全局"},
    "switch-construct": {title: "构造面板", context: ""},
    "switch-overview": {title: "几何元素一览面板", context: "可以查看所有的元素，快速编辑"},
    "clear-canvas": {title: "清空画布", context: ""},
    "play-start": {title: "游玩模式", context: "切换到几何构造模式"},
    "switch-file": {title: "文件面板", context: "可以加载文件，导出文件"},
    "design-mode": {title: "设计模式", context: "切换到几何制图模式"},
    "switch-record": {title: "纪录面板", context: "保存构造纪录"},
    "explore-mode": {title: "探索模式", context: "给定目标图形，方便刻画"},
    "edit-information": {title: "编辑文件信息", context: ""},
    "close": {title: "关闭", context: ""},
    "close-menu": {title: "关闭", context: ""},
    "screenshot": {title: "截图", context: "框选区域进行截图"},
    "clear-screenshot": {title: "清空截图", context: ""},
    "result-number-add": {title: "增加解的数量", context: "用于设置多个解的情况"},
    "result-number-sub": {title: "减少解的数量", context: "用于设置多个解的情况"},
    "overview-list": {title: "选择器", context: "用于设置在游玩模式的给定图形，目标图形"},
    "dropdown-choice-all": {title: "所有", context: "点击元素以查看"},
    "dropdown-choice-hidden": {title: "隐藏", context: "点击元素隐藏"},
    "dropdown-choice-initial": {title: "给定图形", context: "设置游玩模式给定图形"},
    "dropdown-choice-name": {title: "显示名称", context: "设置游玩模式显示名称的图形"},
    "dropdown-choice-movepoints": {title: "调动点", context: "比如给定直线，游玩模式需要通过直线的定义点来调整直线，但游玩过程中不需要使用给定直线的定义点"},
    "dropdown-choice-result-1": {title: "目标图形", context: "设置游玩模式目标图形"},
    "dropdown-choice-completedShow-1": {title: "目标显示图形", context: "达成目标显示的图形，缺省则与result一致"},
    "dropdown-choice-explore": {title: "探索图形", context: "设置游玩模式下探索模式的图形，缺省则与result-1一致"},
    "dropdown-choice-rules": {title: "限制图形", context: "设置游玩模式下图形的限制位置，有相交、不相交、长度比较和角度比较"},
    "file-load": {title: "加载文件", context: ""},
    "file-down": {title: "导出文件", context: ""},
    "file-part-down": {title: "导出文件的部分内容", context: "比如截图，生成图片"},
    "dropdown-fileDown-gmt": {title: "GMT", context: "Geometry\nEuclidea的几何数据文件"},
    "dropdown-fileDown-ggb": {title: "GGB", context: "Geogebra\nGeogebra的几何数据文件"},
    "dropdown-fileDown-geb": {title: "GEB", context: "Geogebra Euclidea Blueprint\nGeogebra Euclidea Blueprint的几何数据文件"},
    "add-record": {title: "保存纪录", context: ""},
    "delete-record": {title: "删除纪录", context: "打开/关闭删除纪录模式，点击纪录删除"},
    "cover-record": {title: "覆盖纪录", context: "打开/关闭覆盖纪录模式，点击纪录覆盖\n把目前状态覆盖至该纪录中"},
    "rename-record": {title: "重命名纪录", context: ""},
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
    
    const infDE = document.getElementById("information");
    infDE.classList.add("active");
    if (window.innerWidth - event.x < 100) {
        infDE.style.removeProperty('left');
        infDE.style.right = `${window.innerWidth - event.x + 10}px`;
    }else{
        infDE.style.removeProperty('right');
        infDE.style.left = `${event.x + 10}px`;
    }
    if (window.innerHeight - event.y < 80) {
        infDE.style.removeProperty('top');
        infDE.style.bottom = `${window.innerHeight - event.y + 10}px`;
    }else{
        infDE.style.removeProperty('bottom');
        infDE.style.top = `${event.y + 10}px`;
    }
    
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
    const infDE = document.getElementById("information");
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
    if (window.innerWidth - event.x < 100) {
        infDE.style.removeProperty('left');
        infDE.style.right = `${window.innerWidth - event.x + 10}px`;
    }else{
        infDE.style.removeProperty('right');
        infDE.style.left = `${event.x + 10}px`;
    }
    if (window.innerHeight - event.y < 80) {
        infDE.style.removeProperty('top');
        infDE.style.bottom = `${window.innerHeight - event.y + 10}px`;
    }else{
        infDE.style.removeProperty('bottom');
        infDE.style.top = `${event.y + 10}px`;
    }

    const title = infDict[inf].title;
    const context = infDict[inf].context;
    infDE.innerHTML = `
        <p class="inf-title">${title}</p>
        <p class="inf-context">${context}</p>
    `;
}