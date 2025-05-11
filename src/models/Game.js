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
  }
  // 效果被附着到角色上时，此函数会被调用，可以用于注册各种监听器
  onApply (ctx) {
    
  }
  // 效果被移除时，此函数会被调用，可以用于删除各种监听器
  onRemove (ctx) {

  }

  getDescription(ctx) {
    // Basic implementation, can be overridden by subclasses for dynamic descriptions
    return this.description || this.name || 'No detailed description available.';
  }
}


// 角色状态类，玩家角色和敌对角色共有的状态
export class CharacterState {
  constructor() {
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
    this.cards = []; // 卡牌列表
    this.currentJin = 0; // 当前金灵气数量
    this.currentMu  = 0; // 当前木灵气数量
    this.currentShui = 0; // 当前水灵气数量
    this.currentHuo = 0; // 当前火灵气数量
    this.currentTu   = 0; // 当前土灵气数量
    this.currentHun  = 0; // 当前杂灵气数量
    this.dantianAura = 100; // 丹田中可以产出的灵气数量
    this.maxPendingActivation = 3; // 最大的未决发动次数
  }
  currentAuraSum() {
    return this.currentJin + this.currentMu + this.currentShui + this.currentHuo + this.currentTu + this.currentHun;
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

// 游戏上下文，用于协助卡牌读取游戏状态，以及执行逻辑
export class GameContext {
    constructor() {
      this.player = new PlayerState(); // 玩家角色
      this.enemy = new CharacterState(); // 敌对角色
      this.round = 0; // 当前回合数
      this.roundActor = RoundActorType.Player; // 当前回合的行动方
      this.roundPhase = RoundPhaseType.Start; // 当前回合阶段

      this.playerActivationCount = 0; // 玩家发动当前排头卡牌发动了几次连续（按了几次k）

      this.logs = []; // <--- 新增：游戏日志数组

      this.playerStartPhaseHooks = []; // 玩家回合开始阶段的钩子函数列表
      this.playerActionPhaseHooks = []; // 玩家回合行动阶段的钩子函数列表
      this.playerEndPhaseHooks = []; // 玩家回合结束阶段的钩子函数列表
      this.enemyStartPhaseHooks = []; // 敌人回合开始阶段的钩子函数列表
      this.enemyActionPhaseHooks = []; // 敌人回合行动阶段的钩子函数列表
      this.enemyEndPhaseHooks = []; // 敌人回合结束阶段的钩子函数列表

      this.onAttackHooks = []; // 攻击时的钩子函数列表，额外输入：攻击上下文
      this.onDamageHooks = []; // 受到伤害时的钩子函数列表，额外输入：攻击者、被攻击者、造成的伤害

      this.globals = {}; // 全局变量
    }


    triggerPlayerStartPhaseHooks() {
      this.playerStartPhaseHooks.forEach(hook => hook(this));
    }
    triggerPlayerActionPhaseHooks() {
      this.playerActionPhaseHooks.forEach(hook => hook(this));
    }
    triggerPlayerEndPhaseHooks() {
      this.playerEndPhaseHooks.forEach(hook => hook(this));
    }
    triggerEnemyStartPhaseHooks() {
      this.enemyStartPhaseHooks.forEach(hook => hook(this));
    }
    triggerEnemyActionPhaseHooks() {
      this.enemyActionPhaseHooks.forEach(hook => hook(this));
    }
    triggerEnemyEndPhaseHooks() {
      this.enemyEndPhaseHooks.forEach(hook => hook(this));
    }

    triggerOnAttackHooks(ctx) {
      this.onAttackHooks.forEach(hook => hook(this, ctx));
    }
    triggerOnDamageHooks(source, target, damage) {
      this.onDamageHooks.forEach(hook => hook(this, source, target, damage));
    }

    addLog(actor, action) {
      this.logs.push({ actor, action, timestamp: new Date() });
      if (this.logs.length > 100) { // Keep the log size manageable
        this.logs.shift();
      }
    }

    // 卡牌助手函数，用于协助卡牌执行一些操作

    // 增加效果
    // @param {CharacterState} target - 目标角色  
    // @param {Effect} effect - 效果
    addEffect(target, effect) {
      target.activeEffects.push(effect);
      effect.onApply(this);
      if(effect.shouldDisplay) this.addLog(target === this.player ? 'Player' : 'Enemy', `获得了效果 ${effect.name}。`);
    }

    // 移除效果
    // @param {CharacterState} target - 目标角色
    // @param {Effect} effect - 效果
    removeEffect(target, effect) {
      const index = target.activeEffects.indexOf(effect);
      if (index > -1) {
        target.activeEffects.splice(index, 1);
        effect.onRemove(this);
        if(effect.shouldDisplay) this.addLog(target === this.player ? 'Player' : 'Enemy', `失去了效果 ${effect.name}。`);
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
      this.addLog(source === this.player ? 'Player' : 'Enemy', `对 ${target === this.player ? 'Player' : 'Enemy'} 造成 ${final_damage.toFixed(2)} 伤害。`);
    }

    // 防御数值变更
    // @param {CharacterState} target - 防御目标
    // @param {number} delta - 防御数值delta
    getDefence(target, delta) {
      target.computedDefense += delta;
      const actorName = target === this.player ? 'Player' : 'Enemy';
      const actionVerb = delta > 0 ? '增加' : '减少';
      this.addLog(actorName, `${actionVerb}了 ${Math.abs(delta)} 防御力。`);
    }

    // 消耗行动点
    consumeAP(target, delta) {
      target.currentAP -= delta;
    }

    // 消耗丹田储量（一般用于生成灵气）
    consumeDantianStorage(delta) {
      if(this.player.dantianAura < delta) return false;
      this.player.dantianAura -= delta;
      this.player.dantianAura = Math.max(this.player.dantianAura, 0);
      return true;
    }

    // 产出灵气
    // @param {string} type - 灵气类型
    // @param {number} delta - 灵气数量
    produceAura(type, delta) {
      switch(type) {
        case '金':
        case 'jin':
        case 'Jin':
          this.player.currentJin += delta;
          break;
        case '木':
        case 'mu':
        case 'Mu':
          this.player.currentMu += delta;
          break;
        case '水':
        case 'shui':
        case 'Shui':
          this.player.currentShui += delta;
          break;
        case '火':
        case 'huo':
        case 'Huo':
          this.player.currentHuo += delta;
          break;
        case '土':
        case 'tu':
        case 'Tu':
          this.player.currentTu += delta;
          break;
        case '杂':
        case 'hun':
        case 'Hun':
          this.player.currentHun += delta;
          break;
      }
      return true;
    }

    // 消耗灵气
    // @param {string} type - 灵气类型
    // @param {number} delta - 灵气数量
    consumeAura(type, delta) {
      switch(type) {
        case '金':
        case 'jin':
        case 'Jin':
          this.player.currentJin -= delta;
          break;
        case '木':
        case 'mu':
        case 'Mu':
          this.player.currentMu -= delta;
          break;
        case '水':
        case 'shui':
        case 'Shui':
          this.player.currentShui -= delta;
          break;
        case '火':
        case 'huo':
        case 'Huo':
          this.player.currentHuo -= delta;
          break;
        case '土':
        case 'tu':
        case 'Tu':
          this.player.currentTu -= delta;
          break;
        case '杂':
        case 'hun':
        case 'Hun':
          this.player.currentHun -= delta;
          break;
      }
      return true;
    }

    // 结束回合
    endPhase () {
      this.roundPhase = RoundPhaseType.End;
      if (this.roundActor === RoundActorType.Player) {
        this.tryActivatePendingActivation();

        
        this.addLog('Player', '结束回合。');
        this.triggerPlayerEndPhaseHooks();
        this.player.currentAP = 0;

        this.triggerEnemyStartPhaseHooks();
        this.roundActor = RoundActorType.Enemy;
        this.roundPhase = RoundPhaseType.Start;
        
        // TODO 现在敌人没行动AI，目前以endphase直接跳过。
        this.endPhase();
      } else {
        this.addLog('Enemy', '结束回合。');
        this.triggerEnemyEndPhaseHooks();
        this.round++;

        this.player.currentAP = this.player.maxAP;
        this.triggerPlayerStartPhaseHooks();
        this.roundActor = RoundActorType.Player;
        this.roundPhase = RoundPhaseType.Start;
      }
    }

    // 如果当前有没有发动但已经按下的卡牌，尝试发动
    tryActivatePendingActivation() {
      if(this.playerActivationCount > 0) {
        // console.log(this.player.cards);
        const cardName = this.player.cards[0].name;
        this.addLog('Player', `发动了 ${this.playerActivationCount} 重 ${cardName}。`);
        this.player.cards[0].activationEffect(this);
        this.playerActivationCount = 0;
      }
    }

    // 玩家操作函数，用于UI调用
    
    // 玩家选择运气
    playerCultivation() {
      // 如果行动点不足，结束回合
      if (this.player.currentAP <= 0) {
        this.endPhase();
        return; // Added return to prevent further execution
      }
      this.tryActivatePendingActivation();
      this.player.cards[0].cultivationEffect(this);
      // 把排头的卡牌移动到末尾
      const shiftedCard = this.player.cards.shift();
      if (shiftedCard) {
        this.player.cards.push(shiftedCard);
        this.addLog('Player', `运气 ${shiftedCard.name}。`);
      }
      // 消耗一个行动点
      this.consumeAP(this.player, this.player.cards[0].cultivationAPCost);
      // 如果行动点不足，结束回合
      if (this.player.currentAP <= 0) {
        this.endPhase();
      }
    }

    // 玩家选择发动
    playerActivation() {
      // 如果行动点不足，结束回合
      if (this.player.currentAP <= 0) {
        this.endPhase();
        return false; // Added return to prevent further execution
      }
      // 如果超过最大pendingActivation，啥都不干，返回false
      if (this.playerActivationCount + 1 > this.player.maxPendingActivation) {
        return false;
      }
      // 如果卡牌不可发动，啥都不干，返回false
      if (this.player.cards[0].getCanActivate(this) == false) {
        return false;
      }
      // 如果超过卡牌maxPendingActivation，返回false
      if (this.playerActivationCount + 1 > this.player.cards[0].maxPendingActivation) {
        return false;
      }
      this.playerActivationCount ++;
      this.addLog('Player', `准备发动 ${this.player.cards[0].name} (当前 ${this.playerActivationCount} 重)。`);
      // 消耗行动点
      this.consumeAP(this.player, this.player.cards[0].activationAPCost);
      console.log(this.player);
      // 如果行动点不足，结束回合
      if (this.player.currentAP <= 0) {
        this.endPhase();
      }
      return true;
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
  }
  // 卡牌的运气效果
  // @param {GameContext} ctx - 游戏上下文
  cultivationEffect(ctx) {
    // 卡牌的运气效果
    // 可以根据卡牌的具体实现来定义
  }
  // 卡牌的发动效果
  // @param {GameContext} ctx - 游戏上下文
  activationEffect(ctx) {
    // 卡牌的发动效果
    // 可以根据卡牌的具体实现来定义 
  }
  // 卡牌初始化时会被调用
  // @param {GameContext} ctx - 游戏上下文
  init(ctx) {
    
  }
  // 卡牌被移除时会被调用
  // @param {GameContext} ctx - 游戏上下文
  remove(ctx) {
    
  }

  // 卡牌发动效果描述
  getDescription(ctx) {
    return "";
  }
  // 卡牌运气效果描述
  getPassiveDescription(ctx) {
    return ""; // Default: no passive description
  }

  // 特殊效果，用于UI视觉展示
  getCardMajorColor(ctx) {
    return "#f0f0f0"; // Default light gray
  }
  getMinorColor(ctx) {
    return "#cccccc"; // Default gray
  }
  getDecorationColor(ctx) {
    return "#aaaaaa"; // Default dark gray
  }
  getDecorationType (ctx) {
    return "none"; // 'none', 'stripe', 'corner'
  }

  // 逻辑判断
  getCanActivate(ctx) {
    return true; // Default to true, can be overridden in subclasses
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
}

export class RoundActorType {
  // 玩家
  static Player = 'Player';
  // 敌人
  static Enemy = 'Enemy';
}