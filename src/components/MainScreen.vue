<template>
  <div class="main-screen">
    <PlayerStatus />
    <GameLog :logs="gameLogs" />
    
    <div class="game-control-container">
      <ActionPointsDisplay />
      <div 
        class="hand-cards-container"
        :class="[
          handCardsContainerFeedbackClass,
          { 'disabled-controls': !isPlayerTurn }
        ]"
      >
        <div v-if="!isPlayerTurn" class="turn-indicator">敌方回合</div>
        <div class="cards-row">
          <Card 
            v-for="(card, index) in playerCards" 
            :key="index"
            :card="card"
            :is-first-card="index === 0"
            :activation-count="index === 0 ? playerActivationCountForFirstCard : 0"
            :special-effect="index === 0 ? firstCardSpecialEffect : ''"
          />
        </div>
        <div class="action-buttons">
          <div class="hints">
            <p>按键提示：J - 运气，K - 发动（可多次发动），L - 结束回合。</p>
          </div>
          <button 
            class="end-turn-button" 
            :disabled="!canEndTurn" 
            @click="handleEndTurn"
          >
            结束回合
          </button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import PlayerStatus from './PlayerStatus.vue'
import ActionPointsDisplay from './ActionPointsDisplay.vue'; // 导入新的行动点组件
import Card from './Card.vue'
import GameLog from './GameLog.vue' // Import the new component
import gameContext from '../models/DefaultGameSetup'
import { ref, onMounted, onUnmounted } from 'vue'

// 转换为响应式数据
const playerCards = ref([...gameContext.player.cards])
const playerActivationCountForFirstCard = ref(0)
const handCardsContainerFeedbackClass = ref('')
const firstCardSpecialEffect = ref('') // '', 'cultivating', 'activating'
let feedbackTimeoutId = null
const gameLogs = ref(gameContext.logs) // Add a ref for game logs

// 检查是否是玩家回合
const isPlayerTurn = ref(gameContext.canPlayerAct())
// 是否可以结束回合（只有当行动力为0且是玩家回合时才可以）
const canEndTurn = ref(false)

// 帧循环更新卡牌数据和激活次数
const updateGameStatus = () => {
  playerCards.value = [...gameContext.player.cards]
  if (gameContext.player.cards.length > 0) {
    playerActivationCountForFirstCard.value = gameContext.player.activationCount
  } else {
    playerActivationCountForFirstCard.value = 0
  }
  gameLogs.value = [...gameContext.logs] // Update logs in the game loop
  
  // 更新玩家回合状态
  isPlayerTurn.value = gameContext.canPlayerAct()
  // 直接计算是否可以结束回合，确保每帧都更新
  canEndTurn.value = isPlayerTurn.value && gameContext.player.currentAP <= 0
  
  requestAnimationFrame(updateGameStatus)
}

// 启动帧循环
onMounted(() => {
  updateGameStatus() // Renamed from updateCards
  window.addEventListener('keydown', handleKeyDown)
})

const applyFeedback = (containerClass, cardEffect) => {
  // 如果不是玩家回合，不应用视觉反馈
  if (!isPlayerTurn.value) return;
  
  if (feedbackTimeoutId) clearTimeout(feedbackTimeoutId)

  handCardsContainerFeedbackClass.value = containerClass
  if (playerCards.value.length > 0) {
    firstCardSpecialEffect.value = cardEffect
  }

  feedbackTimeoutId = setTimeout(() => {
    handCardsContainerFeedbackClass.value = ''
    firstCardSpecialEffect.value = ''
    feedbackTimeoutId = null
  }, 500) // Duration of feedback, adjust as needed
}

// 处理结束回合按钮点击
const handleEndTurn = () => {
  if (canEndTurn.value) {
    applyFeedback('feedback-end-turn', '');
    gameContext.playerEndTurn();
  }
}

// 键盘事件处理
const handleKeyDown = (e) => {
  // 如果不是玩家回合，忽略键盘输入
  if (!isPlayerTurn.value) return;
  
  if (e.key === 'j') {
    applyFeedback('feedback-cultivate', 'cultivating')
    gameContext.playerCultivation()
  } else if (e.key === 'k') {
    applyFeedback('feedback-activate', 'activating')
    gameContext.playerActivation()
  } else if (e.key === 'l' && canEndTurn.value) {
    // 添加"l"键结束回合的快捷键
    handleEndTurn();
  }
}

// 添加/移除键盘事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (feedbackTimeoutId) clearTimeout(feedbackTimeoutId)
})
</script>

<style scoped>
.main-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Changed from space-between */
  font-family: Arial, sans-serif;
  position: relative;
  /* padding-top: 80px; Remove this, PlayerStatus is now part of the normal flow */
}

.hand-cards-container {
  display: flex;
  flex-direction: column; /* Changed to column to contain the cards-row */
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; /* For smooth animations */
  position: relative; /* For absolute positioning of turn indicator */
}

/* 添加禁用时的样式 */
.disabled-controls {
  opacity: 0.7;
  filter: grayscale(30%);
  pointer-events: none;
}

/* 回合指示器样式 */
.turn-indicator {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff4d4d;
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
  z-index: 10;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 15px;
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

.feedback-end-turn {
  animation: end-turn-feedback 0.5s ease-in-out;
}

@keyframes end-turn-feedback {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); box-shadow: 0 4px 16px rgba(76, 175, 80, 0.6); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); }
  100% { transform: translateX(-50%) scale(1); }
}

.cards-row {
  display: flex;
  flex-direction: row; /* Ensures cards are in a row */
  gap: 10px; /* Space between cards */
  justify-content: center; /* Centers cards horizontally */
}

.game-control-container {
  position: fixed;
  bottom: 20px; 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column; /* Stack AP and cards vertically */
  align-items: center; /* Center align */
  justify-content: center; /* Center vertically */
  width: 100%; /* Full width */
}

.feedback-cultivate {
  animation: hand-shake 0.2s ease-in-out;
}
.feedback-activate {
  animation: hand-pulse 0.2s ease-in-out;
}

@keyframes hand-shake {
  0%, 100% { transform: translateX(-10px) scale(1); }
  25% { transform: translateX(-10px) translateX(-3px) scale(1.01); }
  75% { transform: translateX(-10px) translateX(3px) scale(1.01); }
}

@keyframes hand-pulse {
  0%, 100% { transform: translateX(-10px) ; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  50% { transform: translateX(-10px) ; box-shadow: 0 4px 16px rgba(66,185,131,0.6); } /* Vue green color pulse */
}

h1 {
  color: #42b983;
}
p {
  font-size: 1.2em;
}

.hints p {
  font-size: 0.8em;
  color: #666;
  margin: 0;
}
</style>