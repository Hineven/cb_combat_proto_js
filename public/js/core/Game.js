import EventBus from './EventBus.js';
import StateManager, { GameStates } from './StateManager.js';
import SaveManager from './SaveManager.js';
import InputManager from './InputManager.js';
import RenderManager from '../rendering/RenderManager.js';
import AssetLoader from '../utils/AssetLoader.js';
import * as EVENT from './EventTypes.js';

/**
 * 游戏主类 - 作为游戏入口和控制中心
 */
class Game {
    constructor() {
        this.isInitialized = false;
        this.isPaused = false;
        this.gameTime = 0;
        this.deltaTime = 0;
        this.lastFrameTime = 0;
        this.gameObjects = [];
    }

    /**
     * 初始化游戏
     * @param {HTMLCanvasElement} canvas - 游戏画布
     */
    initialize(canvas) {
        if (this.isInitialized) return;
        
        // 初始化渲染系统
        RenderManager.initialize(canvas);
        
        // 设置资源加载事件
        this.setupAssetLoading();
        
        // 输入绑定
        this.setupInputBindings();
        
        // 注册核心事件处理
        this.registerEventHandlers();
        
        this.isInitialized = true;
        
        // 开始加载资源并启动游戏
        this.loadGameAssets().then(() => {
            this.startGameMode();
        });
    }

    /**
     * 设置资源加载
     */
    setupAssetLoading() {
        // 添加游戏需要的资源到加载队列
        // 这里仅作示例，实际资源根据游戏需求添加
        AssetLoader.addToQueue('texture', 'ground', './resources/world/ground_grass.png');
        // AssetLoader.addToQueue('texture', 'character', './assets/textures/character.png');
        // AssetLoader.addToQueue('data', 'levels', './assets/data/levels.json');
        
        // 监听资源加载进度
        EventBus.subscribe('assets:progress', (data) => {
            console.log(`资源加载进度: ${Math.round(data.progress * 100)}%`);
            // 这里可以更新加载界面
        });
    }

    /**
     * 加载游戏资源
     * @returns {Promise} 加载完成的Promise
     */
    loadGameAssets() {
        return AssetLoader.loadAll();
    }

    /**
     * 设置输入绑定
     */
    setupInputBindings() {
        // 绑定基本移动控制
        InputManager.bindAction('moveUp', 'KeyW');
        InputManager.bindAction('moveDown', 'KeyS');
        InputManager.bindAction('moveLeft', 'KeyA');
        InputManager.bindAction('moveRight', 'KeyD');
        
        // 绑定交互键
        InputManager.bindAction('interact', 'KeyE');
        
        // 绑定暂停键
        InputManager.bindAction('pause', 'Escape');
    }

    /**
     * 注册事件处理器
     */
    registerEventHandlers() {
        // 处理输入动作
        EventBus.subscribe('input:action', (data) => {
            if (data.action === 'pause' && data.active) {
                this.togglePause();
            }
        });
        
        // 处理状态变化
        EventBus.subscribe('state:changed', (data) => {
            console.log(`状态变化: ${data.previous} -> ${data.current}`);
            
            // 根据状态执行特定逻辑
            if (data.current === GameStates.PAUSED) {
                this.isPaused = true;
            } else if (data.previous === GameStates.PAUSED) {
                this.isPaused = false;
                this.lastFrameTime = performance.now();
            }
        });
    }

    /**
     * 开始游戏主循环
     */
    startGameMode() {
        StateManager.changeState(GameStates.GAMEMODE_LOADING);
        // StateManager.changeState(GameStates.MENU);
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * 游戏主循环
     * @param {number} timestamp - 当前时间戳
     */
    gameLoop(timestamp) {
        // 计算帧间隔时间
        this.deltaTime = (timestamp - this.lastFrameTime) / 1000; // 转换为秒
        this.lastFrameTime = timestamp;
        
        // 游戏暂停时不更新游戏逻辑
        if (!this.isPaused && StateManager.getCurrentState() === GameStates.PLAYING) {
            this.update(this.deltaTime);
            this.gameTime += this.deltaTime;
        }
        
        // 继续游戏循环
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * 更新游戏逻辑
     * @param {number} deltaTime - 帧间隔时间(秒)
     */
    update(deltaTime) {
        // 更新所有游戏对象
        this.gameObjects.forEach(obj => {
            if (obj.update) {
                obj.update(deltaTime);
            }
        });
        
        // 发布更新事件
        EventBus.publish(EVENT.GAME.UPDATE, { deltaTime, gameTime: this.gameTime });
    }

    /**
     * 切换游戏暂停状态
     */
    togglePause() {
        if (StateManager.getCurrentState() === GameStates.PLAYING) {
            StateManager.changeState(GameStates.PAUSED);
        } else if (StateManager.getCurrentState() === GameStates.PAUSED) {
            StateManager.changeState(GameStates.PLAYING);
        }
    }

    /**
     * 添加游戏对象
     * @param {Object} gameObject - 游戏对象
     */
    addGameObject(gameObject) {
        this.gameObjects.push(gameObject);
        gameObject.initialise();
        EventBus.publish(EVENT.GAME.OBJECT_ADDED, gameObject);
    }

    /**
     * 移除游戏对象
     * @param {Object} gameObject - 游戏对象
     */
    removeGameObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index !== -1) {
            this.gameObjects.splice(index, 1);
            EventBus.publish(EVENT.GAME.OBJECT_REMOVED, gameObject);
        }
    }

    /**
     * 获取游戏时间
     * @returns {number} 游戏运行时间(秒)
     */
    getGameTime() {
        return this.gameTime;
    }
}

// 导出单例
export default new Game();
