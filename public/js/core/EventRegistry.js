import * as EventTypes from './EventTypes.js';

/**
 * 事件注册表
 * 包含所有事件的详细信息和参数结构
 */
class EventRegistry {
  constructor() {
    this.registry = {};
    this.initRegistry();
  }

  /**
   * 初始化事件注册表
   */
  initRegistry() {
    // 系统事件
    this.register(EventTypes.SYSTEM.INIT, {
      description: '系统初始化完成',
      params: {}
    });

    this.register(EventTypes.SYSTEM.ERROR, {
      description: '系统错误',
      params: {
        message: '错误消息',
        code: '错误代码（可选）',
        stack: '错误堆栈（可选）'
      }
    });

    // 状态事件
    this.register(EventTypes.STATE.CHANGED, {
      description: '游戏状态变更',
      params: {
        current: '当前状态',
        previous: '先前状态',
        data: '状态相关数据（可选）'
      }
    });

    // 资源事件
    this.register(EventTypes.ASSETS.LOAD_START, {
      description: '资源加载开始',
      params: {
        total: '总资源数量'
      }
    });

    this.register(EventTypes.ASSETS.PROGRESS, {
      description: '资源加载进度更新',
      params: {
        loaded: '已加载资源数',
        total: '总资源数',
        progress: '进度百分比（0-1）'
      }
    });

    this.register(EventTypes.ASSETS.LOAD_COMPLETE, {
      description: '所有资源加载完成',
      params: '加载完成的资源对象'
    });

    this.register(EventTypes.ASSETS.LOAD_ERROR, {
      description: '资源加载错误',
      params: {
        error: '错误对象',
        url: '资源URL（可选）'
      }
    });

    // 输入事件
    this.register(EventTypes.INPUT.ACTION, {
        description: '输入动作触发',
        params: {
            action: '动作名称',
            active: '是否激活'
        }
    });
    
    this.register(EventTypes.INPUT.KEY_DOWN, {
      description: '按键按下',
      params: {
        code: '按键代码',
        key: '按键名称'
      }
    });

    this.register(EventTypes.INPUT.KEY_UP, {
      description: '按键释放',
      params: {
        code: '按键代码',
        key: '按键名称'
      }
    });

    // 添加鼠标移动事件
    this.register(EventTypes.INPUT.MOUSE_MOVE, {
      description: '鼠标移动',
      params: {
        x: '鼠标X坐标',
        y: '鼠标Y坐标',
        deltaX: 'X轴移动距离（可选）',
        deltaY: 'Y轴移动距离（可选）'
      }
    });

    // 添加鼠标按下事件
    this.register(EventTypes.INPUT.MOUSE_DOWN, {
      description: '鼠标按下',
      params: {
        x: '鼠标X坐标',
        y: '鼠标Y坐标',
        button: '按下的按钮'
      }
    });

    // 添加鼠标释放事件
    this.register(EventTypes.INPUT.MOUSE_UP, {
      description: '鼠标释放',
      params: {
        x: '鼠标X坐标',
        y: '鼠标Y坐标',
        button: '释放的按钮'
      }
    });

    // 添加鼠标滚轮事件
    this.register(EventTypes.INPUT.MOUSE_WHEEL, {
      description: '鼠标滚轮',
      params: {
        deltaY: '滚动量'
      }
    });

    // 添加触摸事件
    this.register(EventTypes.INPUT.TOUCH_START, {
      description: '触摸开始',
      params: {
        touches: '触摸点列表'
      }
    });

    this.register(EventTypes.INPUT.TOUCH_MOVE, {
      description: '触摸移动',
      params: {
        touches: '触摸点列表'
      }
    });

    this.register(EventTypes.INPUT.TOUCH_END, {
      description: '触摸结束',
      params: {
        touches: '触摸点列表'
      }
    });

    // 添加其他事件注册...
    // 省略部分事件注册以简化代码...

    // 游戏事件
    this.register(EventTypes.GAME.UPDATE, {
      description: '游戏逻辑更新',
      params: {
        deltaTime: '帧时间间隔（秒）',
        gameTime: '游戏总运行时间（秒）'
      }
    });

    this.register(EventTypes.GAME.OBJECT_ADDED, {
        description: '游戏对象添加',
        params: '添加的游戏对象实例'
    });

    this.register(EventTypes.GAME.OBJECT_REMOVED, {
        description: '游戏对象移除',
        params: '移除的游戏对象实例'
    });

    // 渲染事件
    this.register(EventTypes.RENDER.INITIALIZED, {
      description: '渲染系统初始化完成',
      params: '渲染管理器实例'
    });

    // 存档事件
    this.register(EventTypes.SAVE.COMPLETE, {
      description: '游戏存档完成',
      params: {
        slot: '存档槽',
        success: '是否成功',
        error: '错误信息（如果失败）'
      }
    });
  }

  /**
   * 注册一个事件
   * @param {string} eventName - 事件名称
   * @param {Object} eventInfo - 事件信息
   */
  register(eventName, eventInfo) {
    this.registry[eventName] = eventInfo;
  }

  /**
   * 获取事件信息
   * @param {string} eventName - 事件名称
   * @returns {Object|null} 事件信息或null
   */
  getEventInfo(eventName) {
    return this.registry[eventName] || null;
  }

  /**
   * 获取所有已注册事件
   * @returns {Object} 所有事件信息
   */
  getAllEvents() {
    return { ...this.registry };
  }

  /**
   * 验证事件参数
   * @param {string} eventName - 事件名称
   * @param {any} data - 事件数据
   * @returns {boolean} 是否有效
   */
  validateEventData(eventName, data) {
    const eventInfo = this.getEventInfo(eventName);
    if (!eventInfo) return false;
    
    // 这里可以添加更复杂的验证逻辑
    return true;
  }
}

// 导出单例
export default new EventRegistry();
