import GameObject from '../GameObject.js';
import EventBus from '../../core/EventBus.js';
import RenderManager from '../../rendering/RenderManager.js';
import AssetLoader from '../../utils/AssetLoader.js';

/**
 * 地板类 - 继承自GameObject，用于渲染地面
 */
class Ground extends GameObject {
    constructor(id, name, options = {}) {
        super(id, name || 'Ground');
        
        // 添加标签
        this.addTag('ground');
        
        // 地板特有属性
        this.width = options.width || 10;
        this.height = options.height || 10;
        this.tiling = options.tiling || { x: 1, y: 1 }; // 纹理平铺
        
        // 引用Babylon.js网格对象
        this.mesh = null;
        this.material = null;
    }

    /**
     * 初始化地板
     */
    initialize() {
        super.initialize();
        
        // 创建地板网格
        this.createGroundMesh();
    }

    /**
     * 创建地板网格和材质
     */
    createGroundMesh() {
        // 获取主场景
        const scene = RenderManager.mainScene;
        
        // 创建一个平面作为地板
        this.mesh = BABYLON.MeshBuilder.CreateGround(
            `${this.name}_mesh`,
            { 
                width: this.width, 
                height: this.height, 
                subdivisions: 1,
                updatable: true
            }, 
            scene
        );
        
        // 创建材质
        this.material = new BABYLON.StandardMaterial(`${this.name}_material`, scene);
        
        // 获取地板纹理
        const groundTexture = AssetLoader.getTexture('ground');
        if (groundTexture) {
            // 设置纹理
            this.material.diffuseTexture = groundTexture;
            this.material.diffuseTexture.uScale = -this.tiling.x;
            this.material.diffuseTexture.vScale = -this.tiling.y;
            
            // 根据需要配置材质属性
            this.material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            this.material.backFaceCulling = false;
            
            // 设置材质到网格
            this.mesh.material = this.material;
        } else {
            console.warn('未找到地板纹理资源: ground');
            
            // 如果没有纹理，使用默认颜色
            this.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            this.mesh.material = this.material;
        }
        
        // 设置初始位置、旋转和缩放
        this.updateMeshTransform();
        
        // 设置接收阴影
        this.mesh.receiveShadows = true;

    }

    /**
     * 更新网格的变换矩阵（位置、旋转、缩放）
     */
    updateMeshTransform() {
        if (!this.mesh) return;
        
        this.mesh.position = new BABYLON.Vector3(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        this.mesh.rotation = new BABYLON.Vector3(
            this.rotation.x,
            this.rotation.y,
            this.rotation.z
        );
        
        this.mesh.scaling = new BABYLON.Vector3(
            this.scale.x,
            this.scale.y,
            this.scale.z
        );
    }

    /**
     * 设置地板尺寸
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
        
        // 如果已经创建了网格，更新尺寸
        if (this.mesh) {
            // Babylon.js不直接支持更新平面尺寸，需要重新创建
            const scene = this.mesh.getScene();
            this.mesh.dispose();
            
            this.mesh = BABYLON.MeshBuilder.CreateGround(
                `${this.name}_mesh`,
                { 
                    width: this.width, 
                    height: this.height, 
                    subdivisions: 1,
                    updatable: true
                }, 
                scene
            );
            
            if (this.material) {
                this.mesh.material = this.material;
            }
            
            this.updateMeshTransform();
        }
    }

    /**
     * 设置纹理平铺
     * @param {number} x - X方向平铺
     * @param {number} y - Y方向平铺
     */
    setTiling(x, y) {
        this.tiling.x = x;
        this.tiling.y = y;
        
        // 更新材质平铺
        if (this.material && this.material.diffuseTexture) {
            this.material.diffuseTexture.uScale = this.tiling.x;
            this.material.diffuseTexture.vScale = this.tiling.y;
        }
    }

    /**
     * 更新地板逻辑
     * @param {number} deltaTime - 帧时间差
     */
    update(deltaTime) {
        // 地板一般不需要每帧更新逻辑，除非有特殊需求
        // 比如移动地板、动态纹理等
        
        super.update(deltaTime);
    }

    /**
     * 更新地板渲染
     * @param {number} deltaTime - 帧时间差
     */
    updateRender(deltaTime) {
        // 检查并更新网格变换
        if (this.mesh) {
            this.updateMeshTransform();
        }
        
        super.updateRender(deltaTime);
    }

    /**
     * 销毁地板时释放资源
     */
    onDestroy() {
        // 释放Babylon.js资源
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
        
        if (this.material) {
            this.material.dispose();
            this.material = null;
        }
        
        super.onDestroy();
    }
}

export default Ground;
