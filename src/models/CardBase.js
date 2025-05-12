// 卡牌基类，定义了卡牌的基本属性和行为
export class CardBase {
    constructor() {
      this.name = '未命名卡牌'; // 卡牌名称
      this.subtitle = ''; // 卡牌副标题
      this.description = ''; // 卡牌描述
      this.cultivationAPCost = 1; // 运气消耗的行动点
      this.activationAPCost = 1; // 发动消耗的行动点
      this.maxPendingActivation = 3; // 最大挂起发动次数
    }

    init(ctx, owner) {
      this.ctx = ctx;
      this.owner = owner;
    }

    // 运气效果，当玩家对卡牌运气时触发
    cultivationEffect(ctx, owner) {
      // 默认运气效果：无
    }
  
    // 发动效果，当玩家对卡牌发动时触发
    activationEffect(ctx, owner) {
      // 默认发动效果：无
    }
  
    // 获取卡牌的描述，可以根据上下文动态生成
    getDescription(ctx, owner) {
      return this.description || '此卡牌没有详细描述。';
    }
  
    // 获取卡牌是否可以发动
    getCanActivate(ctx, owner) {
      return true; // 默认可以发动
    }
  
    // 获取卡牌的主颜色
    getCardMajorColor(ctx, owner) {
      return '#f0f0f0'; // Default light grey
    }
  
    // 获取卡牌的次颜色（例如边框）
    getMinorColor(ctx, owner) {
      return '#cccccc'; // Default grey
    }
  
    // 获取卡牌的装饰颜色
    getDecorationColor(ctx, owner) {
      return '#aaaaaa'; // Default dark grey
    }
  
    // 获取卡牌的装饰类型 (e.g., 'stripe', 'corner', 'none')
    getDecorationType(ctx, owner) {
      return 'none';
    }
    // 获取被动描述
    getPassiveDescription(ctx, owner) {
        return '';
    }
  }