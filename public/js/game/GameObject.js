import EventBus from '../core/EventBus.js';

/**
 * 游戏对象基类 - 所有游戏实体的基础类
 */
class GameObject {
    constructor(id, name) {
        this.id = id || crypto.randomUUID();
        this.name = name || `GameObject_${this.id}`;
        this.active = true;
        this.parent = null;
        this.children = [];
        this.tags = new Set();
        
        // 基本属性
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
    }

    /**
     * 初始化游戏对象，在被添加到Game时被其调用。
     */
    initialize() {
        // 子类重写此方法
    }

    /**
     * 更新游戏对象
     * @param {number} deltaTime - 帧时间差
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // 更新逻辑，由子类实现
        
        // 更新所有子对象
        for (const child of this.children) {
            child.update(deltaTime);
        }
    }

    /**
     * 更新游戏对象的渲染
     * @param {number} deltaTime - 帧时间差
     */
    updateRender(deltaTime) {
        if (!this.active) return;
        
        // 更新渲染，由子类实现
        
        // 更新所有子对象的渲染
        for (const child of this.children) {
            child.updateRender(deltaTime);
        }
    }

    /**
     * 添加子对象
     * @param {GameObject} child - 子游戏对象
     */
    addChild(child) {
        if (child.parent) {
            child.parent.removeChild(child);
        }
        this.children.push(child);
        child.parent = this;
    }

    /**
     * 移除子对象
     * @param {GameObject} child - 要移除的子对象
     * @returns {boolean} 是否成功移除
     */
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
            return true;
        }
        return false;
    }

    /**
     * 添加标签
     * @param {string} tag - 标签名
     */
    addTag(tag) {
        this.tags.add(tag);
    }

    /**
     * 检查是否有标签
     * @param {string} tag - 标签名
     * @returns {boolean} 是否有该标签
     */
    hasTag(tag) {
        return this.tags.has(tag);
    }

    /**
     * 移除标签
     * @param {string} tag - 标签名
     */
    removeTag(tag) {
        this.tags.delete(tag);
    }

    /**
     * 设置位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} z - Z坐标
     */
    setPosition(x, y, z = 0) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    /**
     * 设置旋转
     * @param {number} x - X轴旋转
     * @param {number} y - Y轴旋转
     * @param {number} z - Z轴旋转
     */
    setRotation(x, y, z = 0) {
        this.rotation.x = x;
        this.rotation.y = y;
        this.rotation.z = z;
    }

    /**
     * 设置缩放
     * @param {number} x - X轴缩放
     * @param {number} y - Y轴缩放
     * @param {number} z - Z轴缩放
     */
    setScale(x, y, z = 1) {
        this.scale.x = x;
        this.scale.y = y;
        this.scale.z = z;
    }

    /**
     * 销毁游戏对象
     */
    destroy() {
        // 销毁所有子对象
        for (const child of [...this.children]) {
            child.destroy();
        }
        
        // 从父对象中移除自己
        if (this.parent) {
            this.parent.removeChild(this);
        }
        
        // 清理自身资源
        this.onDestroy();
        
        EventBus.publish('gameObject:destroyed', this);
    }

    /**
     * 销毁时调用，用于清理资源
     */
    onDestroy() {
        // 子类重写此方法
    }

    /**
     * 碰撞检测方法
     * @param {GameObject} other - 另一个游戏对象
     * @returns {boolean} 是否发生碰撞
     */
    checkCollision(other) {
        // 基础的碰撞检测逻辑，子类可重写
        return false;
    }

    /**
     * 碰撞响应
     * @param {GameObject} other - 与之碰撞的游戏对象
     */
    onCollision(other) {
        // 子类重写此方法
    }
}

export default GameObject;
