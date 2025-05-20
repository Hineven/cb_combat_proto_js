<template>
  <div class="card-slot-selector">
    <h3>可选卡牌</h3>
    <div class="card-list">
      <div v-for="(entry, index) in availableCards" :key="index" class="card-preview-item" @click="handleCardClick(entry)">
        <Card :card="entry" :owner="previewOwner" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Card from './Card.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  availableCards: {
    type: Array,
    required: true
  },
  previewOwner: { // Added previewOwner prop
    type: Object,
    default: null
  }
});

const emit = defineEmits(['card-chosen']);

const handleCardClick = (entry) => {
  emit('card-chosen', entry); // Emit the whole entry { cardInstance, blueprint }
};
</script>

<style scoped>
.card-slot-selector {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  max-height: 80vh; /* Limit height */
  overflow-y: auto; /* Allow scrolling for many cards */
}

.card-slot-selector h3 {
  margin-top: 0;
  margin-bottom: 10px;
  text-align: center;
  color: white;
}

.card-list {
  display: flex;
  flex-wrap: wrap; /* Allow cards to wrap to the next line */
  gap: 10px;
  justify-content: center;
}

.card-preview-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: border-color 0.3s, transform 0.2s;
}

.card-preview-item:hover {
  border-color: #007bff;
  transform: translateY(-3px);
}
</style>
