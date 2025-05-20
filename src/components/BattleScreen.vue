<template>
  <div class="battle-screen-content">
    <div class="enemy-hand-wrapper">
      <CharacterHand
        :character="enemyState"
        :is-player-controlled="false"
        :current-feedback-class="enemyFeedbackClass"
        :first-card-special-effect="enemyFirstCardSpecialEffect"
      />
    </div>

    <div class="game-panels-container">
      <div class="side-panel player-panel">
        <CharacterStatus :character="playerState" title="玩家" />
      </div>
      <div class="center-panel">
        <GameLog :logs="gameLogs" />
      </div>
      <div class="side-panel enemy-panel">
        <CharacterStatus :character="enemyState" title="敌人" />
      </div>
    </div>

    <div class="player-controls-wrapper">
      <div v-if="!isPlayerTurn" class="turn-indicator">敌方回合</div>
      <CharacterHand
        :character="playerState"
        :is-player-controlled="true"
        :current-feedback-class="playerFeedbackClass"
        :first-card-special-effect="playerFirstCardSpecialEffect"
        :can-end-turn="canEndTurn"
        @end-turn="$emit('end-turn')"
        @activate-card="$emit('activate-card', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import CharacterStatus from './CharacterStatus.vue';
import CharacterHand from './CharacterHand.vue';
import GameLog from './GameLog.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  playerState: Object,
  enemyState: Object,
  gameLogs: Array,
  isPlayerTurn: Boolean,
  canEndTurn: Boolean,
  playerFeedbackClass: String,
  playerFirstCardSpecialEffect: String,
  enemyFeedbackClass: String,
  enemyFirstCardSpecialEffect: String,
});

const emit = defineEmits(['end-turn', 'activate-card']); // Ensure 'activate-card' is emitted
</script>

<style scoped>
.battle-screen-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px; /* Matches gap from old battle-interface-container */
  /* Styles from battle-interface-container that are relevant to its content arrangement */
}

.enemy-hand-wrapper {
  width: 100%;
  box-sizing: border-box;
}

.game-panels-container {
  display: flex;
  flex: 1;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  gap: 15px;
  box-sizing: border-box;
  overflow: hidden;
}

.side-panel {
  width: 25%;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 50%;
  min-width: 250px;
  overflow: hidden;
}

.player-controls-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.turn-indicator {
  background-color: #ff4d4d;
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
  margin-bottom: 10px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
