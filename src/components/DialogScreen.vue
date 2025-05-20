<template>
  <div 
    class="dialog-screen" 
    v-if="isVisible" 
    @click="handleScreenClick"
  >
    <div class="dialog-container">
      <div class="character-portrait">
        <!-- 人物头像将放在这里 -->
        <img v-if="currentPortrait" :src="currentPortrait" alt="角色头像" />
      </div>
      <div class="dialog-box">
        <div class="dialog-content">
          <span v-html="displayedText"></span>
        </div>
        <div class="dialog-controls">
          <div class="continue-hint" v-if="canContinue">点击继续...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import eventBus from '../utils/eventBus.js';

// 本地状态
const isVisible = ref(false);
const currentDialogue = ref(null);
const currentSegmentIndex = ref(0);
const displayedText = ref('');
const currentText = ref('');
const currentPortrait = ref('');
const canContinue = ref(true);
const typingInProgress = ref(false);
const currentCharIndex = ref(0);
const typingSpeed = ref(30); // 每个字符的默认打字速度(ms)

// 监听对话事件
onMounted(() => {
  eventBus.on('dialogue', handleDialogueEvent);
});

// 组件卸载前移除事件监听
onUnmounted(() => {
  eventBus.off('dialogue', handleDialogueEvent);
});

// 处理从eventBus接收到的对话事件
const handleDialogueEvent = (dialogue) => {
  currentDialogue.value = dialogue;
  currentSegmentIndex.value = 0;
  if (dialogue.segments && dialogue.segments.length > 0) {
    startDialogue();
  }
};

// 开始显示对话
const startDialogue = () => {
  isVisible.value = true;
  showCurrentSegment();
};

// 显示当前对话段落
const showCurrentSegment = () => {
  if (!currentDialogue.value || 
      !currentDialogue.value.segments || 
      currentSegmentIndex.value >= currentDialogue.value.segments.length) {
    return;
  }
  
  const segment = currentDialogue.value.segments[currentSegmentIndex.value];
  currentText.value = segment.message || '';
  currentPortrait.value = segment.portrait || '';
  
  // 设置打字速度
  typingSpeed.value = segment.playSpeed || 30;
  
  // 重置打字动画状态
  displayedText.value = '';
  currentCharIndex.value = 0;
  typingInProgress.value = true;
  canContinue.value = false;
  
  // 开始打字动画
  typeNextChar();
};

// 打字效果的递归函数
const typeNextChar = () => {
  if (currentCharIndex.value < currentText.value.length) {
    // 将下一个字符添加到显示文本中
    displayedText.value += currentText.value.charAt(currentCharIndex.value);
    currentCharIndex.value++;
    
    // 使用setTimeout继续打字效果
    setTimeout(typeNextChar, typingSpeed.value);
  } else {
    // 打字效果完成
    typingInProgress.value = false;
    canContinue.value = true;
    
    // 如果是自动播放模式，安排显示下一段对话
    if (currentDialogue.value && currentDialogue.value.autoPlay) {
      const segment = currentDialogue.value.segments[currentSegmentIndex.value];
      const delay = segment.autoPlayTimeLapse || 2000; // 默认2秒
      setTimeout(handleContinue, delay);
    }
  }
};

const handleScreenClick = (event) => {
  event.stopPropagation();
  
  // 如果正在打字中，点击后立即显示完整文本
  if (typingInProgress.value) {
    typingInProgress.value = false;
    displayedText.value = currentText.value;
    canContinue.value = true;
    return;
  }
  
  // 如果可以继续，显示下一段对话
  if (canContinue.value) {
    handleContinue();
  }
};

const handleContinue = () => {
  // 移动到下一段对话
  currentSegmentIndex.value++;
  
  // 如果还有更多对话段落，显示下一段
  if (currentDialogue.value && 
      currentSegmentIndex.value < currentDialogue.value.segments.length) {
    showCurrentSegment();
  } else {
    // 如果已经显示完所有对话，关闭对话屏幕
    closeDialogue();
  }
};

// 关闭对话
const closeDialogue = () => {
  isVisible.value = false;
  currentDialogue.value = null;
  currentSegmentIndex.value = 0;
  displayedText.value = '';
  currentText.value = '';
  currentPortrait.value = '';
};

// 立即完成当前打字动画
const completeTyping = () => {
  if (typingInProgress.value) {
    typingInProgress.value = false;
    displayedText.value = currentText.value;
    canContinue.value = true;
  }
};
</script>

<style scoped>
.dialog-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1); /* 透明背景 */
  z-index: 1000; /* 确保在其他元素上方 */
  display: flex;
  align-items: flex-end; /* 保持对话框在底部 */
  justify-content: center;
  padding-bottom: 50px; /* 距离底部的距离 */
}

.dialog-container {
  position: relative;
  width: 80%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
}

.character-portrait {
  position: absolute;
  top: -100px; /* 将头像放置在对话框上方 */
  right: 20px;
  width: 100px;
  height: 100px;
  z-index: 1001;
  overflow: hidden;
  border-radius: 50%; /* 圆形头像 */
  background-color: rgba(0, 0, 0, 0.2); /* 默认背景色 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dialog-box {
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dialog-content {
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 10px;
  min-height: 3em; /* 保持对话框高度稳定 */
}

.dialog-controls {
  display: flex;
  justify-content: flex-end;
}

.continue-hint {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}
</style>
