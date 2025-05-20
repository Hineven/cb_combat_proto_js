import eventBus from '../utils/eventBus.js';
import { Dialogue, DialogueSegment, makeDialogue, fireDialogue } from './Dialogue.js';
import { GameContext } from './Game.js';

// 初始化事件监听器
export function initEventHandlers() {
    console.log('事件处理器初始化中...');
    
    // 监听战斗结束事件
    eventBus.on('battle-end', handleBattleEnd);
}

// 处理战斗结束事件
function handleBattleEnd(result) {
    console.log('战斗结束事件触发:', result);
    
    if (result && result.winner.id == "player") {
        // 创建玩家胜利对话
        const victoryDialogue = createVictoryDialogue();
        // 触发对话显示
        fireDialogue(victoryDialogue);
    } else if (result && result.winner.id == 'enemy') {
        // 创建玩家失败对话
        const defeatDialogue = createDefeatDialogue();
        // 触发对话显示
        fireDialogue(defeatDialogue);
    }
}

// 创建胜利对话
function createVictoryDialogue() {

    return makeDialogue(
        [
            '恭喜啊恭喜！你成功击败了第一个敌人！',
            '你好，我叫瑞米。',
            '有一个高位面的存在让我在这里接待你。',
            '继续修行吧，我会为你的修行指路的。探索不同的组合、扩充你的功法，提升你的境界',
            '还有更强大的敌人等着你呢！'
        ]
    );
}

// 创建失败对话
function createDefeatDialogue() {
    return makeDialogue(
        [
            '不是吧？这都败了！',
            '哎，无所谓。。。你好，我叫瑞米。',
            '有一个高位面的存在让我在这里接待你。',
            '继续修行吧，我会为你的修行指路的。探索不同的组合、扩充你的功法，提升你的境界。',
            '还有更强大的敌人等着你呢！'
        ]
    );
}

// 导出函数，用于在应用启动时初始化事件监听器
export default initEventHandlers;