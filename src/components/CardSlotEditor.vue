<template>
  <div class="card-slot-editor" :class="{ selected: isSelected }" @click="handleClick">
    <Card :card="cardSlot.card" :owner="previewOwner" />
    <p v-if="isSelected" class="selected-indicator">当前选中</p>
  </div>
</template>

<script setup>
import Card from './Card.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  cardSlot: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  previewOwner: { // Added previewOwner prop
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select-slot']);

const handleClick = () => {
  emit('select-slot');
};
</script>

<style scoped>
.card-slot-editor {
  border: 2px solid #ccc;
  padding: 10px;
  margin: 5px;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px; /* Ensure a decent size for the card preview */
  min-height: 250px;
}

.card-slot-editor.selected {
  border-color: #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.selected-indicator {
  margin-top: 5px;
  color: #4CAF50;
  font-weight: bold;
  font-size: 0.9em;
}
</style>
