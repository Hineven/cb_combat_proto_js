<template>
  <div class="status-column">
    <h3>{{ title }}</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">HP:</span>
        <span class="stat-value">{{ character.currentHP !== undefined ? character.currentHP.toFixed(0) : 'N/A' }}/{{ character.maxHP !== undefined ? character.maxHP.toFixed(0) : 'N/A' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">攻:</span>
        <span class="stat-value">{{ character.computedAttack !== undefined ? character.computedAttack.toFixed(0) : 'N/A' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">防:</span>
        <span class="stat-value">{{ character.computedDefense !== undefined ? character.computedDefense.toFixed(0) : 'N/A' }}</span>
      </div>
    </div>
    <div class="aura-display" v-if="character.isPlayer && hasAuras">
      <span v-if="character.currentJin > 0" class="aura jin" title="金灵气">金:{{ character.currentJin }}</span>
      <span v-if="character.currentMu > 0" class="aura mu" title="木灵气">木:{{ character.currentMu }}</span>
      <span v-if="character.currentShui > 0" class="aura shui" title="水灵气">水:{{ character.currentShui }}</span>
      <span v-if="character.currentHuo > 0" class="aura huo" title="火灵气">火:{{ character.currentHuo }}</span>
      <span v-if="character.currentTu > 0" class="aura tu" title="土灵气">土:{{ character.currentTu }}</span>
      <span v-if="character.currentHun > 0" class="aura hun" title="混元灵气">混:{{ character.currentHun }}</span>
    </div>
    <div class="effects-display-container" v-if="character.activeEffects && character.activeEffects.length > 0">
      <strong>效果:</strong>
      <div class="effects-row">
        <EffectDisplay v-for="(effect, index) in character.activeEffects.filter(e => e.shouldDisplay)" :key="index" :effect="effect" />
      </div>
    </div>
  </div>
</template>

<script>
import EffectDisplay from './EffectDisplay.vue';

export default {
  components: {
    EffectDisplay
  },
  props: {
    character: {
      type: Object,
      required: true,
      default: () => ({}) // Provide a default empty object
    },
    title: {
      type: String,
      required: true
    }
  },
  computed: {
    hasAuras() {
      if (!this.character || !this.character.isPlayer) return false;
      return (this.character.currentJin || 0) > 0 ||
             (this.character.currentMu || 0) > 0 ||
             (this.character.currentShui || 0) > 0 ||
             (this.character.currentHuo || 0) > 0 ||
             (this.character.currentTu || 0) > 0 ||
             (this.character.currentHun || 0) > 0;
    }
  }
};
</script>

<style scoped>
.status-column {
  width: 100%; /* Let the parent (.side-panel) control the width */
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  box-sizing: border-box; /* Ensure padding and border are within the width */
}

.status-column h3 {
  margin-top: 0;
  margin-bottom: 8px; /* Reduced margin */
  color: #333;
  font-size: 1.1em; /* Slightly larger title */
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); /* 调整minmax以适应可能的空间减少 */
  gap: 4px; /* Reduced gap */
  margin-bottom: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between; /* Label and value on opposite ends */
  align-items: center;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}

.stat-label {
  font-weight: bold;
  color: #555;
  margin-right: 5px;
}

.stat-value {
  color: #111;
  font-weight: 500;
}

.aura-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px; /* Reduced gap */
  margin-top: 8px;
  padding: 6px;
  background-color: rgba(0,0,0,0.04);
  border-radius: 4px;
  justify-content: center; /* Center auras if they don't fill the line */
}

.aura {
  padding: 2px 5px; /* Adjusted padding */
  border-radius: 3px;
  font-size: 0.8em; /* Slightly smaller aura text */
  color: white;
  font-weight: bold;
  box-shadow: 0 1px 1px rgba(0,0,0,0.2);
}

.aura.jin { background-color: #FFD700; /* Gold */ }
.aura.mu { background-color: #228B22; /* ForestGreen */ }
.aura.shui { background-color: #1E90FF; /* DodgerBlue */ }
.aura.huo { background-color: #DC143C; /* Crimson */ }
.aura.tu { background-color: #D2691E; /* Chocolate */ }
.aura.hun { background-color: #808080; /* Gray */ }

.effects-display-container {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid #e0e0e0; /* Lighter border */
}

.effects-display-container strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.8em;
  color: #444;
  text-align: left;
}

.effects-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* Reduced gap */
  justify-content: flex-start;
}
</style>