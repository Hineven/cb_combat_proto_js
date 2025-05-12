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

// Import availableCards (which are {instance, blueprint} objects) and cardBlueprints from CardLibrary
import { availableCards as cardLibraryEntries } from '../models/CardLibrary.js';

const playerState = ref(gameContext.player);
const playerCardSlots = computed(() => playerState.value.cardSlots);

const selectedSlotIndex = ref(null); // Index of the currently selected CardSlotEditor

const handleSlotSelected = (index) => {
  selectedSlotIndex.value = index;
};

const handleCardChosen = (chosenLibraryEntry) => {
  if (selectedSlotIndex.value !== null && playerCardSlots.value[selectedSlotIndex.value]) {
    const selectedSlot = playerCardSlots.value[selectedSlotIndex.value];
    const blueprintToInstantiate = chosenLibraryEntry.blueprint;

    if (!blueprintToInstantiate || typeof blueprintToInstantiate.constructor !== 'function') {
      console.error('Invalid card blueprint received:', blueprintToInstantiate);
      return;
    }

    // Create a new instance of the card using its blueprint constructor and args
    const newCardInstance = new blueprintToInstantiate.constructor(...blueprintToInstantiate.args);

    // Initialize the new card instance with the actual player and current game context
    if (typeof newCardInstance.init === 'function') {
      newCardInstance.init(gameContext, playerState.value);
    } else {
      console.warn(`Newly instantiated card ${blueprintToInstantiate.name} does not have an init method.`);
    }

    selectedSlot.setCard(newCardInstance);
    
    // console.log(`Card ${newCardInstance.name} placed into slot ${selectedSlotIndex.value}.`);
    // Optionally, deselect the slot after placing a card
    // selectedSlotIndex.value = null;
  } else {
    // console.log("No slot selected, or slot index is invalid, or chosen card data is missing blueprint.");
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
