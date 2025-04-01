import EventBus from './EventBus.js';
import { INPUT } from './EventTypes.js';

class InputManager {
  constructor(target = document) {
    this.target = target;
    this.keys = {};
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = { left: false, middle: false, right: false };
    this.touches = [];
    this.bindings = {};
    this.initialize();
  }

  initialize() {
    // 鼠标事件监听
    this.target.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.target.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.target.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.target.addEventListener('wheel', this.handleMouseWheel.bind(this));
    
    // 键盘事件监听
    this.target.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.target.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // 触摸事件监听
    this.target.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.target.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.target.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  // 使用EventTypes中定义的常量发布事件
  handleMouseMove(e) {
    this.mousePosition.x = e.clientX;
    this.mousePosition.y = e.clientY;
    EventBus.publish(INPUT.MOUSE_MOVE, {
      x: e.clientX,
      y: e.clientY,
      deltaX: e.movementX || 0,
      deltaY: e.movementY || 0
    });
  }

  handleMouseDown(e) {
    switch (e.button) {
      case 0: this.mouseButtons.left = true; break;
      case 1: this.mouseButtons.middle = true; break;
      case 2: this.mouseButtons.right = true; break;
    }
    EventBus.publish(INPUT.MOUSE_DOWN, {
      x: e.clientX,
      y: e.clientY,
      button: e.button
    });
  }

  handleMouseUp(e) {
    switch (e.button) {
      case 0: this.mouseButtons.left = false; break;
      case 1: this.mouseButtons.middle = false; break;
      case 2: this.mouseButtons.right = false; break;
    }
    EventBus.publish(INPUT.MOUSE_UP, {
      x: e.clientX,
      y: e.clientY,
      button: e.button
    });
  }

  handleMouseWheel(e) {
    EventBus.publish(INPUT.MOUSE_WHEEL, {
      deltaY: e.deltaY
    });
  }

  handleKeyDown(e) {
    this.keys[e.code] = true;
    EventBus.publish(INPUT.KEY_DOWN, {
      code: e.code,
      key: e.key
    });
    this.triggerBindings(e.code, true);
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
    EventBus.publish(INPUT.KEY_UP, {
      code: e.code,
      key: e.key
    });
    this.triggerBindings(e.code, false);
  }

  handleTouchStart(e) {
    this.touches = Array.from(e.touches);
    EventBus.publish(INPUT.TOUCH_START, {
      touches: Array.from(e.touches)
    });
  }

  handleTouchMove(e) {
    this.touches = Array.from(e.touches);
    EventBus.publish(INPUT.TOUCH_MOVE, {
      touches: Array.from(e.touches)
    });
  }

  handleTouchEnd(e) {
    this.touches = Array.from(e.touches);
    EventBus.publish(INPUT.TOUCH_END, {
      touches: Array.from(e.touches)
    });
  }

  /**
   * 绑定输入到指定动作
   * @param {string} action - 动作名称
   * @param {string} inputCode - 输入代码
   */
  bindAction(action, inputCode) {
    this.bindings[inputCode] = this.bindings[inputCode] || [];
    if (!this.bindings[inputCode].includes(action)) {
      this.bindings[inputCode].push(action);
    }
  }

  /**
   * 解除输入绑定
   * @param {string} action - 动作名称
   * @param {string} inputCode - 输入代码
   */
  unbindAction(action, inputCode) {
    if (this.bindings[inputCode]) {
      this.bindings[inputCode] = this.bindings[inputCode].filter(a => a !== action);
    }
  }

  /**
   * 触发绑定的动作
   * @param {string} inputCode - 输入代码
   * @param {boolean} isActive - 是否激活
   */
  triggerBindings(inputCode, isActive) {
    if (this.bindings[inputCode]) {
      this.bindings[inputCode].forEach(action => {
        EventBus.publish(INPUT.ACTION, {
          action,
          active: isActive
        });
      });
    }
  }

  /**
   * 检查按键是否被按下
   * @param {string} keyCode - 键码
   * @returns {boolean} 是否按下
   */
  isKeyPressed(keyCode) {
    return this.keys[keyCode] === true;
  }

  /**
   * 获取鼠标位置
   * @returns {Object} 鼠标位置
   */
  getMousePosition() {
    return { ...this.mousePosition };
  }

  /**
   * 检查鼠标按钮是否被按下
   * @param {string} button - 鼠标按钮
   * @returns {boolean} 是否按下
   */
  isMouseButtonPressed(button) {
    return this.mouseButtons[button] === true;
  }
}

export default new InputManager();
