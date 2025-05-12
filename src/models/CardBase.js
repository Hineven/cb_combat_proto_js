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

export class EmptyCard extends CardBase {
  constructor() {
    super();
    this.name = '空'; // 代表空卡槽
    this.description = '此卡槽为空，没有任何效果。';
    this.cultivationAPCost = 1; // 即使为空，运气也可能消耗AP
    this.activationAPCost = 1;  // 发动也可能消耗AP（但不会成功）
  }

  cultivationEffect(ctx, owner) {
    // 无效果
    // ctx.addLog(owner, `${this.name}运气，无事发生。`); // 可选：记录空操作日志
  }

  activationEffect(ctx, owner) {
    // 无效果
  }

  getCanActivate(ctx, owner) {
    return false; // 空卡槽不能被发动
  }

  getDescription(ctx, owner) {
    return this.description;
  }

  getCardMajorColor(ctx, owner) {
    return '#808080'; // 空卡槽显示为灰色
  }

  getMinorColor(ctx, owner) {
    return '#A9A9A9';
  }
}

export class CardSlot {
  constructor(cardInstance = null) {
    this.card = cardInstance || new EmptyCard();
  }

  setCard(newCard) {
    if (newCard instanceof CardBase) {
      this.card = newCard;
    } else {
      // console.error("传递给 CardSlot.setCard 的卡牌类型无效");
      this.card = new EmptyCard(); // 回退到空卡牌
    }
  }

  removeCard() {
    this.card = new EmptyCard();
  }

  isEmpty() {
    return this.card instanceof EmptyCard;
  }

  // 将方法调用委托给包含的卡牌
  getName(ctx, owner) {
    return this.card.name;
  }
  
  getSubtitle(ctx, owner) {
    return this.card.subtitle;
  }

  getDescription(ctx, owner) {
    return this.card.getDescription(ctx, owner);
  }

  getCultivationAPCost(ctx, owner) {
    return this.card.cultivationAPCost;
  }

  getActivationAPCost(ctx, owner) {
    return this.card.activationAPCost;
  }
  
  getMaxPendingActivation(ctx, owner) {
    return this.card.maxPendingActivation;
  }

  cultivationEffect(ctx, owner) {
    this.card.cultivationEffect(ctx, owner);
  }

  activationEffect(ctx, owner) {
    this.card.activationEffect(ctx, owner);
  }

  getCanActivate(ctx, owner) {
    return this.card.getCanActivate(ctx, owner);
  }

  getCardMajorColor(ctx, owner) {
    return this.card.getCardMajorColor(ctx, owner);
  }

  getMinorColor(ctx, owner) {
    return this.card.getMinorColor(ctx, owner);
  }

  getDecorationColor(ctx, owner) {
    return this.card.getDecorationColor(ctx, owner);
  }

  getDecorationType(ctx, owner) {
    return this.card.getDecorationType(ctx, owner);
  }
  
  getPassiveDescription(ctx, owner) {
    return this.card.getPassiveDescription(ctx, owner);
  }

  init(ctx, owner) {
    this.card.init(ctx, owner);
  }
}