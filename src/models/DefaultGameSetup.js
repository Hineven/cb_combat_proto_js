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

gameContext.enemy.maxHP = 100; // 初始生命值
gameContext.enemy.currentHP = 100; // 初始生命值

export default gameContext;