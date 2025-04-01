/**
 * 组件基类 - 游戏对象的功能模块
 */
class Component {
    constructor() {
        this.gameObject = null;
        this.active = true;
    }

    /**
     * 组件附加到游戏对象时调用
     */
    onAttach() {
        // 子类重写此方法
    }

    /**
     * 每帧更新
     * @param {number} deltaTime - 帧时间差
     */
    update(deltaTime) {
        // 子类重写此方法
    }

    /**
     * 组件从游戏对象移除时调用
     */
    onDetach() {
        // 子类重写此方法
    }

    /**
     * 组件销毁时调用
     */
    onDestroy() {
        // 子类重写此方法
    }
}

export default Component;
