import EventBus from './EventBus.js';

/**
 * 存档管理器 - 处理游戏存档和读档
 */
class SaveManager {
    constructor() {
        this.currentSaveSlot = 'default';
        this.savePrefix = 'game_save_';
    }

    /**
     * 保存游戏数据到指定存档槽
     * @param {Object} gameData - 游戏数据
     * @param {string} [slot] - 存档槽名称
     * @returns {boolean} 保存是否成功
     */
    saveGame(gameData, slot = this.currentSaveSlot) {
        try {
            const saveData = {
                timestamp: Date.now(),
                version: '1.0.0',
                data: gameData
            };
            
            localStorage.setItem(this.savePrefix + slot, JSON.stringify(saveData));
            this.currentSaveSlot = slot;
            
            EventBus.publish('save:complete', { slot, success: true });
            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            EventBus.publish('save:complete', { slot, success: false, error });
            return false;
        }
    }

    /**
     * 从指定存档槽加载游戏数据
     * @param {string} [slot] - 存档槽名称
     * @returns {Object|null} 游戏数据或null
     */
    loadGame(slot = this.currentSaveSlot) {
        try {
            const saveData = localStorage.getItem(this.savePrefix + slot);
            if (!saveData) {
                EventBus.publish('load:complete', { slot, success: false, error: '存档不存在' });
                return null;
            }
            
            const parsedData = JSON.parse(saveData);
            this.currentSaveSlot = slot;
            
            EventBus.publish('load:complete', { slot, success: true, data: parsedData.data });
            return parsedData.data;
        } catch (error) {
            console.error('加载游戏失败:', error);
            EventBus.publish('load:complete', { slot, success: false, error });
            return null;
        }
    }

    /**
     * 获取所有存档槽信息
     * @returns {Array} 存档槽信息数组
     */
    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.savePrefix)) {
                try {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    slots.push({
                        slot: key.replace(this.savePrefix, ''),
                        timestamp: saveData.timestamp,
                        version: saveData.version,
                        date: new Date(saveData.timestamp).toLocaleString()
                    });
                } catch (e) {
                    console.warn(`无效存档数据: ${key}`);
                }
            }
        }
        return slots;
    }

    /**
     * 删除指定存档槽
     * @param {string} slot - 存档槽名称
     * @returns {boolean} 删除是否成功
     */
    deleteSave(slot) {
        try {
            localStorage.removeItem(this.savePrefix + slot);
            EventBus.publish('save:deleted', { slot, success: true });
            return true;
        } catch (error) {
            console.error('删除存档失败:', error);
            EventBus.publish('save:deleted', { slot, success: false, error });
            return false;
        }
    }
}

// 导出单例
export default new SaveManager();
