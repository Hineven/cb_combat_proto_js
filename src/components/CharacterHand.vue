<template>
  <div class="character-hand-container" :class="[currentFeedbackClass, { 'player-controlled': isPlayerControlled }]" >
    <div class="action-points-display-wrapper">
      <div class="action-points-container">
        <span
          v-for="n in characterMaxAP"
          :key="`ap-${n}`"
          class="ap-dot"
          :class="{ active: n <= characterCurrentAP }"
          :title="n <= characterCurrentAP ? '可用行动点' : '已消耗/不可用行动点'"
        ></span>
      </div>
    </div>

    <div class="cards-row-wrapper">
      <div v-if="!isPlayerControlled && characterCardSlots.length === 0" class="no-cards-enemy">
        <!-- No specific message for enemy with no cards, or a subtle indicator -->
      </div>
      <div class="cards-row">
        <Card
          v-for="(slot, index) in characterCardSlots"
          :key="index" 
          :card="slot.card" 
          :is-first-card="isPlayerControlled && index === 0"
          :activation-count="isPlayerControlled && index === 0 ? characterActivationCount : 0"
          :special-effect="isPlayerControlled && index === 0 ? firstCardSpecialEffect : ''"
          :owner="character"
        />
      </div>
    </div>

    <div v-if="isPlayerControlled" class="player-actions">
      <div class="hints">
        <p>按键提示：J - 运气，K - 发动（可多次发动），L - 结束回合。</p>
      </div>
      <button
        class="end-turn-button"
        :disabled="!canEndTurn"
        @click="$emit('end-turn')"
      >
        结束回合
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue';
import Card from './Card.vue';
import gameContext from '../models/DefaultGameSetup'; // For canEndTurn logic, if needed directly

const props = defineProps({
  character: {
    type: Object,
    required: true
  },
  isPlayerControlled: {
    type: Boolean,
    default: false
  },
  currentFeedbackClass: {
    type: String,
    default: ''
  },
  firstCardSpecialEffect: {
    type: String,
    default: ''
  },
  // canEndTurn is now passed as a prop for player-controlled hand
  canEndTurn: {
      type: Boolean,
      default: false
  }
});

const emit = defineEmits(['end-turn']);

// Update to use cardSlots
const characterCardSlots = computed(() => props.character?.cardSlots || []);
const characterCurrentAP = computed(() => props.character?.currentAP || 0);
const characterMaxAP = computed(() => props.character?.maxAP || 0);
const characterActivationCount = computed(() => props.character?.activationCount || 0);

</script>

<style scoped>
.character-hand-container {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  position: relative;
  width: 100%; /* Ensure it takes full width of its parent in game-control or enemy-hand */
  box-sizing: border-box;
}

.action-points-display-wrapper {
  margin-bottom: 10px; /* Space between AP and cards */
}

.action-points-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.ap-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid #a0a0a0;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}

.ap-dot.active {
  background-color: #4CAF50;
  border-color: #388E3C;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.7), inset 0 1px 2px rgba(0,0,0,0.1);
}

.cards-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  min-height: 190px; /* Ensure a minimum height even if no cards, to prevent layout shifts */
}

.no-cards-enemy {
  min-height: 190px; 
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-style: italic;
}

.player-actions {
  display: flex;
  flex-direction: column; 
  align-items: center; 
  margin-top: 15px;
}

.hints p {
  font-size: 0.8em;
  color: #666;
  margin: 0 0 8px 0; 
  text-align: center;
}

.end-turn-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.end-turn-button:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.end-turn-button:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

.feedback-cultivate {
  animation: hand-shake 0.2s ease-in-out;
}
.feedback-activate {
  animation: hand-pulse 0.2s ease-in-out;
}

@keyframes hand-shake {
  0%, 100% { transform: scale(1); }
  25% { transform: translateX(-3px) scale(1.01); }
  75% { transform: translateX(3px) scale(1.01); }
}

@keyframes hand-pulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  50% { box-shadow: 0 4px 16px rgba(128,128,128,0.6); }
}
</style>