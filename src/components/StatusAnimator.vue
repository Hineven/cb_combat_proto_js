<template>
  <div class="status-animator-container">
    <transition-group name="float" tag="div">
      <div v-for="anim in activeAnimations" :key="anim.localId" class="floating-text" :class="anim.type">
        {{ anim.text }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';
import eventBus from '../utils/eventBus'; // Import the event bus

const props = defineProps({
  characterId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['event-consumed']);

const activeAnimations = ref([]);

const handlePlayAnimation = (eventData) => {
  // console.log(`[StatusAnimator ${props.characterId}] handlePlayAnimation CALLED. Received eventData:`, JSON.stringify(eventData)); // DEBUG

  if (eventData.characterId === props.characterId) {
    // console.log(`[StatusAnimator ${props.characterId}] Character ID MATCH. Processing event for self.`); // DEBUG

    const localAnimId = `${eventData.id}-${Date.now()}`;
    const newAnimation = {
      text: eventData.text,
      type: eventData.type,
      localId: localAnimId
    };
    activeAnimations.value.push(newAnimation);

    eventBus.emit('animation-displayed', { characterId: props.characterId, eventId: eventData.id });

    setTimeout(() => {
      activeAnimations.value = activeAnimations.value.filter(a => a.localId !== localAnimId);
    }, 1500);
  } else {
    // console.log(`[StatusAnimator ${props.characterId}] Character ID MISMATCH. Event for ${eventData.characterId}, I am ${props.characterId}. Ignoring.`); // DEBUG
  }
};

onMounted(() => {
  // console.log(`[StatusAnimator ${props.characterId}] Mounted and listening for 'play-animation' events.`); // DEBUG
  eventBus.on('play-animation', handlePlayAnimation);
});

onUnmounted(() => {
  // console.log(`[StatusAnimator ${props.characterId}] Unmounted, removing 'play-animation' listener.`); // DEBUG
  eventBus.off('play-animation', handlePlayAnimation);
});

</script>

<style scoped>
.status-animator-container {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px; /* Adjust as needed */
  height: 100px; /* Adjust as needed */
  pointer-events: none; /* So it doesn't interfere with clicks on CharacterStatus */
  z-index: 10;
}

.floating-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2em;
  font-weight: bold;
  text-shadow: 1px 1px 2px black;
  animation: float-up 1.5s ease-out forwards;
}

.floating-text.damage {
  color: red;
}

.floating-text.heal {
  color: lightgreen;
}

.floating-text.buff {
  color: gold;
}

.floating-text.debuff {
  color: mediumpurple;
}

/* Add more types as needed */

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translate(-50%, 20px); /* Start lower */
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50px); /* Float upwards */
  }
}

/* Transition group styles for enter/leave (optional if only using CSS animation) */
.float-enter-active, .float-leave-active {
  transition: all 0.5s ease;
}
.float-enter-from, .float-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(-50%);
}
</style>
