<template>
  <div class="status-container">
    <div class="player-status status-column">
      <h3>玩家</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">HP:</span>
          <span class="stat-value">{{ playerHealth }}/{{ playerMaxHealth }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">攻:</span>
          <span class="stat-value">{{ playerAttack }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">防:</span>
          <span class="stat-value">{{ playerDefense }}</span>
        </div>
      </div>
      <div class="aura-display" v-if="hasAuras">
        <span v-if="playerAuras.jin > 0" class="aura jin" title="金灵气">金:{{ playerAuras.jin }}</span>
        <span v-if="playerAuras.mu > 0" class="aura mu" title="木灵气">木:{{ playerAuras.mu }}</span>
        <span v-if="playerAuras.shui > 0" class="aura shui" title="水灵气">水:{{ playerAuras.shui }}</span>
        <span v-if="playerAuras.huo > 0" class="aura huo" title="火灵气">火:{{ playerAuras.huo }}</span>
        <span v-if="playerAuras.tu > 0" class="aura tu" title="土灵气">土:{{ playerAuras.tu }}</span>
        <span v-if="playerAuras.hun > 0" class="aura hun" title="混元灵气">混:{{ playerAuras.hun }}</span>
      </div>
      <div class="effects-display-container" v-if="playerEffects.length > 0">
        <strong>效果:</strong>
        <div class="effects-row">
          <EffectDisplay v-for="(effect, index) in playerEffects" :key="index" :effect="effect" />
        </div>
      </div>
    </div>
    
    <div class="enemy-status status-column">
      <h3>敌人</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">HP:</span>
          <span class="stat-value">{{ enemyCurrentHP }}/{{ enemyMaxHP }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">攻:</span>
          <span class="stat-value">{{ enemyAttack }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">防:</span>
          <span class="stat-value">{{ enemyDefense }}</span>
        </div>
      </div>
      <div class="effects-display-container" v-if="enemyEffects.length > 0">
        <strong>效果:</strong>
        <div class="effects-row">
          <EffectDisplay v-for="(effect, index) in enemyEffects" :key="index" :effect="effect" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gameContext from '../models/DefaultGameSetup';
import EffectDisplay from './EffectDisplay.vue'; // Import the new component

export default {
  components: {
    EffectDisplay // Register the component
  },
  data() {
    return {
      playerHealth: 0,
      playerMaxHealth: 0,
      playerAP: 0,
      playerAttack: 0,
      playerDefense: 0,
      playerAuras: {
        jin: 0,
        mu: 0,
        shui: 0,
        huo: 0,
        tu: 0,
        hun: 0
      },
      enemyCurrentHP: 0,
      enemyMaxHP: 0,
      enemyAttack: 0,
      enemyDefense: 0,
      playerEffects: [],
      enemyEffects: [],
      animationFrameId: null
    };
  },
  computed: {
    hasAuras() {
      return Object.values(this.playerAuras).some(count => count > 0);
    }
  },
  mounted() {
    this.startUpdating();
  },
  beforeUnmount() {
    this.stopUpdating();
  },
  methods: {
    updateStats() {
      this.playerHealth = gameContext.player.currentHP;
      this.playerMaxHealth = gameContext.player.maxHP;
      this.playerAP = gameContext.player.currentAP;
      this.playerAttack = gameContext.player.computedAttack;
      this.playerDefense = gameContext.player.computedDefense;
      
      this.playerAuras.jin = gameContext.player.currentJin;
      this.playerAuras.mu = gameContext.player.currentMu;
      this.playerAuras.shui = gameContext.player.currentShui;
      this.playerAuras.huo = gameContext.player.currentHuo;
      this.playerAuras.tu = gameContext.player.currentTu;
      this.playerAuras.hun = gameContext.player.currentHun;
      
      this.playerEffects = gameContext.player.activeEffects.filter(effect => effect.shouldDisplay);
      
      if (gameContext.enemy) {
        this.enemyCurrentHP = gameContext.enemy.currentHP;
        this.enemyMaxHP = gameContext.enemy.maxHP;
        this.enemyAttack = gameContext.enemy.computedAttack;
        this.enemyDefense = gameContext.enemy.computedDefense;
        this.enemyEffects = gameContext.enemy.activeEffects.filter(effect => effect.shouldDisplay);
      } else {
        this.enemyEffects = [];
      }
      
      this.animationFrameId = requestAnimationFrame(this.updateStats);
    },
    startUpdating() {
      this.updateStats();
    },
    stopUpdating() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  }
};
</script>

<style scoped>
.status-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.status-column {
  width: 48%; /* Slightly adjusted width */
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px; /* Slightly more rounded corners */
  background-color: rgba(255, 255, 255, 0.85); /* Slightly more opaque */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
