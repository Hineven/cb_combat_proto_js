<template>
  <div class="action-points-container">
    <span 
      v-for="n in maxAP" 
      :key="n" 
      class="ap-dot"
      :class="{ 'active': n <= currentAP }"
      :title="n <= currentAP ? '可用行动点' : '已消耗/不可用行动点'"
    ></span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import gameContext from '../models/DefaultGameSetup';

const currentAP = ref(0);
const maxAP = ref(0);
let animationFrameId = null;

const updateAPValues = () => {
  if (gameContext.player) {
    // Ensure values are numbers, defaulting to 0 if not.
    const playerCurrentAP = Number(gameContext.player.currentAP) || 0;
    const playerMaxAP = Number(gameContext.player.maxAP) || 0;

    if (currentAP.value !== playerCurrentAP) {
      currentAP.value = playerCurrentAP;
    }
    if (maxAP.value !== playerMaxAP) {
      maxAP.value = playerMaxAP;
    }
  }
  animationFrameId = requestAnimationFrame(updateAPValues);
};

onMounted(() => {
  if (gameContext.player) {
    currentAP.value = Number(gameContext.player.currentAP) || 0;
    maxAP.value = Number(gameContext.player.maxAP) || 0;
  }
  updateAPValues();
});

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.action-points-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0; /* 上下留一点间距 */
  gap: 6px; /* 圆点之间的间距 */
  position: relative; /* 默认相对定位，父组件可调整 */
  margin-bottom: 8px; /* 与下方内容的间距 */
}

.ap-dot {
  width: 18px; /* 圆点大小 */
  height: 18px; /* 圆点大小 */
  border-radius: 50%; /* 使其成为圆形 */
  background-color: #ccc; /* 未激活状态的颜色 (灰色) */
  border: 2px solid #a0a0a0; /* 未激活状态的边框 */
  transition: background-color 0.3s ease, border-color 0.3s ease; /* 平滑过渡效果 */
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2); /* 轻微内阴影增加立体感 */
}

.ap-dot.active {
  background-color: #4CAF50; /* 激活状态的颜色 (例如：绿色) */
  border-color: #388E3C; /* 激活状态的边框 */
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.7), inset 0 1px 2px rgba(0,0,0,0.1); /* 发光效果和内阴影 */
}
</style>