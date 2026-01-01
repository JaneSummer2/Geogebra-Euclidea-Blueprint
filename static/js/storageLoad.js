/* storageLoad.js */

/**
 * 几何元素全存储
 */
class StorageManager {
    constructor() {
        this.repository = [];
        this.pointer = -1;
        this.status = false;
    }
    
    /**
     * 存储
     * @param {any} elements
     */
    append(elements) {
        if (!this.status) return;
        this.pointer++;
        // 删除后继列表元素并添加新元素
        this.repository.splice(this.pointer, Infinity, elements);
    }
    
    /**
     * 恢复
     * @returns {{id: Object}}
     */
    restore() {
        if (this.pointer === 0) return;
        this.pointer--;
        const copy = Object.assign({}, this.repository[this.pointer]);
        return copy;
    }
    
    /**
     * 重做
     * @returns {{id: Object}}
     */
    redo() {
        if (this.pointer === this.repository.length) return;
        this.pointer++;
        const copy = Object.assign({}, this.repository[this.pointer]);
        return copy;
    }
    
    /**
     * 获取指针状态
     * @returns {[boolean, boolean]} top-bottom
     */
    getPointerStatus() {
        const len = this.repository.length;
        const list = new Array();
        if (this.pointer + 1 === len) {
            list.push(true);
        }else{
            list.push(false);
        }
        if (this.pointer <= 0) {
            list.push(true);
        }else{
            list.push(false);
        }
        return list;
    }
    
    /**
     * 重置
     */
    clear() {
        this.repository = [];
        this.pointer = -1;
    }

    /**
     * 使能
     * @param {boolean} bool 
     */
    setStatus(bool) {
        this.status = bool;
    }

    /**
     * 序列化
     * @returns {string} JSON
     */
    serialization() {
        const dict = {};
        dict.repository = this.repository;
        dict.pointer = this.pointer;
        dict.status = this.status;
        const json = stringify(dict);
        return json;
    }

    /**
     * 反序列化
     * @param {string} json 
     */
    deserialization(json) {
        const dict = parse(json);
        this.repository = dict.repository;
        this.pointer = dict.pointer;
        this.status = dict.status;
    }
}

/**
 * 步数存储
 */
class MovesStorageManager {
    constructor() {
        this.repository = [];
        this.pointer = -1;
        this.status = false;
    }
    
    /**
     * 存储
     * @param {{string: number}} moveDict
     */
    append(moveDict) {
        if (!this.status) return;
        this.pointer++;
        // 浅拷贝避免同一对象引用
        const copyDict = Object.assign({}, moveDict);
        // 删除后继列表元素并添加新元素
        this.repository.splice(this.pointer, Infinity, copyDict);
    }

    /**
     * 读取
     * @returns {{string: number}}
     */
    get() {
        const copy = Object.assign({}, this.repository[this.pointer]);
        return copy;
    }
    
    /**
     * 恢复
     * @returns {{string: number}}
     */
    restore() {
        if (this.pointer === 0) return;
        this.pointer--;
        const copy = Object.assign({}, this.repository[this.pointer]);
        return copy;
    }
    
    /**
     * 重做
     * @returns {{string: number}}
     */
    redo() {
        if (this.pointer === this.repository.length) return;
        this.pointer++;
        const copy = Object.assign({}, this.repository[this.pointer]);
        return copy;
    }
    
    /**
     * 重置
     */
    clear() {
        this.repository = [];
        this.pointer = -1;
    }

    /**
     * 使能
     * @param {boolean} bool 
     */
    setStatus(bool) {
        this.status = bool;
    }
    
    /**
     * 序列化
     * @returns {string} JSON
     */
    serialization() {
        const dict = {};
        dict.repository = this.repository;
        dict.pointer = this.pointer;
        dict.status = this.status;
        const json = JSON.stringify(dict);
        return json;
    }

    /**
     * 反序列化
     * @param {string} json 
     */
    deserialization(json) {
        const dict = JSON.parse(json);
        this.repository = dict.repository;
        this.pointer = dict.pointer;
        this.status = dict.status;
    }
}
