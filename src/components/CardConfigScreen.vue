<template>
  <div class="card-config-screen">
    <h2>卡牌配置</h2>
    <div class="config-layout">
      <div class="slot-editors-panel">
        <h3>你的卡槽</h3>
        <div class="slot-editors-container">
          <CardSlotEditor
            v-for="(slot, index) in playerCardSlots"
            :key="index"
            :card-slot="slot"
            :is-selected="index === selectedSlotIndex"
            :preview-owner="playerState"
            @select-slot="handleSlotSelected(index)"
          />
        </div>
      </div>
      <div class="card-selector-panel">
        <CardSlotSelector
          :available-cards="cardLibraryEntries"
          :preview-owner="playerState"
          @card-chosen="handleCardChosen"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CardSlotEditor from './CardSlotEditor.vue';
import CardSlotSelector from './CardSlotSelector.vue';
import gameContext from '../models/DefaultGameSetup.js';
// Import CardSlot if direct instantiation or type checking is needed, otherwise not strictly necessary here
// import { CardSlot } from '../models/CardBase.js'; 

// Import availableCards and allCardBlueprints from CardLibrary
import { availableCards as cardLibraryEntries, allCardBlueprints } from '../models/CardLibrary.js';

const playerState = ref(gameContext.player);
const playerCardSlots = computed(() => playerState.value.cardSlots);

const selectedSlotIndex = ref(null); // Index of the currently selected CardSlotEditor

const handleSlotSelected = (index) => {
  selectedSlotIndex.value = index;
};

const handleCardChosen = (chosenCard) => {
  if (selectedSlotIndex.value !== null && playerCardSlots.value[selectedSlotIndex.value]) {
    const selectedSlot = playerCardSlots.value[selectedSlotIndex.value];
    
    // 找到对应的卡牌蓝图
    const cardIndex = cardLibraryEntries.indexOf(chosenCard);
    const blueprint = allCardBlueprints[cardIndex];
    
    if (!blueprint || typeof blueprint.constructor !== 'function') {
      console.error('找不到对应的卡牌蓝图:', chosenCard);
      return;
    }

    // 使用蓝图创建一个新的卡牌实例
    const newCardInstance = new blueprint.constructor(...blueprint.args);

    // 使用当前游戏上下文和玩家状态初始化新卡牌
    if (typeof newCardInstance.init === 'function') {
      newCardInstance.init(gameContext, playerState.value);
    } else {
      console.warn(`新创建的卡牌 ${newCardInstance.name} 没有 init 方法。`);
    }

    selectedSlot.setCard(newCardInstance);
    
    // console.log(`卡牌 ${newCardInstance.name} 已放入槽位 ${selectedSlotIndex.value}。`);
    // 可选，放置卡牌后取消选择
    // selectedSlotIndex.value = null;
  } else {
    // console.log("没有选中槽位，或槽位索引无效。");
  }
};

</script>

<style scoped>
.card-config-screen {
  padding: 20px;
  color: white;
  height: 100%;
  overflow-y: auto;
}

.card-config-screen h2, .card-config-screen h3 {
  text-align: center;
  color: #e0e0e0;
}

.config-layout {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
  height: calc(100% - 80px); /* Adjust based on heading heights */
}

.slot-editors-panel {
  flex: 2; /* Takes more space */
  padding: 15px;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.slot-editors-container {
  display: flex;
  flex-wrap: wrap; /* Allow editors to wrap */
  gap: 15px;
  justify-content: center; /* Center the editors */
  margin-top: 10px;
}

.card-selector-panel {
  flex: 1; /* Takes less space */
  /* Styling for CardSlotSelector is handled within its own component */
  /* max-height: 100%; Ensure it can use available height */
}
</style>
