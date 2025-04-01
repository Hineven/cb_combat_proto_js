import EventBus from './EventBus.js';
import * as EvenrTypes from './EventTypes.js';

/**
 * 游戏状态类型枚举
 */
export const GameStates = {
    PRE_LOADING: 'preLoading', // 预加载 (GameMode加载前，用于加载资源)
    GAMEMODE_LOADING: 'gamemodeLoading', // 加载中 (GameMode加载，创建GameObject等)
    MENU: 'menu', // 暂停菜单 (游戏暂停，显示菜单)
    PLAYING: 'playing', // 游戏进行中 (游戏运行状态)
    DIALOG: 'dialog', // 对话 (游戏暂停，显示对话框)
    CUTSCENE: 'cutscene', // 过场动画 (游戏暂停，显示过场动画)
    GAME_OVER: 'gameOver' // 游戏结束 (游戏结束状态)
};

/**
 * 游戏状态管理器 - 负责管理游戏状态和状态转换
 */
class StateManager {
    constructor() {
        this.currentState = GameStates.PRE_LOADING; // 初始状态
        this.previousState = null;
        this.stateData = {};
    }

    /**
     * 切换游戏状态
     * @param {string} newState - 新状态
     * @param {Object} data - 状态相关数据
     */
    changeState(newState, data = {}) {
        if (!Object.values(GameStates).includes(newState)) {
            console.error(`状态 ${newState} 不存在`);
            return;
        }

        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateData = data;
        
        // 通过事件总线通知状态变化
        EventBus.publish(EvenrTypes.STATE.CHANGED, {
            current: newState,
            previous: this.previousState,
            data: this.stateData
        });
        
        console.log(`游戏状态从 ${this.previousState} 变为 ${this.currentState}`);
    }

    /**
     * 获取当前状态
     * @returns {string} 当前状态
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * 获取上一个状态
     * @returns {string|null} 上一个状态
     */
    getPreviousState() {
        return this.previousState;
    }

    /**
     * 返回上一个状态
     */
    revertToPreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState);
        }
    }

    /**
     * 检查是否处于指定状态
     * @param {string} state - 要检查的状态
     * @returns {boolean} 是否在指定状态
     */
    isInState(state) {
        return this.currentState === state;
    }
}

// 导出单例
export default new StateManager();
