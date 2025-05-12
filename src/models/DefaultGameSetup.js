import { GameContext } from './Game';
import { BasicAttackCard, YingChengCard, BasicDefenseCard, Leino, WanMuJue1, LingQiBaoFaCard } from './Cards';
import { CardSlot } from './CardBase.js'; // 导入 CardSlot

const gameContext = new GameContext();
gameContext.player.currentHP = 100; // 初始生命值
gameContext.player.currentAP = 4; // 初始行动点

// 初始化玩家卡槽和卡牌
gameContext.player.cardSlots = [
    new CardSlot(new Leino("木", 2)),
    new CardSlot(new BasicAttackCard()),
    new CardSlot(new YingChengCard()),
    new CardSlot(new BasicDefenseCard()),
    new CardSlot(new WanMuJue1())//,
    // new CardSlot(new LingQiBaoFaCard())
]; // 初始卡牌槽

// 初始化敌人状态
gameContext.enemy.maxHP = 100; // 最大生命值
gameContext.enemy.currentHP = 100; // 初始生命值
gameContext.enemy.maxAP = 3; // 敌人每回合3行动点
gameContext.enemy.baseAttack = 12; // 敌人基础攻击力略高
gameContext.enemy.baseDefense = 8; // 敌人基础防御力略低
gameContext.enemy.dantianAura = 80; // 敌人丹田容量略低

// 为敌人设置初始卡牌槽
gameContext.enemy.cardSlots = [
    new CardSlot(new BasicAttackCard()),
    new CardSlot(new BasicDefenseCard()),
    new CardSlot(new Leino("火", 1)) // 敌人使用火属性灵气
]; // 敌人初始卡牌槽

// 初始化卡牌所有者和上下文
gameContext.player.cardSlots.forEach(slot => {
    if (!slot.isEmpty()) {
        slot.card.init(gameContext, gameContext.player);
    }
});
gameContext.enemy.cardSlots.forEach(slot => {
    if (!slot.isEmpty()) {
        slot.card.init(gameContext, gameContext.enemy);
    }
});

gameContext.startPlayerTurn(); // 开始玩家回合

console.log(gameContext)
console.log(gameContext.canPlayerAct())

export default gameContext;