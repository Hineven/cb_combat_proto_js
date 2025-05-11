<template>
  <div 
    class="effect-display" 
    :style="effectStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span class="effect-initial">{{ effect.name ? (effect.name_tag ? effect.name_tag : effect.name.charAt(0).toUpperCase()) : '' }}</span>
    <div 
      v-if="showTooltip && tooltipContent" 
      class="effect-tooltip"
      ref="tooltipRef"
      :style="dynamicTooltipStyle"
    >
      <strong>{{ effect.name }}</strong>
      <p>{{ tooltipContent }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, computed, nextTick } from 'vue'; // Import nextTick
import gameContext from '../models/DefaultGameSetup';

const props = defineProps({
  effect: {
    type: Object,
    required: true
  }
});

const showTooltip = ref(false);
const tooltipRef = ref(null); // Ref for the tooltip element
const dynamicTooltipStyle = ref({}); // Reactive style for the tooltip

const effectStyle = computed(() => {
  const bgColor = props.effect.color || '#808080'; 
  let textColor = '#FFFFFF'; 
  if (bgColor.startsWith('#')) {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    if ((r * 0.299 + g * 0.587 + b * 0.114) > 186) { 
      textColor = '#000000'; 
    }
  } else { // Handle named colors or other formats if necessary, or assume dark if not hex
    // This is a very basic fallback for named colors, assuming they might be light
    // A more robust solution would involve a mapping of named colors to their luminance
    const commonLightColors = ['white', 'yellow', 'aqua', 'lime', 'lightyellow', 'lightcyan'];
    if (commonLightColors.includes(bgColor.toLowerCase())) {
        textColor = '#000000';
    }
  }
  return {
    backgroundColor: bgColor,
    color: textColor
  };
});

const tooltipContent = computed(() => {
  if (typeof props.effect.getDescription === 'function') {
    return props.effect.getDescription(gameContext);
  }
  // Fallback to name or a default message if no description method/property
  return props.effect.description || props.effect.name || 'No detailed description available.'; 
});

const handleMouseEnter = () => {
  showTooltip.value = true;
  nextTick(() => {
    if (tooltipRef.value) {
      const tooltipEl = tooltipRef.value;
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const buffer = 5; // 5px buffer from viewport edges

      // Default transform from CSS is translateX(-50%) translateY(-5px)
      // We calculate the pixel equivalent of translateX(-50%)
      let translateXValue = -tooltipRect.width / 2;
      
      // Check for overflow on the right edge
      if (tooltipRect.right > viewportWidth - buffer) {
        const overflowAmount = tooltipRect.right - (viewportWidth - buffer);
        translateXValue -= overflowAmount; // Shift left
      } 
      // Check for overflow on the left edge (use else if if centered, but check independently for robustness)
      else if (tooltipRect.left < buffer) {
        const overflowAmount = buffer - tooltipRect.left;
        translateXValue += overflowAmount; // Shift right
      }
      
      dynamicTooltipStyle.value = {
        transform: `translateX(${translateXValue}px) translateY(-5px)`
        // left: 50% is still applied from the CSS class
      };
    }
  });
};

const handleMouseLeave = () => {
  showTooltip.value = false;
  dynamicTooltipStyle.value = {}; // Reset styles to use CSS defaults
};

</script>

<style scoped>
.effect-display {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative; /* For tooltip positioning */
  border: 1px solid rgba(0,0,0,0.2);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  /* color: white; Default text color, now handled by effectStyle */
  font-weight: bold;
  font-size: 0.8em;
  /* text-shadow: 1px 1px 1px rgba(0,0,0,0.3); Removed for better clarity with dynamic text color */
  transition: transform 0.1s ease-out;
}

.effect-display:hover {
  transform: scale(1.1);
}

.effect-initial {
  pointer-events: none; /* So it doesn't interfere with parent's mouse events */
}

.effect-tooltip {
  position: absolute;
  bottom: 100%; /* Position above the square */
  left: 50%;
  transform: translateX(-50%) translateY(-5px); /* Center and add a small gap */
  background-color: #2c3e50; /* Darker, more modern background */
  color: white;
  padding: 8px 12px;
  border-radius: 6px; /* Slightly more rounded */
  box-shadow: 0 4px 8px rgba(0,0,0,0.25); /* Softer, more pronounced shadow */
  z-index: 1000; /* Ensure tooltip is on top */
  width: max-content; /* Adjust width to content */
  min-width: 120px; /* Minimum width */
  max-width: 250px; /* Max width for tooltip */
  font-size: 0.85rem; /* Using rem for better accessibility */
  line-height: 1.4;
  text-align: left;
  pointer-events: none; /* Tooltip should not be interactive itself */
  opacity: 0.95; /* Slight transparency */
}

.effect-tooltip strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #42b983; /* Vue green for title */
}

.effect-tooltip p {
  margin: 0;
  font-size: 0.8rem;
  white-space: pre-wrap; /* Respect newlines in description */
}
</style>