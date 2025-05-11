import { GameContext } from './Game';
import { BasicAttackCard, YingChengCard, BasicDefenseCard, Leino, WanMuJue1} from './Cards';

const gameContext = new GameContext();
gameContext.player.currentHP = 100; // 初始生命值
gameContext.player.currentAP = 4; // 初始行动点
gameContext.player.cards = [
    new Leino("木", 2),
    new BasicAttackCard(),
    new YingChengCard(),
    new BasicDefenseCard(),
    new WanMuJue1()
]; // 初始卡牌

// 初始化敌人状态
gameContext.enemy.maxHP = 100; // 最大生命值
gameContext.enemy.currentHP = 100; // 初始生命值
gameContext.enemy.maxAP = 3; // 敌人每回合3行动点
gameContext.enemy.baseAttack = 12; // 敌人基础攻击力略高
gameContext.enemy.baseDefense = 8; // 敌人基础防御力略低
gameContext.enemy.dantianAura = 80; // 敌人丹田容量略低

// 为敌人设置初始卡牌
gameContext.enemy.cards = [
    new BasicAttackCard(),
    new BasicDefenseCard(),
    new Leino("火", 1) // 敌人使用火属性灵气
]; // 敌人初始卡牌，设置得比玩家简单一些

// 初始化卡牌所有者
gameContext.player.cards.forEach(card => card.init(gameContext, gameContext.player));
gameContext.enemy.cards.forEach(card => card.init(gameContext, gameContext.enemy));

gameContext.startPlayerTurn(); // 开始玩家回合

console.log(gameContext)
console.log(gameContext.canPlayerAct())

export default gameContext;