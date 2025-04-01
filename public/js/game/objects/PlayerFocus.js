import GameObject from '../GameObject.js';
import EventBus from '../../core/EventBus.js';
import * as EventTypes from '../../core/EventTypes.js';
import RenderManager from '../../core/RenderManager.js';

/**
 * PlayerFocus - 虚拟的游戏对象，用于控制相机焦点
 * 不需要绘制，但可以在xz平面上移动，相机始终看向此对象
 */
class PlayerFocus extends GameObject {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {Vector3} [options.position] - 初始位置
     * @param {number} [options.moveSpeed=5] - 移动速度
     */
    constructor(options = {}) {
        super({
            id: options.id || 'playerFocus',
            position: options.position || { x: 0, y: 0, z: 0 },
            visible: false, // 不可见的游戏对象
            ...options
        });

        // 移动速度
        this.moveSpeed = options.moveSpeed || 5;
        
        // 移动方向标志
        this.movementDirection = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        // 订阅输入事件
        this.subscribeToEvents();
        
        // 初始时立即更新相机位置
        this.updateCameraFocus();
    }

    /**
     * 订阅事件
     */
    subscribeToEvents() {
        // 键盘按下事件
        EventBus.subscribe(EventTypes.INPUT.KEY_DOWN, this.handleKeyDown.bind(this));
        
        // 键盘释放事件
        EventBus.subscribe(EventTypes.INPUT.KEY_UP, this.handleKeyUp.bind(this));
        
        // 游戏更新事件
        EventBus.subscribe(EventTypes.GAME.UPDATE, this.update.bind(this));
    }

    /**
     * 处理键盘按下事件
     * @param {Object} data - 事件数据
     */
    handleKeyDown(data) {
        const { key } = data;
        
        switch (key) {
            case 'ArrowUp':
            case 'w':
                this.movementDirection.forward = true;
                break;
            case 'ArrowDown':
            case 's':
                this.movementDirection.backward = true;
                break;
            case 'ArrowLeft':
            case 'a':
                this.movementDirection.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                this.movementDirection.right = true;
                break;
        }
    }

    /**
     * 处理键盘释放事件
     * @param {Object} data - 事件数据
     */
    handleKeyUp(data) {
        const { key } = data;
        
        switch (key) {
            case 'ArrowUp':
            case 'w':
                this.movementDirection.forward = false;
                break;
            case 'ArrowDown':
            case 's':
                this.movementDirection.backward = false;
                break;
            case 'ArrowLeft':
            case 'a':
                this.movementDirection.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                this.movementDirection.right = false;
                break;
        }
    }

    /**
     * 游戏更新方法，每帧调用
     * @param {Object} data - 更新数据
     * @param {number} data.deltaTime - 距离上一帧的时间（秒）
     */
    update(data) {
        const { deltaTime } = data;
        const moveDistance = this.moveSpeed * deltaTime;
        
        // 根据当前移动方向更新位置
        if (this.movementDirection.forward) {
            this.position.z -= moveDistance;
        }
        if (this.movementDirection.backward) {
            this.position.z += moveDistance;
        }
        if (this.movementDirection.left) {
            this.position.x -= moveDistance;
        }
        if (this.movementDirection.right) {
            this.position.x += moveDistance;
        }
        
        // 如果有移动，更新相机焦点
        if (this.movementDirection.forward || 
            this.movementDirection.backward || 
            this.movementDirection.left || 
            this.movementDirection.right) {
            this.updateCameraFocus();
        }
    }

    /**
     * 更新相机焦点，让相机看向此对象
     */
    updateCameraFocus() {
        if (RenderManager.camera) {
            // 让相机的目标位置设置为当前位置
            RenderManager.camera.setTarget(
                new Babylon.Vector3(
                    this.position.x,
                    this.position.y,
                    this.position.z
                )
            );
        }
    }

    /**
     * 设置位置并更新相机
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} z - Z坐标
     */
    setPosition(x, y, z) {
        super.setPosition(x, y, z);
        this.updateCameraFocus();
    }
}

export default PlayerFocus;
