<template>
  <div class="game-log-container">
    <h4>游戏日志</h4>
    <div class="log-entries" ref="logEntriesContainer">
      <div v-for="(entry, index) in logs" :key="index" class="log-entry">
        <span :class="getActorClass(entry.actor)">[{{ entry.actor }}]</span>: {{ entry.action }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, watch, nextTick } from 'vue';

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  }
});

const logEntriesContainer = ref(null);

const getActorClass = (actor) => {
  if (actor === 'Player') return 'actor-player';
  if (actor === 'Enemy') return 'actor-enemy';
  return '';
};

// Auto-scroll to the bottom when new logs are added
watch(() => props.logs, async () => {
  await nextTick(); // Wait for DOM update
  if (logEntriesContainer.value) {
    logEntriesContainer.value.scrollTop = logEntriesContainer.value.scrollHeight;
  }
}, { deep: true });
</script>

<style scoped>
.game-log-container {
  width: 80%;
  max-width: 600px;
  height: 50%; /* Adjust height as needed */
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin: 20px auto; /* Center it and provide some margin */
  display: flex;
  flex-direction: column;
}

.game-log-container h4 {
  margin-top: 0;
  margin-bottom: 10px;
  text-align: center;
  color: #333;
}

.log-entries {
  flex-grow: 1;
  overflow-y: auto;
  font-size: 0.9em;
  line-height: 1.6;
}

.log-entry {
  margin-bottom: 5px;
  padding: 2px 5px;
  border-radius: 3px;
}

.actor-player {
  color: #42b983; /* Vue green */
  font-weight: bold;
}

.actor-enemy {
  color: #dc3545; /* Bootstrap danger red */
  font-weight: bold;
}

/* Custom scrollbar for webkit browsers */
.log-entries::-webkit-scrollbar {
  width: 8px;
}

.log-entries::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
  border-radius: 4px;
}

.log-entries::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
}

.log-entries::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.5);
}
</style>
