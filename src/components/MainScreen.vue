<template>
  <div class="main-screen">
    <div class="battle-interface-container">
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
        <!-- menu-sidebar was here -->
      </div>

      <div class="player-controls-wrapper">
        <div v-if="!isPlayerTurn" class="turn-indicator">敌方回合</div>
        <CharacterHand
          :character="playerState"
          :is-player-controlled="true"
          :current-feedback-class="playerFeedbackClass"
          :first-card-special-effect="playerFirstCardSpecialEffect"
          :can-end-turn="canEndTurn"
          @end-turn="handleEndTurn"
        />
      </div>
    </div>
    <div class="menu-sidebar">
      <!-- Menu content will go here -->
    </div>
  </div>
</template>

<script setup>
import CharacterStatus from './CharacterStatus.vue';
import CharacterHand from './CharacterHand.vue'; // Import the new component
import GameLog from './GameLog.vue';
import gameContext from '../models/DefaultGameSetup';
import { ref, onMounted, onUnmounted, computed } from 'vue';

const playerState = ref(gameContext.player);
const enemyState = ref(gameContext.enemy);
const gameLogs = ref(gameContext.logs);
const isPlayerTurn = ref(gameContext.canPlayerAct());
const canEndTurn = ref(false);

// Feedback related refs for player and enemy
const playerFeedbackClass = ref('');
const playerFirstCardSpecialEffect = ref('');
const enemyFeedbackClass = ref(''); // For enemy animations
const enemyFirstCardSpecialEffect = ref(''); // For enemy card specific animations

let playerFeedbackTimeoutId = null;
let enemyFeedbackTimeoutId = null; // Separate timeout for enemy

const updateGameStatus = () => {
  playerState.value = { ...gameContext.player }; // Shallow clone to ensure reactivity for the object itself
  enemyState.value = { ...gameContext.enemy };   // Shallow clone for enemy
  gameLogs.value = [...gameContext.logs];
  isPlayerTurn.value = gameContext.canPlayerAct();
  canEndTurn.value = isPlayerTurn.value && gameContext.player.currentAP <= 0;
  
  // Potentially trigger enemy animation based on game state changes
  // This is a placeholder for where you might decide to show enemy feedback
  // For example, if an enemy effect activates or they play a card (if that becomes visible)
  // if (gameContext.enemy.justPerformedAction) { 
  //   applyEnemyFeedback('feedback-activate', 'activating');
  //   gameContext.enemy.justPerformedAction = false; // Reset flag
  // }

  requestAnimationFrame(updateGameStatus);
};

const applyFeedback = (target, feedbackClass, cardEffect) => {
  if (target === 'player') {
    if (!isPlayerTurn.value && feedbackClass !== 'feedback-end-turn') return; // Allow end turn feedback even if turn ends
    if (playerFeedbackTimeoutId) clearTimeout(playerFeedbackTimeoutId);
    playerFeedbackClass.value = feedbackClass;
    if (playerState.value.cards.length > 0) {
      playerFirstCardSpecialEffect.value = cardEffect;
    }
    playerFeedbackTimeoutId = setTimeout(() => {
      playerFeedbackClass.value = ''
      playerFirstCardSpecialEffect.value = ''
      playerFeedbackTimeoutId = null
    }, 500);
  } else if (target === 'enemy') {
    // Logic for applying feedback to enemy
    if (enemyFeedbackTimeoutId) clearTimeout(enemyFeedbackTimeoutId);
    enemyFeedbackClass.value = feedbackClass;
    if (enemyState.value.cards.length > 0) { // Assuming enemy cards might have special effects too
        enemyFirstCardSpecialEffect.value = cardEffect;
    }
    enemyFeedbackTimeoutId = setTimeout(() => {
      enemyFeedbackClass.value = ''
      enemyFirstCardSpecialEffect.value = ''
      enemyFeedbackTimeoutId = null
    }, 500);
  }
};

const handleEndTurn = () => {
  if (canEndTurn.value) {
    applyFeedback('player', 'feedback-end-turn', ''); // Pass 'player' as target
    gameContext.playerEndTurn();
  }
};

const handleKeyDown = (e) => {
  if (!isPlayerTurn.value) return;
  if (e.key === 'j') {
    applyFeedback('player', 'feedback-cultivate', 'cultivating');
    gameContext.playerCultivation();
  } else if (e.key === 'k') {
    applyFeedback('player', 'feedback-activate', 'activating');
    gameContext.playerActivation();
  } else if (e.key === 'l' && canEndTurn.value) {
    handleEndTurn();
  }
};

onMounted(() => {
  if (!gameContext.isBattleOver) {
    gameContext.startNewBattle();
  }
  updateGameStatus();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (playerFeedbackTimeoutId) clearTimeout(playerFeedbackTimeoutId);
  if (enemyFeedbackTimeoutId) clearTimeout(enemyFeedbackTimeoutId); // Clear enemy timeout too
});

</script>

<style scoped>
.main-screen {
  display: flex; /* MODIFIED */
  flex-direction: row; /* MODIFIED */
  align-items: stretch; /* MODIFIED */
  font-family: Arial, sans-serif;
  position: relative;
  background-image: url('/bg_clouds.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  padding: 20px; /* MODIFIED */
  gap: 20px; /* ADDED */
}

.battle-interface-container {
  display: flex;
  flex-direction: column;
  /* width: 95%; */ /* OLD */
  flex-grow: 1; /* ADDED */
  width: 0; /* ADDED */
  min-width: 70%; /* ADDED */
  max-width: 1500px; 
  /* margin: auto; */ /* OLD - main-screen handles alignment now */
  gap: 20px; 
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.05); 
  border-radius: 10px;
  box-sizing: border-box;
}

.enemy-hand-wrapper {
  width: 100%; 
  box-sizing: border-box;
}

.game-panels-container { 
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0; 
  gap: 15px;
  box-sizing: border-box;
}

.side-panel {
  width: 25%; /* MODIFIED from 22% */
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-panel {
  width: 50%; /* MODIFIED from 36% */
  min-width: 250px;
  display: flex;
  flex-direction: column;
}

.menu-sidebar {
  width: 20%; /* MODIFIED from 15% of game-panels-container */
  min-width: 200px; /* MODIFIED */
  max-width: 300px; /* ADDED */
  background-color: rgba(0, 0, 0, 0.1);
  padding: 10px;
  box-sizing: border-box;
  border-radius: 8px;
  /* height will be stretched by main-screen's align-items: stretch */
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