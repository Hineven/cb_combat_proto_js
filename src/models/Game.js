// 基本游戏规则概述：
// 在游戏中，有玩家角色和敌对角色两个角色。玩家可以控制玩家角色。游戏分回合进行，每回合，玩家角色先行动，敌对角色后行动。

// 角色拥有卡牌序列和手牌。手牌是卡牌序列的前N张牌（N为角色的手牌数属性）。
// 玩家回合分为三个阶段：回合开始阶段、行动阶段、回合结束阶段
// 回合开始阶段：
//   玩家补充行动点到满。
//   触发钩子，执行一些卡牌可能注册过的特殊逻辑。
// 回合行动阶段：玩家可以消耗行动点执行操作。当玩家行动点消耗完或主动选择结束时，行动阶段结束。
//   操作1：运气 - 消耗一个行动点，将卡牌序列首位卡牌移动到末尾，并触发该卡牌的运气效果。通过按J键或特定UI操作执行。
//   操作2：发动 - 消耗一个行动点，选择手牌中的任意一张卡牌（序列第i张，0 <= i < N）进行发动准备。
//            发动时，所选卡牌之前（序列0到i-1）的卡牌会被依次移动到卡牌序列的末尾（不触发运气效果）。
//            被选中的卡牌（原第i张，现第0张）进入“待激活”状态，其效果将在回合结束或下一次“运气”操作前结算。
//            可以对同一张“待激活”卡牌多次执行“发动”操作（如果AP允许），每次会增加其“重数”，可能增强其最终效果。
//            通过点击手牌中的卡牌，或按数字键1-N来发动对应手牌。
// 回合结束阶段：
//   如果存在“待激活”的卡牌，则发动其效果。
//   触发钩子，执行一些卡牌可能注册过的特殊逻辑。
//   清空行动点。

import { PlayingCharacterState, EnemyState } from './CharacterStateBase.js';
import { Effect, EffectType } from './EffectBase.js'; 
import { CardBase, CardSlot, EmptyCard } from './CardBase.js'; 

export class AttackContext {
  constructor() {
    this.originalDamage = 0;
    this.currentDamage = 0;
    this.attacker = null; // 攻击者
    this.defender = null; // 被攻击者
    this.overallMultiplier = 1;
  }
  getDamage() {
    return this.currentDamage * this.overallMultiplier;
  }
}

// 一些枚举类
export class RoundPhaseType {
  // 回合开始
  static Start = 'Start';
  // 行动
  static Action = 'Action';
  // 回合结束
  static End = 'End';
  // 战斗开始
  static BattleStart = 'BattleStart';
  // 战斗结束
  static BattleEnd = 'BattleEnd';
}

export class RoundActorType {
  // 玩家
  static Player = 'Player';
  // 敌人
  static Enemy = 'Enemy';
}

// 游戏上下文，用于协助卡牌读取游戏状态，以及执行逻辑
export class GameContext {
    constructor() {
      this.player = new PlayingCharacterState(); // 玩家角色
      this.enemy = new EnemyState(); // 敌对角色，现在是EnemyState类型
      this.round = 0; // 当前回合数
      this.roundActor = RoundActorType.Player; // 当前回合的行动方
      this.roundPhase = RoundPhaseType.Start; // 当前回合阶段
      this.battleCount = 0; // 当前战斗场次
      this.isBattleOver = false; // 当前战斗是否结束
      this.winner = null; // 当前战斗的胜利者

      this.subject = this.player; // 当前主体，可以是player或enemy
      // 删除playerActivationCount，替换为通用的activationCount

      this.logs = []; // 游戏日志数组

      // 将钩子改为通用形式，每个单位有自己的钩子
      this.battleStartHooks = new Map(); // 战斗开始阶段的钩子函数列表
      this.startPhaseHooks = new Map(); // 回合开始阶段的钩子函数列表
      this.actionPhaseHooks = new Map(); // 回合行动阶段的钩子函数列表
      this.endPhaseHooks = new Map(); // 回合结束阶段的钩子函数列表
      this.battleEndHooks = new Map(); // 战斗结束阶段的钩子函数列表

      this.onAttackHooks = []; // 攻击时的钩子函数列表，额外输入：攻击上下文
      this.onDamageHooks = []; // 受到伤害时的钩子函数列表，额外输入：攻击者、被攻击者、造成的伤害

      this.globals = {}; // 全局变量
      
      // 初始化钩子映射
      this.battleStartHooks.set(this.player, []);
      this.battleStartHooks.set(this.enemy, []);
      this.startPhaseHooks.set(this.player, []);
      this.startPhaseHooks.set(this.enemy, []);
      this.actionPhaseHooks.set(this.player, []);
      this.actionPhaseHooks.set(this.enemy, []);
      this.endPhaseHooks.set(this.player, []);
      this.endPhaseHooks.set(this.enemy, []);
      this.battleEndHooks.set(this.player, []);
      this.battleEndHooks.set(this.enemy, []);
    }

    // 初始化角色战斗状态
    initCharacterForBattle(character) {
      character.currentHP = character.maxHP;
      character.currentAP = 0;
      character.currentJin = 0;
      character.currentMu  = 0;
      character.currentShui = 0;
      character.currentHuo = 0;
      character.currentTu   = 0;
      character.currentHun  = 0;
      character.activeEffects = []; // 清空效果
      character.activationCount = 0; // 清空未决发动
      // 可以根据需要添加更多状态的重置
      this.addLog(character, '状态已重置，准备战斗！');
    }

    // 开始一场新的战斗
    startNewBattle() {
      this.battleCount++;
      this.isBattleOver = false;
      this.winner = null;
      this.round = 0;
      this.roundPhase = RoundPhaseType.BattleStart;
      this.addLog(`系统`, `第 ${this.battleCount} 场战斗开始！`);

      this.initCharacterForBattle(this.player);
      this.initCharacterForBattle(this.enemy);
      
      this.triggerBattleStartHooks(this.player);
      this.triggerBattleStartHooks(this.enemy);

      // 战斗开始后，直接开始玩家的第一个回合
      this.startPlayerTurn();
    }

    // 检查战斗是否结束并处理
    checkBattleOver() {
      if (this.isBattleOver) return true; // 如果已经结束，则不再重复判断

      if (this.player.currentHP <= 0) {
        this.isBattleOver = true;
        this.winner = this.enemy;
        this.addLog(`系统`, `${this.player.name} 被击败了！${this.enemy.name} 胜利！`);
        this.roundPhase = RoundPhaseType.BattleEnd;
        this.triggerBattleEndHooks(this.player); // 触发玩家方的战斗结束钩子
        this.triggerBattleEndHooks(this.enemy); // 触发敌人方的战斗结束钩子
        return true;
      }
      if (this.enemy.currentHP <= 0) {
        this.isBattleOver = true;
        this.winner = this.player;
        this.addLog(`系统`, `${this.enemy.name} 被击败了！${this.player.name} 胜利！`);
        this.roundPhase = RoundPhaseType.BattleEnd;
        this.triggerBattleEndHooks(this.player);
        this.triggerBattleEndHooks(this.enemy);
        return true;
      }
      return false;
    }

    // 重构钩子触发函数
    triggerBattleStartHooks(actor) {
      const hooks = this.battleStartHooks.get(actor) || [];
      hooks.forEach(hook => hook(this, actor)); // 传递 actor
    }
    triggerStartPhaseHooks(actor) {
      const hooks = this.startPhaseHooks.get(actor) || [];
      hooks.forEach(hook => hook(this, actor)); // 传递 actor
    }
    
    triggerActionPhaseHooks(actor) {
      const hooks = this.actionPhaseHooks.get(actor) || [];
      hooks.forEach(hook => hook(this, actor)); // 传递 actor
    }
    
    triggerEndPhaseHooks(actor) {
      const hooks = this.endPhaseHooks.get(actor) || [];
      hooks.forEach(hook => hook(this, actor)); // 传递 actor
    }
    triggerBattleEndHooks(actor) {
      const hooks = this.battleEndHooks.get(actor) || [];
      hooks.forEach(hook => hook(this, actor)); // 传递 actor
    }

    triggerOnAttackHooks(ctx) {
      this.onAttackHooks.forEach(hook => hook(this, ctx));
    }
    triggerOnDamageHooks(source, target, damage) {
      this.onDamageHooks.forEach(hook => hook(this, source, target, damage));
    }

    addLog(actor, action) {
      // Actor can be a string (for backward compatibility) or a CharacterState object
      const actorName = typeof actor === 'string' ? actor : actor.name;
      this.logs.push({ actor: actorName, action, timestamp: new Date() });
      if (this.logs.length > 100) { // Keep the log size manageable
        this.logs.shift();
      }
    }

    // 卡牌助手函数，用于协助卡牌执行一些操作

    // 增加效果
    // @param {CharacterState} target - 目标角色  
    // @param {Effect} effect - 效果
    // @param {CharacterState} source - 效果来源（可选）
    addEffect(target, effect, source = null) {
      effect.owner = source || this.subject;
      target.activeEffects.push(effect);
      effect.onApply(this, target);
      
      if(effect.shouldDisplay) this.addLog(target, `获得了效果 ${effect.name}。`);
    }

    // 移除效果
    // @param {CharacterState} target - 目标角色
    // @param {Effect} effect - 效果
    removeEffect(target, effect) {
      const index = target.activeEffects.indexOf(effect);
      if (index > -1) {
        target.activeEffects.splice(index, 1);
        effect.onRemove(this, target);
        
        if(effect.shouldDisplay) this.addLog(target, `失去了效果 ${effect.name}。`);
      }
    }

    // 造成伤害
    // @param {CharacterState} source - 伤害来源
    // @param {CharacterState} target - 伤害目标
    // @param {number} damage - 伤害值
    launchAttackTo(source, target, damage) {
      var attack_context = new AttackContext();
      attack_context.originalDamage = damage;
      attack_context.currentDamage = damage;
      attack_context.attacker = source;
      attack_context.defender = target;
      attack_context.overallMultiplier = 1;
      this.triggerOnAttackHooks(attack_context);
      var final_damage = attack_context.getDamage();
      this.triggerOnDamageHooks(attack_context.attacker, attack_context.defender, final_damage);
      target.currentHP -= final_damage;
      target.currentHP = Math.max(target.currentHP, 0); //确保HP不为负

      this.addLog(source, `对 ${target.name} 造成 ${final_damage.toFixed(2)} 伤害。`);
      this.checkBattleOver(); // 每次攻击后检查战斗是否结束
    }

    // 治疗
    // @param {CharacterState} target - 治疗目标
    // @param {number} amount - 治疗量
    // @param {CharacterState} source - 治疗来源（可选）
    healCharacter(target, amount, source = null) {
      const previousHP = target.currentHP;
      target.currentHP = Math.min(target.currentHP + amount, target.maxHP);
      const healedAmount = target.currentHP - previousHP;

      if (healedAmount > 0) {
        const sourceName = source ? source.name : '效果';
        this.addLog(target, `被 ${sourceName} 恢复了 ${healedAmount.toFixed(2)} 生命。`);
      }
      // 可以在这里添加治疗相关的钩子，如果需要的话
      // this.triggerOnHealHooks(target, amount, source);
    }

    // 防御数值变更
    // @param {CharacterState} target - 防御目标
    // @param {number} delta - 防御数值delta
    getDefence(target, delta) {
      target.computedDefense += delta;
      const actionVerb = delta > 0 ? '增加' : '减少';
      this.addLog(target, `${actionVerb}了 ${Math.abs(delta)} 防御力。`);
    }

    // 消耗行动点
    consumeAP(target, delta) {
      target.currentAP -= delta;
    }

    // 消耗丹田储量（一般用于生成灵气）
    consumeDantianStorage(character, delta) {
      if(character.dantianAura < delta) return false;
      character.dantianAura -= delta;
      character.dantianAura = Math.max(character.dantianAura, 0);
      return true;
    }

    // 产出灵气
    // @param {PlayingCharacterState} character - 获得灵气的角色
    // @param {string} type - 灵气类型
    // @param {number} delta - 灵气数量
    produceAura(character, type, delta) {
      switch(type) {
        case '金':
        case 'jin':
        case 'Jin':
          character.currentJin += delta;
          break;
        case '木':
        case 'mu':
        case 'Mu':
          character.currentMu += delta;
          break;
        case '水':
        case 'shui':
        case 'Shui':
          character.currentShui += delta;
          break;
        case '火':
        case 'huo':
        case 'Huo':
          character.currentHuo += delta;
          break;
        case '土':
        case 'tu':
        case 'Tu':
          character.currentTu += delta;
          break;
        case '杂':
        case 'hun':
        case 'Hun':
          character.currentHun += delta;
          break;
      }
      return true;
    }

    // 消耗灵气
    // @param {PlayingCharacterState} character - 消耗灵气的角色
    // @param {string} type - 灵气类型
    // @param {number} delta - 灵气数量
    consumeAura(character, type, delta) {
      switch(type) {
        case '金':
        case 'jin':
        case 'Jin':
          character.currentJin -= delta;
          break;
        case '木':
        case 'mu':
        case 'Mu':
          character.currentMu -= delta;
          break;
        case '水':
        case 'shui':
        case 'Shui':
          character.currentShui -= delta;
          break;
        case '火':
        case 'huo':
        case 'Huo':
          character.currentHuo -= delta;
          break;
        case '土':
        case 'tu':
        case 'Tu':
          character.currentTu -= delta;
          break;
        case '杂':
        case 'hun':
        case 'Hun':
          character.currentHun -= delta;
          break;
      }
      return true;
    }

    // 结束回合
    async endPhase () {
      if(this.roundPhase === RoundPhaseType.End) {
        // 可能在一个递归之中，不要继续反复结束回合了。
        return;
      }
      
      if (this.roundActor === RoundActorType.Player) {
        this.endPlayerTurn();
      } else {
        this.endEnemyTurn();
      }
    }

    // 开始玩家回合
    startPlayerTurn() {
      if (this.checkBattleOver()) return; // 如果战斗已结束，则不开始新回合

      this.subject = this.player;
      this.player.currentAP = this.player.maxAP;
      this.roundActor = RoundActorType.Player;
      this.roundPhase = RoundPhaseType.Start;
      this.triggerStartPhaseHooks(this.player);
      this.roundPhase = RoundPhaseType.Action; // 进入行动阶段
    }

    // 结束玩家回合
    endPlayerTurn() {
      if (this.checkBattleOver()) return;

      this.roundPhase = RoundPhaseType.End;
      this.tryActivatePendingActivation(this.player);
      this.addLog(this.player, '结束回合。');
      this.triggerEndPhaseHooks(this.player);
      this.player.currentAP = 0;
      if (!this.checkBattleOver()) { // 结束回合后再次检查，防止在回合结束钩子中结束战斗
        this.startEnemyTurn(); // 玩家回合结束后开始敌人回合
      }
    }

    // 开始敌人回合
    async startEnemyTurn() {
      if (this.checkBattleOver()) return;

      this.subject = this.enemy;
      this.roundActor = RoundActorType.Enemy;
      this.roundPhase = RoundPhaseType.Start;
      this.triggerStartPhaseHooks(this.enemy);
      this.roundPhase = RoundPhaseType.Action;
      
      // 敌人回合开始，补充行动点
      this.enemy.currentAP = this.enemy.maxAP;
      
      // 执行AI决策
      const action = await this.enemy.decideAction(this);
      // 由于decideAction已经执行了卡牌操作和结束回合，不需要在这里结束回合
      // this.endEnemyTurn(); // 删除这一行，让AI自己决定何时结束回合
    }

    // 结束敌人回合
    endEnemyTurn() {
      if (this.checkBattleOver()) return;

      this.roundPhase = RoundPhaseType.End;
      this.addLog(this.enemy, '结束回合。');
      this.triggerEndPhaseHooks(this.enemy);
      this.round++; // 回合数+1
      if (!this.checkBattleOver()) {
        this.startPlayerTurn(); // 敌人回合结束后开始玩家回合
      }
    }

    // 如果当前有没有发动但已经按下的卡牌，尝试发动
    tryActivatePendingActivation(character) {
      if(character.activationCount > 0 && character.cardSlots.length > 0 && !character.cardSlots[0].isEmpty()) {
        const cardName = character.cardSlots[0].card.name;
        this.addLog(character, `发动了 ${character.activationCount} 重 ${cardName}。`);
        character.cardSlots[0].card.activationEffect(this, character);
        character.activationCount = 0;
      }
    }

    // 通用操作函数，用于UI和AI调用
    
    // 运气
    cultivation(character) {
      // 如果行动点不足，不能继续运气
      if (character.currentAP <= 0) {
        return false; // 返回false表示操作失败
      }
      
      this.tryActivatePendingActivation(character); // 尝试发动待激活的卡牌（通常是之前“激发”操作选中的牌）
      if (character.cardSlots.length > 0) {
        const firstSlot = character.cardSlots[0];
        // "运气" 总是作用于牌堆顶的第一张牌
        firstSlot.card.cultivationEffect(this, character);
        // 把排头的卡槽移动到末尾
        const shiftedSlot = character.cardSlots.shift();
        if (shiftedSlot) {
          character.cardSlots.push(shiftedSlot);
          this.addLog(character, `运气 ${firstSlot.card.name}。`);
        }
        // 消耗一个行动点
        this.consumeAP(character, firstSlot.card.cultivationAPCost);
      } else {
        // 没有卡槽，记录日志并消耗AP
        this.addLog(character, `没有可运气的卡牌。`);
        this.consumeAP(character, 1); // 假设没有卡牌时运气也消耗1AP
        return false; // 操作实际未执行有效内容
      }
      return true; // 返回true表示操作成功
    }

    // 发动
    // @param {CharacterState} character - 执行发动的角色
    // @param {number} cardIndexInHand - 要发动的卡牌在手牌中的索引 (0-based)
    activation(character, cardIndexInHand) {
      // 如果行动点不足，不能继续发动
      if (character.currentAP <= 0) {
        this.addLog(character, `行动点不足，无法发动。`);
        return false; 
      }
      
      // 检查手牌索引是否有效
      if (cardIndexInHand < 0 || cardIndexInHand >= Math.min(character.cardSlots.length, character.handSize)) {
        this.addLog(character, `选择的卡牌无效。`);
        return false; 
      }

      const targetCardSlot = character.cardSlots[cardIndexInHand];

      if (!targetCardSlot || targetCardSlot.isEmpty()) {
        this.addLog(character, `选择的卡槽为空，无法发动。`);
        return false; 
      }

      const cardToActivate = targetCardSlot.card;

      // 如果超过最大pendingActivation，啥都不干，返回false
      // 注意：这里的 activationCount 是角色身上的，不是卡牌的
      if (character.activationCount + 1 > character.maxPendingActivation) {
        this.addLog(character, `已达到最大准备发动数量。`);
        return false;
      }
      // 如果卡牌不可发动，啥都不干，返回false
      if (cardToActivate.getCanActivate(this, character) == false) {
        this.addLog(character, `${cardToActivate.name} 当前不可发动。`);
        return false;
      }
      // 如果超过卡牌maxPendingActivation，返回false
      if (character.activationCount + 1 > cardToActivate.maxPendingActivation) {
        this.addLog(character, `${cardToActivate.name} 已达到其最大准备发动次数。`);
        return false;
      }

      // 丢弃激发卡牌之前的卡牌，并移动到牌堆末尾
      // 这些卡牌不触发“运气”效果
      for (let i = 0; i < cardIndexInHand; i++) {
        const discardedSlot = character.cardSlots.shift(); // 从头部移除
        if (discardedSlot && !discardedSlot.isEmpty()) {
          character.cardSlots.push(discardedSlot); // 添加到末尾
          this.addLog(character, `丢弃了 ${discardedSlot.card.name} 到牌堆底。`);
        }
      }
      
      // 此时，原先在 cardIndexInHand 的牌现在应该在索引 0
      // 更新日志和角色状态，标记这张卡牌为待发动
      character.activationCount++; 
      // 注意：实际的卡牌效果发动(activationEffect)是在回合结束或者下一次运气时由 tryActivatePendingActivation 触发
      // 这里只是标记为“准备发动”
      this.addLog(character, `准备发动 ${cardToActivate.name} (当前 ${character.activationCount} 重)。`);
      // 消耗行动点
      this.consumeAP(character, cardToActivate.activationAPCost);
      return true; // 返回true表示操作成功
    }
    
    // 结束回合 - 新增的独立操作
    endTurn(character) {
      if (this.isBattleOver) { // 如果战斗已结束，不允许结束回合
        this.addLog(character, `战斗已结束，无法结束回合。`);
        return false;
      }
      // 只有在行动点耗尽时才能结束回合
      if (character.currentAP > 0) {
        this.addLog(character, `还有行动点，不能结束回合。`);
        return false; // 返回false表示操作失败
      }
      
      // 调用内部的结束回合逻辑
      this.endPhase();
      return true; // 返回true表示操作成功
    }
    
    // 检查是否是玩家回合并允许操作
    canPlayerAct() {
      return !this.isBattleOver && this.roundActor === RoundActorType.Player && this.roundPhase === RoundPhaseType.Action;
    }

    // 保留原始的玩家操作函数作为便捷方法
    playerCultivation() {
      // 添加检查，仅在玩家回合时允许操作
      if (!this.canPlayerAct()) {
        console.log("现在不是玩家回合，无法操作");
        return false;
      }
      return this.cultivation(this.player);
    }
    
    // playerActivation 现在需要一个卡牌索引
    // @param {number} cardIndexInHand - 玩家手牌中要发动的卡牌索引
    playerActivation(cardIndexInHand) {
      // 添加检查，仅在玩家回合时允许操作
      if (!this.canPlayerAct()) {
        console.log("现在不是玩家回合，无法操作");
        return false;
      }
      return this.activation(this.player, cardIndexInHand);
    }
    
    // 新增玩家结束回合便捷方法
    playerEndTurn() {
      // 添加检查，仅在玩家回合时允许操作
      if (!this.canPlayerAct()) {
        console.log("现在不是玩家回合，无法操作");
        return false;
      }
      return this.endTurn(this.player);
    }
};