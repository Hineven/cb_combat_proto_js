import {CardSlot} from './CardBase.js';
// 角色状态类，玩家角色和敌对角色共有的状态
export class CharacterState {
  constructor() {
    this.id = null; // Added character ID
    this.name = '未命名角色'; // 角色名称，用于显示在日志中
    this.maxAP = 4; // 最大行动点
    this.maxHP = 50; // 最大生命值
    this.currentHP = this.maxHP; // 当前生命值
    this.currentAP = 0; // 当前行动点
    this.baseAttack = 10; // 基础攻击力
    this.baseDefense = 10; // 基础防御力
    this.overallMultiplier = 1; // 总倍率
    this.computedAttack = this.baseAttack; // 计算攻击力
    this.computedDefense = this.baseDefense; // 计算防御力
    this.activeEffects = []; // 当前生效的效果列表
  }
}

// 玩家角色类，继承自角色状态类，添加了卡牌相关属性和方法，以及一些用于发动卡牌的资源
export class PlayingCharacterState extends CharacterState {
  constructor() {
    super();
    this.id = 'player'; // Set ID for player
    this.name = 'Player';
    this.cardSlots = [new CardSlot(), new CardSlot(), new CardSlot()]; // 卡槽列表，默认3个空卡槽
    this.handSize = 3; // 新增：手牌数量
    this.currentJin = 0; // 当前金灵气数量
    this.currentMu  = 0; // 当前木灵气数量
    this.currentShui = 0; // 当前水灵气数量
    this.currentHuo = 0; // 当前火灵气数量
    this.currentTu   = 0; // 当前土灵气数量
    this.currentHun  = 0; // 当前杂灵气数量
    this.dantianAura = 100; // 丹田中可以产出的灵气数量
    this.maxPendingActivation = 3; // 最大的未决发动次数
    this.activationCount = 0; // 当前的未决发动次数
    this.isPlayer = true; // 是否是玩家
  }
  currentAuraSum() {
    return this.currentJin + this.currentMu + this.currentShui + this.currentHuo + this.currentTu + this.currentHun;
  }
}

// 敌对角色类，现在也继承自PlayingCharacterState
export class EnemyState extends PlayingCharacterState {
  constructor() {
    super();
    this.id = 'enemy'; // Set ID for enemy
    this.name = 'Enemy';
    this.handSize = 3; // 新增：手牌数量，敌人也拥有手牌概念
    this.isPlayer = false; // 标记为敌对角色
    this.aiType = "basic"; // 敌对角色的AI类型，可以在Enemies.js中定义不同的AI
    this.preferActivation = 0.7; // 倾向于发动卡牌的概率
    this.actionDelay = 1000; // AI行动的延迟时间（毫秒）
  }
  
  // 基础AI逻辑框架，在Enemies.js中可以覆盖这些方法
  async decideAction(ctx) {
    // 卡牌AI决策逻辑，返回决策后的行动类型和参数
    let action = "none";
    
    // 简单AI：有行动点就用，优先发动，其次运气
    while (this.currentAP > 0) {
      // 每次操作前等待一定时间
      await new Promise(resolve => setTimeout(resolve, this.actionDelay));
      
      let bestCardIndex = -1;
      let bestCardScore = -Infinity; 

      // AI决策：在手牌中选择最佳卡牌发动
      for (let i = 0; i < Math.min(this.cardSlots.length, this.handSize); i++) {
        const cardSlot = this.cardSlots[i];
        if (cardSlot && !cardSlot.isEmpty() && cardSlot.card.getCanActivate(ctx, this)) {
          // 简单的评分：能发动的牌就是好牌，可以根据卡牌效果和当前战局进行更复杂的评分
          const score = 1; // 示例评分，后续可以扩展
          if (score > bestCardScore) {
            bestCardScore = score;
            bestCardIndex = i;
          }
        }
      }
      
      const canActivateChosenCard = bestCardIndex !== -1;

      const shouldActivate = Math.random() < this.preferActivation && 
                            canActivateChosenCard &&
                            this.activationCount < this.maxPendingActivation;
      
      if (shouldActivate) {
        // 尝试发动选中的卡牌 (bestCardIndex)
        const success = ctx.activation(this, bestCardIndex);
        if (!success) {
          // 如果发动失败（例如AP不足以支付消耗，或卡牌本身发动条件不满足），则执行运气
          // 运气操作仍然针对牌堆顶的第一张牌
          if (this.cardSlots.length > 0 && !this.cardSlots[0].isEmpty()) {
            ctx.cultivation(this);
          } else if (this.cardSlots.length > 0 && this.cardSlots[0].isEmpty()) {
            // 如果首位是空卡槽，也执行一次“运气”来轮换
            ctx.cultivation(this);
          }
        }
        action = "used_card";
      } else {
        // 如果不发动，或者没有可发动的牌，则执行运气
        // 运气操作仍然针对牌堆顶的第一张牌
        if (this.cardSlots.length > 0) {
          ctx.cultivation(this);
        }
        action = "used_card";
      }
      // AI行动后，检查战斗是否结束，如果AP耗尽也可能提前结束自己的回合
      if (ctx.checkBattleOver() || this.currentAP <= 0) break;
    }
    
    // 当行动点耗尽或AI决定结束时，主动结束回合
    if (!ctx.isBattleOver && this.currentAP === 0) { // 确保战斗未结束且AP耗尽
      await new Promise(resolve => setTimeout(resolve, this.actionDelay)); // 给玩家一点反应时间
      ctx.endTurn(this);
    }
    
    return action;
  }
  
  executeAction(ctx, actionType) {
    // 不需要额外执行，decideAction已经执行了card相关操作
    if (actionType !== "used_card") {
      // 只有当不是卡牌操作时才执行老的AI逻辑（兼容）
      switch(actionType) {
        case "attack":
          this.basicAttack(ctx);
          break;
        case "defend":
          this.basicDefend(ctx);
          break;
        case "heal":
          this.basicHeal(ctx);
          break;
        case "charge":
          this.basicCharge(ctx);
          break;
      }
    }
  }
  
  // 保留简单AI的基础攻击、防御、治疗、聚气逻辑以备不时之需
  basicAttack(ctx) {
    const damage = this.computedAttack;
    ctx.launchAttackTo(this, ctx.player, damage);
  }
  
  basicDefend(ctx) {
    ctx.getDefence(this, this.baseDefense * 0.5);
    ctx.addLog(this, '增强了防御。');
  }
  
  basicHeal(ctx) {
    this.currentHP = Math.min(this.currentHP + this.maxHP * 0.1, this.maxHP);
    ctx.addLog(this, '恢复了一些生命值。');
  }
  
  basicCharge(ctx) {
    this.baseAttack += 1;
    this.baseDefense += 1;
    ctx.addLog(this, '聚集了力量，基础属性永久提升。');
  }
}