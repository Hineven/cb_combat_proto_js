/**
 * 游戏事件类型常量
 * 集中管理所有事件名称，按模块分组
 */

// 系统事件
export const SYSTEM = {
  INIT: 'system:init',
  ERROR: 'system:error'
};

// 状态事件
export const STATE = {
  CHANGED: 'state:changed'
};

// 资源事件
export const ASSETS = {
  LOAD_START: 'assets:loadstart',
  PROGRESS: 'assets:progress',
  LOAD_COMPLETE: 'assets:loadcomplete',
  LOAD_ERROR: 'assets:loaderror'
};

// 输入事件
export const INPUT = {
  KEY_DOWN: 'input:keydown',
  KEY_UP: 'input:keyup',
  MOUSE_MOVE: 'input:mousemove',
  MOUSE_DOWN: 'input:mousedown',
  MOUSE_UP: 'input:mouseup',
  MOUSE_WHEEL: 'input:mousewheel',
  TOUCH_START: 'input:touchstart',
  TOUCH_MOVE: 'input:touchmove',
  TOUCH_END: 'input:touchend',
  ACTION: 'input:action'
};

// 游戏事件
export const GAME = {
  UPDATE: 'game:update',
  OBJECT_ADDED: 'game:objectAdded',
  OBJECT_REMOVED: 'game:objectRemoved'
};

// 渲染事件
export const RENDER = {
  INITIALIZED: 'render:initialized',
  LAYERS_INITIALIZED: 'render:layersInitialized'
};

// 存档事件
export const SAVE = {
  COMPLETE: 'save:complete',
  DELETED: 'save:deleted',
  LOAD_COMPLETE: 'load:complete'
};
