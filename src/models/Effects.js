import { CardBase, Effect, EffectType } from './Game.js';


// 具体的效果类，继承自效果类，定义了具体的效果类型和行为


  export class TemporaryDefenceEffect extends Effect {
    constructor(rounds, amount) {
      super();
      this.name = '临时防御';
      this.name_tag = '防';
      this.color = '#6495ED'; // Cornflower Blue
      this.rounds = rounds; // 持续回合数
      this.amount = amount; // 防御力增加值
      // this.description = `在 ${this.rounds} 回合内，增加 ${this.amount.toFixed(0)} 防御力。`; // Set in getDescription for dynamic round count
    }
    onApply(ctx, target) {
      ctx.getDefence(target, this.amount);
      // 注册一个钩子函数，在回合结束时减少rounds数
      const hook = () => {
        this.rounds--;
        if (this.rounds <= 0) {
          ctx.removeEffect(target, this);
        }
      };
      const hooks = ctx.endPhaseHooks.get(target) || [];
      hooks.push(hook);
      ctx.endPhaseHooks.set(target, hooks);
    }
    onRemove(ctx, target) {
      ctx.getDefence(target, -this.amount);
    }
    getDescription(ctx) {
      return `在 ${this.rounds} 回合内，增加 ${this.amount.toFixed(0)} 防御力。`;
    }
  }
  
// 硬撑，下回合减伤50%，下下回合增伤50%
export class YingChengAfterEffect extends Effect {
    constructor() {
        super();
        this.name = '硬撑';
        this.name_tag = '撑';
        this.color = '#FF6347'; // Tomato
        this.type = EffectType.Debuff;
        this.rounds = 2; // 持续回合数
        this.hook_increase = (atk_ctx) => {
            atk_ctx.currentDamage = Math.floor(atk_ctx.currentDamage * 1.5);
        }
    }
    onApply(ctx, target) {
        // 注册钩子函数
      const hook_rounds = () => {
        this.rounds--;
        if (this.rounds <= 0) {
          ctx.removeEffect(target, this);
        }
      };
        const hooks = ctx.endPhaseHooks.get(target) || [];
        hooks.push(hook_rounds);
        ctx.endPhaseHooks.set(target, hooks);
        ctx.onAttackHooks.push(this.hook_increase);
    }
    onRemove(ctx, target) {
        ctx.onAttackHooks = ctx.onAttackHooks.filter(hook => hook !== this.hook_increase);
    }
    getDescription(ctx) {
        return `受到伤害增加50%`;
    }
}

export class YingChengEffect extends Effect {
    constructor() {
        super();
        this.name = '硬撑';
        this.name_tag = '撑';
        this.color = '#FF6347'; // Tomato
        this.rounds = 2; // 持续回合数
        this.hook_decrease = (atk_ctx) => {
            atk_ctx.currentDamage = Math.floor(atk_ctx.currentDamage * 0.5);
        }
    }
    getDescription(ctx) {
        return `减伤50%，下${this.rounds == 1 ? '' : '下' }回合受伤害增伤50%`;
    }
    onApply(ctx, target) {
        // 注册钩子函数
      const hook_rounds = () => {
        this.rounds--;
        if (this.rounds <= 0) {
          ctx.removeEffect(target, this);
        }
      };
        const hooks = ctx.endPhaseHooks.get(target) || [];
        hooks.push(hook_rounds);
        ctx.endPhaseHooks.set(target, hooks);
        ctx.onAttackHooks.push(this.hook_decrease);
    }
    onRemove(ctx, target) {
        ctx.onAttackHooks = ctx.onAttackHooks.filter(hook => hook !== this.hook_decrease);
        ctx.addEffect(target, new YingChengAfterEffect(), this.owner);
    }
}
