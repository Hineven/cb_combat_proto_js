// 基本游戏规则概述：
// 在游戏中，有玩家角色和敌对角色两个角色。玩家可以控制玩家角色。游戏分回合进行，每回合，玩家角色先行动，敌对角色后行动。

// 玩家角色拥有卡牌，所有玩家角色的卡牌排成一行。
// 玩家回合分为三个阶段：回合开始阶段、行动阶段、回合结束阶段
// 回合开始阶段：
//   玩家补充行动点到满。
//   触发钩子，执行一些卡牌可能注册过的特殊逻辑。
// 回合行动阶段：玩家可以不断使用行动点对首位卡牌进行两种操作：运气、发动。当玩家行动点消耗完时，行动阶段自动结束。
//   运气：消耗一个行动点，将首位卡牌移动到末尾，并按照玩家角色当前状态触发卡牌的运气效果，按下j键可以运气。
//   发动：消耗一个行动点，在回合结束或下一次运气前，按照玩家角色当前状态触发卡牌的主动发动效果，按下k可以发动。
//       注意，玩家可以对同一张卡牌按下多次k来“多重发动”卡牌，这种情况下，在下一次运气前此卡牌仍只会发动一次，但是发动时卡牌效果所计算玩家角色的状态会获得50%的提升。
// 回合结束阶段：
//   触发钩子，执行一些卡牌可能注册过的特殊逻辑。
//   清空行动点。


// 敌对角色相对简单，有固定的行动逻辑，每回合会采取四种策略之一：攻击（对玩家角色按照某些逻辑计算并造成伤害）、回血、防御（下回合所受伤害大幅减小）、聚气（后续回合中，基础攻击力和防御力永久提升）。


// 效果类型枚举类
export class EffectType {
  // 增益
  static Buff = 'Buff';
  // 减益
  static Debuff = 'Debuff';
  // 其它
  static Other = 'Other';
}

// 效果基类，能附着在角色上，并在UI上显示出来
export class Effect {
  constructor () {
    this.color = 'white'; // 效果的颜色
    this.name = ''; // 效果的名称
    this.name_tag = ''; // 用于简短显示的名称，一般为一个汉字。如果为空，则默认为name的第一个汉字
    this.description = ''; // 效果的描述，用于细节面板中显示。
    this.type = EffectType.Buff; // 效果的类型
    this.shouldDisplay = true; // 是否在UI上显示
    this.owner = null; // 效果的所有者
  }
  // 效果被附着到角色上时，此函数会被调用，可以用于注册各种监听器
  onApply (ctx, target) {
    
  }
  // 效果被移除时，此函数会被调用，可以用于删除各种监听器
  onRemove (ctx, target) {

  }

  getDescription(ctx) {
    // Basic implementation, can be overridden by subclasses for dynamic descriptions
    return this.description || this.name || 'No detailed description available.';
  }
}


// 角色状态类，玩家角色和敌对角色共有的状态
export class CharacterState {
  constructor() {
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
export class PlayerState extends CharacterState {
  constructor() {
    super();
    this.name = 'Player';
    this.cards = []; // 卡牌列表
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

// 敌对角色类，现在也继承自PlayerState
export class EnemyState extends PlayerState {
  constructor() {
    super();
    this.name = 'Enemy';
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
      
      // 看看是发动还是运气
      const shouldActivate = Math.random() < this.preferActivation && 
                            this.cards[0].getCanActivate(ctx, this) &&
                            this.activationCount < this.maxPendingActivation;
      
      if (shouldActivate) {
        // 尝试发动卡牌
        const success = ctx.activation(this);
        if (!success) {
          // 如果发动失败，执行运气
          ctx.cultivation(this);
        }
        action = "used_card";
      } else {
        // 执行运气
        ctx.cultivation(this);
        action = "used_card";
      }
    }
    
    // 当行动点耗尽时，主动结束回合
    await new Promise(resolve => setTimeout(resolve, this.actionDelay));
    ctx.endTurn(this);
    
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
      this.player = new PlayerState(); // 玩家角色
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
    // @param {PlayerState} character - 获得灵气的角色
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
    // @param {PlayerState} character - 消耗灵气的角色
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
      if(character.activationCount > 0 && character.cards.length > 0) {
        const cardName = character.cards[0].name;
        this.addLog(character, `发动了 ${character.activationCount} 重 ${cardName}。`);
        character.cards[0].activationEffect(this, character);
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
      
      this.tryActivatePendingActivation(character);
      character.cards[0].cultivationEffect(this, character);
      // 把排头的卡牌移动到末尾
      const shiftedCard = character.cards.shift();
      if (shiftedCard) {
        character.cards.push(shiftedCard);
        this.addLog(character, `运气 ${shiftedCard.name}。`);
      }
      // 消耗一个行动点
      this.consumeAP(character, character.cards[0].cultivationAPCost);
      return true; // 返回true表示操作成功
    }

    // 发动
    activation(character) {
      // 如果行动点不足，不能继续发动
      if (character.currentAP <= 0) {
        return false; // 返回false表示操作失败
      }
      
      // 如果超过最大pendingActivation，啥都不干，返回false
      if (character.activationCount + 1 > character.maxPendingActivation) {
        return false;
      }
      // 如果卡牌不可发动，啥都不干，返回false
      if (character.cards[0].getCanActivate(this, character) == false) {
        return false;
      }
      // 如果超过卡牌maxPendingActivation，返回false
      if (character.activationCount + 1 > character.cards[0].maxPendingActivation) {
        return false;
      }
      character.activationCount++;
      this.addLog(character, `准备发动 ${character.cards[0].name} (当前 ${character.activationCount} 重)。`);
      // 消耗行动点
      this.consumeAP(character, character.cards[0].activationAPCost);
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
    
    playerActivation() {
      // 添加检查，仅在玩家回合时允许操作
      if (!this.canPlayerAct()) {
        console.log("现在不是玩家回合，无法操作");
        return false;
      }
      return this.activation(this.player);
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

// 卡牌类，表示一类卡牌的基础信息和执行逻辑，用于创建卡牌实例
// 继承自此类的子类可以定义具体的卡牌类型和效果
export class CardBase {
  constructor() {
    this.name = ''; // 卡牌名称
    this.cultivationAPCost = 1; // 运气的行动点消耗
    this.activationAPCost = 1; // 发动的行动点消耗
    this.subtitle = ''; // 简短描述卡牌所运功夫所属种类，用略小号字体显示在名称下方
    this.maxPendingActivation = 999; // 最大pending发动次数
    this.owner = null; // 卡牌所有者
  }
  // 卡牌的运气效果
  // @param {GameContext} ctx - 游戏上下文
  // @param {PlayerState} owner - 卡牌所有者
  cultivationEffect(ctx, owner) {
    // 卡牌的运气效果
    // 可以根据卡牌的具体实现来定义
  }
  // 卡牌的发动效果
  // @param {GameContext} ctx - 游戏上下文
  // @param {PlayerState} owner - 卡牌所有者
  activationEffect(ctx, owner) {
    // 卡牌的发动效果
    // 可以根据卡牌的具体实现来定义 
  }
  // 卡牌初始化时会被调用
  // @param {GameContext} ctx - 游戏上下文
  // @param {PlayerState} owner - 卡牌所有者
  init(ctx, owner) {
    this.owner = owner;
  }
  // 卡牌被移除时会被调用
  // @param {GameContext} ctx - 游戏上下文
  // @param {PlayerState} owner - 卡牌所有者
  remove(ctx, owner) {
    
  }

  // 卡牌发动效果描述
  getDescription(ctx, owner) {
    return "";
  }
  // 卡牌运气效果描述
  getPassiveDescription(ctx, owner) {
    return ""; // Default: no passive description
  }

  // 特殊效果，用于UI视觉展示
  getCardMajorColor(ctx, owner) {
    return "#f0f0f0"; // Default light gray
  }
  getMinorColor(ctx, owner) {
    return "#cccccc"; // Default gray
  }
  getDecorationColor(ctx, owner) {
    return "#aaaaaa"; // Default dark gray
  }
  getDecorationType (ctx, owner) {
    return "none"; // 'none', 'stripe', 'corner'
  }

  // 逻辑判断
  getCanActivate(ctx, owner) {
    return true; // Default to true, can be overridden in subclasses
  }
}