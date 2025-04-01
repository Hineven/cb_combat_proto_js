import EventBus from '../core/EventBus.js';

/**
 * 资源加载器 - 负责加载游戏所需的资源
 */
class AssetLoader {
    constructor() {
        this.assets = {
            textures: {},
            models: {},
            sounds: {},
            data: {}
        };
        this.loadingQueue = [];
        this.loadedCount = 0;
    }

    /**
     * 添加资源到加载队列
     * @param {string} type - 资源类型
     * @param {string} id - 资源ID
     * @param {string} url - 资源URL
     */
    addToQueue(type, id, url) {
        this.loadingQueue.push({ type, id, url });
    }

    /**
     * 加载所有队列中的资源
     * @returns {Promise} 加载完成的Promise
     */
    loadAll() {
        return new Promise((resolve, reject) => {
            if (this.loadingQueue.length === 0) {
                resolve(this.assets);
                return;
            }

            this.loadedCount = 0;
            const totalAssets = this.loadingQueue.length;
            
            EventBus.publish('assets:loadstart', { total: totalAssets });

            const promises = this.loadingQueue.map(item => {
                return this.loadAsset(item.type, item.id, item.url);
            });

            Promise.all(promises)
                .then(() => {
                    EventBus.publish('assets:loadcomplete', this.assets);
                    this.loadingQueue = [];
                    resolve(this.assets);
                })
                .catch(error => {
                    EventBus.publish('assets:loaderror', error);
                    reject(error);
                });
        });
    }

    /**
     * 加载单个资源
     * @param {string} type - 资源类型
     * @param {string} id - 资源ID
     * @param {string} url - 资源URL
     * @returns {Promise} 加载完成的Promise
     */
    loadAsset(type, id, url) {
        return new Promise((resolve, reject) => {
            switch (type) {
                case 'texture':
                    this.loadTexture(id, url).then(resolve).catch(reject);
                    break;
                case 'model':
                    this.loadModel(id, url).then(resolve).catch(reject);
                    break;
                case 'sound':
                    this.loadSound(id, url).then(resolve).catch(reject);
                    break;
                case 'data':
                    this.loadData(id, url).then(resolve).catch(reject);
                    break;
                default:
                    reject(new Error(`未知资源类型: ${type}`));
            }
        });
    }

    /**
     * 加载纹理
     * @param {string} id - 纹理ID
     * @param {string} url - 纹理URL
     * @returns {Promise} 加载完成的Promise
     */
    loadTexture(id, url) {
        return new Promise((resolve, reject) => {
            const texture = new BABYLON.Texture(url, null, false, false, null, 
                () => {
                    this.assets.textures[id] = texture;
                    this.updateLoadingProgress();
                    resolve(texture);
                },
                () => {
                    reject(new Error(`无法加载纹理: ${url}`));
                }
            );
        });
    }

    /**
     * 加载3D模型
     * @param {string} id - 模型ID
     * @param {string} url - 模型URL
     * @returns {Promise} 加载完成的Promise
     */
    loadModel(id, url) {
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.ImportMesh("", url.substring(0, url.lastIndexOf('/') + 1), 
                url.substring(url.lastIndexOf('/') + 1), null, 
                (meshes) => {
                    this.assets.models[id] = meshes;
                    this.updateLoadingProgress();
                    resolve(meshes);
                },
                null,
                (scene, message) => {
                    reject(new Error(`无法加载模型 ${url}: ${message}`));
                }
            );
        });
    }

    /**
     * 加载音效
     * @param {string} id - 音效ID
     * @param {string} url - 音效URL
     * @returns {Promise} 加载完成的Promise
     */
    loadSound(id, url) {
        return new Promise((resolve, reject) => {
            const sound = new BABYLON.Sound(id, url, null, 
                () => {
                    this.assets.sounds[id] = sound;
                    this.updateLoadingProgress();
                    resolve(sound);
                },
                { autoplay: false }
            );
            sound.onLoadError = () => {
                reject(new Error(`无法加载音效: ${url}`));
            };
        });
    }

    /**
     * 加载数据文件
     * @param {string} id - 数据ID
     * @param {string} url - 数据URL
     * @returns {Promise} 加载完成的Promise
     */
    loadData(id, url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP错误，状态码: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.assets.data[id] = data;
                this.updateLoadingProgress();
                return data;
            });
    }

    /**
     * 更新加载进度
     */
    updateLoadingProgress() {
        this.loadedCount++;
        const progress = this.loadedCount / this.loadingQueue.length;
        EventBus.publish('assets:progress', { 
            loaded: this.loadedCount, 
            total: this.loadingQueue.length, 
            progress 
        });
    }

    /**
     * 获取资源
     * @param {string} type - 资源类型
     * @param {string} id - 资源ID
     * @returns {any} 资源对象
     */
    get(type, id) {
        if (this.assets[type] && this.assets[type][id]) {
            return this.assets[type][id];
        }
        console.warn(`资源不存在: ${type}/${id}`);
        return null;
    }

    getTexture(id) {
        return this.get('textures', id);
    }

    getModel(id) {
        return this.get('models', id);
    }
}

// 导出单例
export default new AssetLoader();
