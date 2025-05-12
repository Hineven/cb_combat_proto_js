<template>
  <div class="main-screen">
    <div class="battle-interface-container" v-if="currentView === 'battle'">
      <BattleScreen
        :playerState="playerState"
        :enemyState="enemyState"
        :gameLogs="gameLogs"
        :isPlayerTurn="isPlayerTurn"
        :canEndTurn="canEndTurn"
        :playerFeedbackClass="playerFeedbackClass"
        :playerFirstCardSpecialEffect="playerFirstCardSpecialEffect"
        :enemyFeedbackClass="enemyFeedbackClass"
        :enemyFirstCardSpecialEffect="enemyFirstCardSpecialEffect"
        @end-turn="handleEndTurn"
      />
    </div>
    <div class="card-config-container" v-else-if="currentView === 'cardConfig'">
      <CardConfigScreen />
    </div>

    <div class="menu-sidebar">
      <button @click="navigateTo('battle')" :class="{ active: currentView === 'battle' }">战斗</button>
      <button @click="navigateTo('cardConfig')" :class="{ active: currentView === 'cardConfig' }">卡牌配置</button>
      <!-- Menu content will go here -->
    </div>
  </div>
</template>

<script setup>
import CharacterStatus from './CharacterStatus.vue';
import CharacterHand from './CharacterHand.vue';
import GameLog from './GameLog.vue';
import BattleScreen from './BattleScreen.vue'; // 新增
import CardConfigScreen from './CardConfigScreen.vue'; // 新增
import gameContext from '../models/DefaultGameSetup';
import { ref, onMounted, onUnmounted, computed } from 'vue';

const playerState = ref(gameContext.player);
const enemyState = ref(gameContext.enemy);
const gameLogs = ref(gameContext.logs);
const isPlayerTurn = ref(gameContext.canPlayerAct());
const canEndTurn = ref(false);

const currentView = ref('battle'); // 新增，控制当前显示的页面

// Feedback related refs for player and enemy
const playerFeedbackClass = ref('');
const playerFirstCardSpecialEffect = ref('');
const enemyFeedbackClass = ref(''); // For enemy animations
const enemyFirstCardSpecialEffect = ref(''); // For enemy card specific animations

let playerFeedbackTimeoutId = null;
let enemyFeedbackTimeoutId = null; // Separate timeout for enemy

const navigateTo = (viewName) => {
  currentView.value = viewName;
};

const updateGameStatus = () => {
  playerState.value = { ...gameContext.player }; // Shallow clone to ensure reactivity for the object itself
  enemyState.value = { ...gameContext.enemy };   // Shallow clone for enemy
  gameLogs.value = [...gameContext.logs];
  isPlayerTurn.value = gameContext.canPlayerAct();
  canEndTurn.value = isPlayerTurn.value && gameContext.player.currentAP <= 0;
};

const applyFeedback = (target, feedbackClass, cardEffect) => {
  if (target === 'player') {
    if (!isPlayerTurn.value && feedbackClass !== 'feedback-end-turn') return; // Allow end turn feedback even if turn ends
    if (playerFeedbackTimeoutId) clearTimeout(playerFeedbackTimeoutId);
    playerFeedbackClass.value = feedbackClass;
    // 使用 cardSlots 替代 cards
    if (playerState.value.cardSlots && playerState.value.cardSlots.length > 0) {
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
    // 使用 cardSlots 替代 cards
    if (enemyState.value.cardSlots && enemyState.value.cardSlots.length > 0) { // Assuming enemy cards might have special effects too
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
    applyFeedback('player', 'feedback-end-turn', '');
    gameContext.playerEndTurn();
  }
};

const handleKeyDown = (e) => {
  if (currentView.value !== 'battle') return; // 只在战斗视图中处理游戏快捷键
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
  if (currentView.value === 'battle' && !gameContext.isBattleOver) {
    gameContext.startNewBattle();
  }
  // Removed requestAnimationFrame(updateGameStatus) from here.
  // updateGameStatus will be called by an event or a watcher if needed, or BattleScreen handles its own RAF.
  // A simpler approach for now:
  const gameUpdateInterval = setInterval(() => {
    if (currentView.value === 'battle') {
        playerState.value = { ...gameContext.player };
        enemyState.value = { ...gameContext.enemy };
        gameLogs.value = [...gameContext.logs];
        isPlayerTurn.value = gameContext.canPlayerAct();
        canEndTurn.value = isPlayerTurn.value && gameContext.player.currentAP <= 0;
        if (gameContext.isBattleOver) {
            clearInterval(gameUpdateInterval); // Stop updates if battle is over
        }
    }
  }, 100); // Update game status periodically, e.g., every 100ms

  window.addEventListener('keydown', handleKeyDown);
  // Clean up interval on unmount
  onUnmounted(() => {
    clearInterval(gameUpdateInterval);
    window.removeEventListener('keydown', handleKeyDown);
    if (playerFeedbackTimeoutId) clearTimeout(playerFeedbackTimeoutId);
    if (enemyFeedbackTimeoutId) clearTimeout(enemyFeedbackTimeoutId);
  });
});

// onUnmounted is handled within onMounted for the interval cleanup

</script>

<style scoped>
.main-screen {
  display: flex;
  flex-direction: row;
  height: 100vh; /* Ensure it takes the full viewport height */
  width: 100%;
  align-items: stretch; /* MODIFIED */
  font-family: Arial, sans-serif;
  position: relative;
  background-image: url('/bg_clouds.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-sizing: border-box;
}

.battle-interface-container, .card-config-container {
  display: flex;
  flex: 1; /* Fill remaining space */
  flex-direction: column;
  height:100%;
  flex-grow: 1; /* ADDED */
  width: 0; /* ADDED */
  min-width: 70%; /* ADDED */
  /* margin: auto; */ /* OLD - main-screen handles alignment now */
  gap: 20px; 
  background-color: rgba(0, 0, 0, 0.05); 
  border-radius: 10px;
  box-sizing: border-box;
  padding: 10px; /* Added padding for consistency */
}

.card-config-container {
  /* Specific styles for card config container if needed */
  align-items: center; /* Example */
  justify-content: center; /* Example */
}

.enemy-hand-wrapper {
  width: 100%; 
  box-sizing: border-box;
}

.game-panels-container { 
  display: flex;
  flex: 1; /* Fill remaining space */
  justify-content: space-between;
  width: 100%;
  padding: 0; 
  gap: 15px;
  box-sizing: border-box;
  overflow: hidden; /* Prevent content from overflowing */
}

.side-panel {
  width: 25%; /* MODIFIED from 22% */
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.center-panel {
  display: flex;
  flex: 1; /* Allow center panel to grow */
  flex-direction: column;
  width: 50%; /* MODIFIED from 36% */
  min-width: 250px;
  overflow: hidden; /* Ensure GameLog does not push content */
}

.menu-sidebar {
  width: 20%; /* MODIFIED from 15% of game-panels-container */
  min-width: 200px; /* MODIFIED */
  max-width: 300px; /* ADDED */
  background-color: rgba(0, 0, 0, 0.2); /* Darker for better contrast */
  padding: 20px; /* Increased padding */
  box-sizing: border-box;
  border-radius: 8px;
  display: flex; /* For button layout */
  flex-direction: column; /* Stack buttons vertically */
  gap: 10px; /* Space between buttons */
}

.menu-sidebar button {
  padding: 10px 15px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.3s, border-color 0.3s;
}

.menu-sidebar button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.menu-sidebar button.active {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.7);
  font-weight: bold;
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