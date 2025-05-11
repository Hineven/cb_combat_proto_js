import { CardBase, Effect, GameContext } from './Game.js';
// 具体的卡牌类，继承自卡牌类，定义了具体的卡牌类型和效果
// 可以根据需要创建多个具体的卡牌类，每个卡牌类可以定义自己的卡牌类型和效果
export class BasicAttackCard extends CardBase {
    constructor() {
      super();
      this.name = '打击';
      this.subtitle = '凡人武学';
      this.cultivationAPCost = 1; // Corrected typo
    }
    activationEffect(ctx, owner) {
      // 造成{atk}伤害。
      const damage = owner.computedAttack * (1 + (owner.activationCount > 1 ? (owner.activationCount -1) * 0.5 : 0)); // Apply multi-activation bonus
      const target = owner.isPlayer ? ctx.enemy : ctx.player; // If owner is player, target is enemy and vice versa
      ctx.launchAttackTo(owner, target, damage);
    }
    getDescription(ctx, owner) {
      const damage = owner.computedAttack * (1 + (owner.activationCount > 0 ? (owner.activationCount) * 0.5 : 0)); // Show potential damage with multi-activation
      return `【发】造成${damage.toFixed(2)}伤害。`;
    }
    getCardMajorColor(ctx, owner) {
      return "#ffdddd"; // Light red for attack cards
    }
    getMinorColor(ctx, owner) {
      return "#ffaaaa"; // Darker red for border
    }
    getDecorationColor(ctx, owner) {
      return "#cc0000"; // Strong red for decoration
    }
    // getDecorationType (ctx, owner) {
    //   return "stripe";
    // }
  }
  
import { TemporaryDefenceEffect } from './Effects.js'; // Import the effect class

  export class BasicDefenseCard extends CardBase {
    constructor() {
      super();
      this.name = '防御';
      this.subtitle = '凡人武学';
      this.cultivationAPCost = 1; // Corrected typo
    }
    getDefenseBonus(ctx, owner) {
      // 计算防御力加成
      const defenseBonus = owner.baseDefense * (1 + (owner.activationCount > 0 ? (owner.activationCount) * 0.5 : 0)); // Apply multi-activation bonus
      return defenseBonus;
    }
    activationEffect(ctx, owner) {
      // 增加10点临时防御力
      const effect = new TemporaryDefenceEffect(2, this.getDefenseBonus(ctx, owner)); // Duration is 2 rounds
      ctx.addEffect(owner, effect, owner);
    }
    getDescription(ctx, owner) {
      const defenseBonus = this.getDefenseBonus(ctx, owner); // Show potential bonus with multi-activation
      return `【发】下2回合临时增加${defenseBonus.toFixed(2)}防御力。`;
    }
    getCardMajorColor(ctx, owner) {
      return "#ddddff"; // Light blue for defense cards
    }
    getMinorColor(ctx, owner) {
      return "#aaaaff"; // Darker blue for border
    }
    getDecorationColor(ctx, owner) {
      return "#0000cc"; // Strong blue for decoration
    }
    // getDecorationType (ctx, owner) {
    //   return "corner";
    // }
  }

  import { YingChengEffect } from './Effects.js';
  
  // 硬撑，打架神器
  export class YingChengCard extends CardBase {
    constructor() {
        super();
        this.name = '硬撑';
        this.subtitle = '凡人武学';
        this.maxPendingActivation = 1; // 最大挂起发动次数
    }
    getDescription(ctx, owner) {
        return `【发】下回合减伤50%，下下回合受伤害增伤50%`;
    }
    activationEffect(ctx, owner) {
        const effect = new YingChengEffect();
        ctx.addEffect(owner, effect, owner);
    }
  };
  
  // 灵根，可以从丹田中产出灵气，一般仅有一张
  export class Leino extends CardBase {
    constructor(leinoType, leionQuality) {
      super();
      this.name = '吐纳功';
      this.subtitle = '灵根';
      this.leinoType = leinoType; // 灵根类型（决定产出灵气的种类）
      this.leinoQuality = leionQuality; // 灵根品质（决定产出灵气的数量）
    }
    cultivationEffect(ctx, owner) {
      // 产出灵气
      if(ctx.consumeDantianStorage(owner, this.leinoQuality)) {
        ctx.produceAura(owner, this.leinoType, this.leinoQuality);
        ctx.addLog(owner, `产出 ${this.leinoQuality} 点 ${this.leinoType} 灵气。`);
      } else {
        ctx.addLog(owner, `丹田储量不足，无法产出灵气。`);
      }
    }
    getPassiveDescription(ctx, owner) {
      return `【运】产出${this.leinoQuality}点${this.leinoType}灵气。`;
    }
    getDescription(ctx, owner) {
      // 显示灵气产出
      const activationAmount = owner.activationCount > 0 ? owner.activationCount : 1; // If not yet activated, show for 1 activation
      return `【发】消耗${activationAmount}丹田，产出${activationAmount}点${this.leinoType}灵气。`;
    }
    getCardMajorColor(ctx, owner) {
      switch (this.leinoType) {
        case '金': return '#FFECB3'; // Light Gold
        case '木': return '#C8E6C9'; // Light Green
        case '水': return '#B3E5FC'; // Light Blue
        case '火': return '#FFCDD2'; // Light Red
        case '土': return '#F5E6CB'; // Light Brown
        case '杂': return '#E0E0E0'; // Light Grey
        default: return '#f0f0f0';
      }
    }
    getMinorColor(ctx, owner) {
      switch (this.leinoType) {
        case '金': return '#FFD54F'; // Gold
        case '木': return '#81C784'; // Green
        case '水': return '#4FC3F7'; // Blue
        case '火': return '#E57373'; // Red
        case '土': return '#D7CCC8'; // Brown
        case '杂': return '#BDBDBD'; // Grey
        default: return '#cccccc';
      }
    }
    getDecorationColor(ctx, owner) {
      switch (this.leinoType) {
        case '金': return '#FFA000'; // Dark Gold
        case '木': return '#388E3C'; // Dark Green
        case '水': return '#0288D1'; // Dark Blue
        case '火': return '#D32F2F'; // Dark Red
        case '土': return '#8D6E63'; // Dark Brown
        case '杂': return '#757575'; // Dark Grey
        default: return '#aaaaaa';
      }
    }
    getDecorationType(ctx, owner) {
      return "stripe"; // Example, can be customized further
    }
    getCanActivate(ctx, owner) {
      return owner.dantianAura > 0; // Only allow activation if there is enough dantian storage
    }
    activationEffect(ctx, owner) {
      // 产出额外1点灵气
      const activationAmount = owner.activationCount > 0 ? owner.activationCount : 1;
      if(ctx.consumeDantianStorage(owner, activationAmount)) {
        ctx.produceAura(owner, this.leinoType, activationAmount);
        ctx.addLog(owner, `额外产出 ${activationAmount} 点 ${this.leinoType} 灵气。`);
      } else {
        ctx.addLog(owner, `丹田储量不足，无法发动额外产出。`);
      }
    }
  }

  
  // 第一个真正的法术
  export class WanMuJue1 extends CardBase {
    constructor(leinoType, leionQuality) {
        super();
        this.name = '木剑';
        this.subtitle = '青木决';
      }
      cultivationEffect(ctx, owner) {
        if(owner.currentAuraSum() == 0) {
            ctx.produceAura(owner, "mu", 1);
        }
      }
      getPassiveDescription(ctx, owner) {
        return `【运】若没灵气，引1木灵气。`;
      }
      getDmg(ctx, owner) {
        const activationAmount = owner.activationCount > 0 ? owner.activationCount : 1; // If not yet activated, show for 1 activation
        return 7 + 0.3 * (1 + activationAmount) * owner.computedAttack * (3 + owner.currentMu);
      }
      getDescription(ctx, owner) {
        var dmg = this.getDmg(ctx, owner);
        return `【发】消耗所有木灵气，造成${dmg}伤害。`;
      }
      getCardMajorColor(ctx, owner) {
        return "#99FFAA"; // Light green
      }
      getMinorColor(ctx, owner) {
        return '#81C784'; // Green
      }
      getCanActivate(ctx, owner) {
        return owner.currentMu > 0; // Only allow activation if there is enough dantian storage
      }
      activationEffect(ctx, owner) {
        var damage = this.getDmg(ctx, owner);
        ctx.consumeAura(owner, "mu", owner.currentMu);
        const target = owner.isPlayer ? ctx.enemy : ctx.player; // If owner is player, target is enemy and vice versa
        ctx.launchAttackTo(owner, target, damage);
      }
      cultivationEffect(ctx, owner) {
        // 产出灵气
        if(owner.currentAuraSum() == 0) {
            ctx.produceAura(owner, "mu", 1);
        }
      }
  };