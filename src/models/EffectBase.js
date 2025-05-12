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