<template>
  <div v-if="card"
    class="card"
    :class=" [
      { 'card-highlight': isHighlighted },
      specialEffectClass,
      activationCountClass
    ]"
    :style="cardStyle"
    @click="handleClick"
  >
    <div v-if="decorationType === 'stripe'" class="decoration stripe-decoration" :style="decorationStyle"></div>
    <div v-if="decorationType === 'corner'" class="decoration corner-decoration-top-left" :style="cornerDecorationStyle"></div>
    <div v-if="decorationType === 'corner'" class="decoration corner-decoration-bottom-right" :style="cornerDecorationStyle"></div>
    <h3>{{ card.name }}</h3>
    <h4> {{ card.subtitle }}</h4>
    <p class="description-main">{{ cachedDescription }}</p>
    <div v-if="passiveDescription" class="passive-description-bar">
      <p>{{ passiveDescription }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue';
import gameContext from '../models/DefaultGameSetup';

const props = defineProps({
  card: { type: Object, required: true },
  isFirstCard: { type: Boolean, default: false },
  activationCount: { type: Number, default: 0 },
  specialEffect: { type: String, default: '' }, // 'cultivating', 'activating'
  owner: { type: Object, default: () => gameContext.player } // Default to player if not specified
});

const cachedDescription = ref('');
const passiveDescription = ref(''); // New ref for passive description
const isHighlighted = ref(false);

const handleClick = () => {
  isHighlighted.value = true;
  setTimeout(() => {
    isHighlighted.value = false;
  }, 300);
};

const specialEffectClass = computed(() => {
  if (props.isFirstCard && props.specialEffect === 'cultivating') {
    return 'card-cultivating-feedback';
  }
  if (props.isFirstCard && props.specialEffect === 'activating') {
    return 'card-activating-feedback';
  }
  return '';
});

const activationCountClass = computed(() => {
  if (props.isFirstCard && props.activationCount > 0) {
    if (props.activationCount === 1) return 'activation-count-1';
    if (props.activationCount === 2) return 'activation-count-2';
    if (props.activationCount >= 3) return 'activation-count-3'; // Max visual for 3+
  }
  return '';
});

const cardStyle = computed(() => {
  const majorColor = typeof props.card.getCardMajorColor === 'function' ? props.card.getCardMajorColor(gameContext, props.owner) : '#fff';
  const minorColor = typeof props.card.getMinorColor === 'function' ? props.card.getMinorColor(gameContext, props.owner) : '#ddd';
  return {
    background: majorColor,
    borderColor: minorColor
  };
});

const decorationColor = computed(() => {
  return typeof props.card.getDecorationColor === 'function' ? props.card.getDecorationColor(gameContext, props.owner) : 'transparent';
});

const decorationType = computed(() => {
  return typeof props.card.getDecorationType === 'function' ? props.card.getDecorationType(gameContext, props.owner) : 'none'; // e.g., 'none', 'stripe', 'corner'
});

const decorationStyle = computed(() => {
  if (decorationType.value === 'stripe') {
    return {
      backgroundColor: decorationColor.value
    };
  }
  return {};
});

const cornerDecorationStyle = computed(() => {
  if (decorationType.value === 'corner') {
    return {
      borderColor: `${decorationColor.value} transparent transparent transparent` // Default for top-left, will be rotated for others if needed
    };
  }
  return {};
});

// Function to update descriptions
const updateDescriptions = () => {
  if (props.card) {
    if (typeof props.card.getDescription === 'function') {
      cachedDescription.value = props.card.getDescription(gameContext, props.owner);
    }
    if (typeof props.card.getPassiveDescription === 'function') {
      passiveDescription.value = props.card.getPassiveDescription(gameContext, props.owner);
    } else {
      passiveDescription.value = ''; // Clear if method doesn't exist
    }
  }
};

// Initial load and card changes
watch(() => [props.card, props.owner, props.activationCount], () => {
  updateDescriptions();
}, { immediate: true, deep: true }); // Added deep: true for reactivity on card properties if needed

// Interval update
const updateInterval = setInterval(() => {
  updateDescriptions();
}, 32); // Consider if this interval is too frequent or can be event-driven

// 组件卸载时清除定时器
onUnmounted(() => {
  clearInterval(updateInterval);
});
</script>

<style scoped>
.card {
  width: 120px;
  height: 180px; /* Adjusted height to potentially accommodate passive description */
  background: #fff;
  border: 10px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  font-family: Arial, sans-serif;
  transition: all 0.3s ease;
  position: relative; 
  overflow: hidden; 
  display: flex; /* Added for flex layout */
  flex-direction: column; /* Stack children vertically */
  justify-content: space-between; /* Distribute space, pushes passive to bottom */
}

.description-main {
  flex-grow: 1; /* Allows main description to take available space */
  margin-bottom: 5px; /* Add some space before passive bar if it exists */
}

.passive-description-bar {
  background-color: rgba(0, 0, 0, 0.05); /* Light background for the bar */
  padding: 5px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.75em; /* Smaller font for passive description */
  color: #333;
  width: 100%; /* Take full width of the card padding area */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
  margin-top: auto; /* Pushes to the bottom if card content is not enough */
}

.passive-description-bar p {
  margin: 0;
  white-space: normal; /* Allow text to wrap */
}

.card h3 {
  margin-top: 0;
  margin-bottom: 2px; /* Space between title and main description */
  font-size: 1.1em;
}

.card h4 {
  margin-top: 0;
  margin-bottom: 2px; /* Space between title and main description */
  font-size: 0.7em;
  color:gray;
}

.card-highlight {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
}

.card-cultivating-feedback {
  animation: cultivate-feedback 0.4s ease-out;
}

.card-activating-feedback {
  animation: activate-feedback 0.4s ease-out;
}

@keyframes cultivate-feedback {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px) scale(1.02); box-shadow: 0 0 12px rgba(173, 216, 230, 0.9); } /* Light blue glow */
}

@keyframes activate-feedback {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); box-shadow: 0 0 15px rgba(255, 165, 0, 0.9); } /* Orange glow */
}

/* Activation Count Styles */
.activation-count-1 {
  border-color: rgba(255, 215, 0, 0.7); /* Gold border for 1 activation */
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.activation-count-2 {
  border-color: rgba(255, 165, 0, 0.8); /* Orange border for 2 activations */
  box-shadow: 0 0 20px rgba(255, 165, 0, 1);
}

.activation-count-3 {
  border-color: rgba(255, 69, 0, 0.9); /* Red-Orange border for 3+ activations */
  box-shadow: 0 0 20px rgba(255, 69, 0, 1);
  animation: pulse-border 1s infinite alternate;
}

@keyframes pulse-border {
  from {
    border-width: 10px; /* Changed from 1px */
  }
  to {
    border-width: 14px; /* Changed from 3px, to make the pulse more visible with a thicker base border */
    border-color: rgba(255, 0, 0, 1); /* Stronger red for pulsing */
  }
}

.decoration {
  position: absolute;
  pointer-events: none; /* Decorations should not interfere with clicks */
}

.stripe-decoration {
  top: 10px;
  left: -30px;
  width: 100px;
  height: 25px;
  transform: rotate(-45deg);
  opacity: 0.7;
}

.corner-decoration-top-left {
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 30px 30px 0 0; /* Adjust size as needed */
  /* border-color is set by cornerDecorationStyle */
}

.corner-decoration-bottom-right {
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 30px 30px; /* Adjust size as needed */
  /* border-color needs to be adjusted for bottom-right */
  /* This specific one would be: transparent transparent decorationColor.value transparent */
  /* For simplicity, we'll use the same border color logic and rely on CSS to make it appear on the correct corner */
  /* A more robust solution might involve passing the corner position to the style computation */
   border-color: transparent transparent v-bind(decorationColor) transparent; /* Example, needs refinement */
}

</style>