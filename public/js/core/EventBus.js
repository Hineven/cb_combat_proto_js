import mitt from 'mitt';
import EventRegistry from './EventRegistry.js';

/**
 * 事件总线 - 基于mitt库的高效实现
 * 使用中央事件注册表进行事件管理
 */
class EventBus {
    constructor() {
        this.emitter = mitt();
        this.registry = EventRegistry;
        this.debugMode = false;
    }

    /**
     * 设置调试模式
     * @param {boolean} enabled - 是否启用调试
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * 订阅事件
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    subscribe(eventName, callback) {
        // 在调试模式下验证事件
        if (this.debugMode) {
            const eventInfo = this.registry.getEventInfo(eventName);
            if (!eventInfo) {
                console.warn(`订阅未注册的事件: ${eventName}`);
            }
        }

        this.emitter.on(eventName, callback);
        
        // 返回取消订阅的方法
        return () => {
            this.emitter.off(eventName, callback);
        };
    }

    /**
     * 发布事件
     * @param {string} eventName - 事件名称
     * @param {any} data - 事件数据
     */
    publish(eventName, data) {
        // 在调试模式下验证事件和数据
        if (this.debugMode) {
            const eventInfo = this.registry.getEventInfo(eventName);
            if (!eventInfo) {
                console.warn(`发布未注册的事件: ${eventName}`);
            } else if (!this.registry.validateEventData(eventName, data)) {
                console.warn(`事件数据不符合预期格式: ${eventName}`, data);
            }
            
            // 日志记录事件
            // console.log(`[事件] ${eventName}`, data);
        }

        this.emitter.emit(eventName, data);
    }

    /**
     * 清除某个事件的所有订阅
     * @param {string} eventName - 事件名称
     */
    clear(eventName) {
        if (eventName) {
            this.emitter.all.delete(eventName);
        } else {
            this.emitter.all.clear();
        }
    }

    /**
     * 获取所有已注册事件的信息
     * @returns {Object} 事件信息
     */
    getAllEventInfo() {
        return this.registry.getAllEvents();
    }
}

// 导出单例
export default new EventBus();
