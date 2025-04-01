import EventBus from '../core/EventBus.js';
import StateManager, { GameStates } from '../core/StateManager.js';
import Game from '../core/Game.js';
/**
 * 渲染管理器 - 管理所有渲染层和场景
 */
class RenderManager {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.mainScene = null;
        this.uiScene = null;
        this.camera = null;
        this.light = null;
        
        // 渲染层
        this.layers = {
            scene: null,
            ui: null,
            dialog: null,
            menu: null
        };
    }

    /**
     * 初始化渲染系统
     * @param {HTMLCanvasElement} canvas - 渲染画布
     */
    initialize(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        
        // 创建主场景
        this.mainScene = new BABYLON.Scene(this.engine);
        this.mainScene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        
        // 创建UI场景
        this.uiScene = new BABYLON.Scene(this.engine);
        this.uiScene.autoClear = false; // 不清除之前渲染的内容
        
        // 设置默认相机
        this.camera = new BABYLON.FreeCamera("MainCamera", new BABYLON.Vector3(0, 0, -10),
                                               this.mainScene);

        // 设置UIScene的相机
        const uiCamera = new BABYLON.FreeCamera("UICamera", new BABYLON.Vector3(0, 0, -10), this.uiScene);
        uiCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        uiCamera.orthoTop = this.canvas.height / 2;
        uiCamera.orthoBottom = -this.canvas.height / 2;
        uiCamera.orthoLeft = -this.canvas.width / 2;
        uiCamera.orthoRight = this.canvas.width / 2;
        this.uiScene.activeCamera = uiCamera;
        
        // 确保设置活动相机
        this.mainScene.activeCamera = this.camera;

        this.uiScene.activeCamera = uiCamera;
        
        // 设置默认光源
        this.light = new BABYLON.HemisphericLight("MainLight", 
                                               new BABYLON.Vector3(0, 1, 0), 
                                               this.mainScene);
        
        // 初始化渲染层
        this.initializeLayers();
        
        // 设置渲染循环
        this.engine.runRenderLoop(() => {
            this.renderFrame();
        });
        
        // 响应窗口大小变化
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        
        EventBus.publish('render:initialized', this);
    }

    /**
     * 初始化各个渲染层
     */
    initializeLayers() {
        // 这里会创建和初始化各个渲染层
        // 在实际实现中，这些层会是独立的类实例
        
        EventBus.publish('render:layersInitialized', this.layers);
    }

    /**
     * 渲染一帧
     */
    renderFrame() {
        // 计算帧时间，用于平滑动画
        const currentTime = performance.now();
        const deltaTime = (currentTime - (this.lastRenderTime || currentTime)) / 1000;
        this.lastRenderTime = currentTime;
        
        // 根据当前游戏状态决定渲染哪些层
        const currentState = StateManager.getCurrentState();
        
        // 确保主场景有活动相机
        if (!this.mainScene.activeCamera) {
            this.mainScene.activeCamera = this.camera;
        }
        
        // 更新所有游戏对象的渲染
        this.updateGameObjectsRender(deltaTime);
        
        // 先渲染主场景
        this.mainScene.render();
        
        // 根据游戏状态渲染其他层
        if (currentState !== GameStates.GAMEMODE_LOADING) {
            // UI始终渲染
            if (this.uiScene) {
                // 确保UI场景有活动相机
                if (!this.uiScene.activeCamera && this.uiScene.cameras.length > 0) {
                    this.uiScene.activeCamera = this.uiScene.cameras[0];
                }
                this.uiScene.render();
            }
            
            // 根据状态渲染对话或菜单
            if (currentState === GameStates.DIALOG && this.layers.dialog) {
                // 渲染对话层...
            }
            
            if ((currentState === GameStates.MENU || currentState === GameStates.PAUSED) 
                && this.layers.menu) {
                // 渲染菜单层...
            }
        }
    }

    /**
     * 更新所有游戏对象的渲染
     * @param {number} deltaTime - 帧时间差
     */
    updateGameObjectsRender(deltaTime) {
        // 只更新根游戏对象的渲染，它们会递归更新子对象
        for (const gameObject of Game.gameObjects) {
            gameObject.updateRender(deltaTime);
        }
    }

    /**
     * 创建2.5D场景（正交相机+ 3D对象）
     * @returns {BABYLON.Scene} 创建的2.5D场景
     */
    create2_5DScene() {
        const scene = new BABYLON.Scene(this.engine);
        
        // 创建正交相机，适合2.5D视角
        const orthoCamera = new BABYLON.ArcRotateCamera("OrthoCamera", 
                                                       Math.PI / 4, // 45度角俯视
                                                       Math.PI / 4, 
                                                       10,
                                                       BABYLON.Vector3.Zero(), 
                                                       scene);
        orthoCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        
        // 设置正交相机参数
        const aspectRatio = this.canvas.width / this.canvas.height;
        const orthoSize = 10;
        orthoCamera.orthoTop = orthoSize;
        orthoCamera.orthoBottom = -orthoSize;
        orthoCamera.orthoLeft = -orthoSize * aspectRatio;
        orthoCamera.orthoRight = orthoSize * aspectRatio;
        
        orthoCamera.attachControl(this.canvas, true);
        
        // 设置活动相机
        scene.activeCamera = orthoCamera;
        
        // 添加光源
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        
        return scene;
    }

    /**
     * 创建UI层
     * @returns {BABYLON.GUI.AdvancedDynamicTexture} UI层
     */
    createUILayer() {
        return BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.mainScene);
    }

    /**
     * 获取主相机
     * @returns {BABYLON.Camera} 主相机
     */
    getCamera() {
        return this.camera;
    }

    /**
     * 设置主相机
     * @param {BABYLON.Camera} camera - 新相机
     */
    setCamera(camera) {
        this.camera = camera;
    }
}

// 导出单例
export default new RenderManager();
