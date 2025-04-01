import EventBus from '../../core/EventBus.js';
import StateManager, { GameStates } from '../../core/StateManager.js';
import * as EVENTS from '../../core/EventTypes.js';
import RenderManager from '../../rendering/RenderManager.js';
import AssetLoader from '../../utils/AssetLoader.js';
import Game from '../../core/Game.js';
import Ground from '../objects/Ground.js';
import PlayerFocus from '../objects/PlayerFocus.js';

/**
 * 演示游戏模式 - 初始化基础的游戏环境和对象
 */
class DemoGameMode {
    constructor(options = {}) {
        // 游戏模式配置
        this.options = {
            groundSize: options.groundSize || 20,
            groundTiling: options.groundTiling || 4,
            enableShadows: options.enableShadows !== undefined ? options.enableShadows : true,
            cameraPosition: options.cameraPosition || { x: 0, y: 10, z: -10 },
            ...options
        };
        
        // 游戏对象引用
        this.ground = null;
        this.focus = null;
        this.lightSources = [];
        
        // 游戏状态
        this.initialized = false;
        this.assetsLoaded = false;
    }

    /**
     * 注册监听器，准备游戏启动
     */
    prepareGameLaunch () {
        // 监听游戏状态变化
        EventBus.subscribe(EVENTS.STATE.CHANGED, (state) => {  
            if (state.current == GameStates.GAMEMODE_LOADING) {
                console.log('游戏模式加载中...');
                // 启动协程调用initialize方法
                this.initialize().catch((error) => {
                    console.error('初始化游戏模式时出错:', error);
                });
            }
        });
    }

    /**
     * 初始化游戏模式
     * @returns {Promise} 初始化完成的Promise
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('正在初始化演示游戏模式...');
        
        // 设置场景环境
        this.setupScene();
        
        // 创建基础游戏对象
        this.createGameObjects();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 初始化完成
        this.initialized = true;
        console.log('演示游戏模式初始化完成!');
        
        // 将游戏状态设置为运行
        StateManager.changeState(GameStates.PLAYING);
        
    }

    /**
     * 设置场景环境
     */
    setupScene() {
        // 获取主场景
        const scene = RenderManager.mainScene;
        
        // 设置相机位置
        const camera = RenderManager.getCamera();
        camera.position =new BABYLON.Vector3(
            this.options.cameraPosition.x, 
            this.options.cameraPosition.y, 
            this.options.cameraPosition.z
        );
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.fov = 0.3; // 视场角
        
        // 设置场景背景
        scene.clearColor = new BABYLON.Color4(0.55, 0.75, 0.95, 1); // 天蓝色背景
        
        // 创建环境光照
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight", 
            new BABYLON.Vector3(0, 1, 0), 
            scene
        );
        ambientLight.intensity = 0.5;
        ambientLight.diffuse = new BABYLON.Color3(0.9, 0.9, 0.9);
        ambientLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
        ambientLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        this.lightSources.push(ambientLight);
        
        // 创建方向光（模拟太阳光）
        const directionalLight = new BABYLON.DirectionalLight(
            "directionalLight",
            new BABYLON.Vector3(-1, -2, -1),
            scene
        );
        directionalLight.intensity = 0.8;
        directionalLight.diffuse = new BABYLON.Color3(1, 0.9, 0.8);
        directionalLight.specular = new BABYLON.Color3(1, 1, 1);
        this.lightSources.push(directionalLight);
        
        // 开启阴影
        if (this.options.enableShadows) {
            const shadowGenerator = new BABYLON.ShadowGenerator(1024, directionalLight);
            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.blurKernel = 32;
            this.shadowGenerator = shadowGenerator;
        }
        
        // 设置环境特效（可选）
        if (this.options.enableFog) {
            scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            scene.fogDensity = 0.01;
            scene.fogColor = new BABYLON.Color3(0.8, 0.85, 0.9);
        }
        
        // 创建天空盒（可选）
        if (this.options.enableSkybox) {
            const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
            const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/skybox", scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skybox.material = skyboxMaterial;
        }
    }

    /**
     * 创建基础游戏对象
     */
    createGameObjects() {
        // 创建地板
        this.ground = new Ground("MainGround", this.options.groundSize, this.options.groundTiling);
        this.ground.setSize(this.options.groundSize, this.options.groundSize);
        this.ground.setTiling(this.options.groundTiling, this.options.groundTiling);
        this.ground.setPosition(0, 0, 0);
        
        // 添加到游戏中
        Game.addGameObject(this.ground);

        // 如果启用了阴影，将地板添加到接收阴影的对象列表
        if (this.shadowGenerator && this.ground.mesh) {
            this.ground.mesh.receiveShadows = true;
        }

        // 创建PlayerFocus
        this.focus = new PlayerFocus("PlayerFocus");
        Game.addGameObject(this.focus);
        
        
        // 创建其他演示对象（如障碍物、敌人等）
        this.createDemoObjects();
    }

    /**
     * 创建额外的演示对象
     */
    createDemoObjects() {
        // 这里可以创建一些额外的游戏对象，如障碍物、敌人等
        // 示例：创建一些随机位置的立方体作为障碍物
        if (this.options.createObstacles) {
            const scene = RenderManager.mainScene;
            const obstacleCount = this.options.obstacleCount || 5;
            
            for (let i = 0; i < obstacleCount; i++) {
                // 创建障碍物网格
                const size = 0.5 + Math.random() * 1.5;
                const posX = (Math.random() - 0.5) * this.options.groundSize * 0.8;
                const posZ = (Math.random() - 0.5) * this.options.groundSize * 0.8;
                
                const obstacle = BABYLON.MeshBuilder.CreateBox(
                    `obstacle_${i}`, 
                    { width: size, height: size * 2, depth: size }, 
                    scene
                );
                
                obstacle.position.x = posX;
                obstacle.position.y = size;
                obstacle.position.z = posZ;
                
                // 设置材质
                const obstacleMaterial = new BABYLON.StandardMaterial(`obstacle_material_${i}`, scene);
                obstacleMaterial.diffuseColor = new BABYLON.Color3(
                    Math.random(), 
                    Math.random(), 
                    Math.random()
                );
                obstacle.material = obstacleMaterial;
                
                // 添加到阴影生成器
                if (this.shadowGenerator) {
                    this.shadowGenerator.addShadowCaster(obstacle);
                }
            }
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听游戏状态变化
        EventBus.subscribe('state:changed', (state) => {
            this.onGameStateChanged(state);
        });
        
        // 监听玩家事件（如果有玩家）
        if (this.player) {
            EventBus.subscribe('player:died', () => {
                this.onPlayerDied();
            });
        }
        
        // 监听其他事件...
    }

    /**
     * 游戏状态变化处理
     * @param {GameStates} state - 新的游戏状态
     */
    onGameStateChanged(state) {
        console.log(`游戏状态变更为: ${state}`);
        
        // 根据不同状态执行不同操作
        switch (state) {
            case GameStates.PAUSED:
                // 暂停时的逻辑
                break;
                
            case GameStates.RUNNING:
                // 恢复运行时的逻辑
                break;
                
            case GameStates.GAME_OVER:
                // 游戏结束时的逻辑
                this.handleGameOver();
                break;
        }
    }

    /**
     * 玩家死亡处理
     */
    onPlayerDied() {
        console.log('玩家死亡');
        
        // 设置游戏状态为结束
        StateManager.changeState(GameStates.GAME_OVER);
    }

    /**
     * 游戏结束处理
     */
    handleGameOver() {
        console.log('游戏结束');
        
        // 显示游戏结束UI
        // 可以在此设置重新开始的选项
    }

    /**
     * 重新开始游戏
     */
    restart() {
        
        // 重新初始化游戏模式
        this.initialized = false;
        this.initialize();
    }

    /**
     * 销毁游戏模式资源
     */
    destroy() {
        // 清理事件监听
        EventBus.unsubscribeAll('state:changed');
        EventBus.unsubscribeAll('player:died');
        
        // 清理游戏对象
        if (this.ground) {
            GameManager.destroyGameObject(this.ground);
            this.ground = null;
        }
        
        if (this.player) {
            GameManager.destroyGameObject(this.player);
            this.player = null;
        }
        
        // 清理其他资源
        this.lightSources = [];
        this.shadowGenerator = null;
        
        this.initialized = false;
        
        console.log('演示游戏模式已销毁');
    }
}

export default DemoGameMode;
