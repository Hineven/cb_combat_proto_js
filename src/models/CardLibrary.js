// filepath: src\models\CardLibrary.js
import gameContext from './DefaultGameSetup.js';
import {
  BasicAttackCard,
  BasicDefenseCard,
  YingChengCard,
  Leino,
  WanMuJue1,
  LingQiBaoFaCard,
  // ... import all other card classes exported from Cards.js
} from './Cards.js';

const allCardBlueprints = [
  { constructor: BasicAttackCard, args: [] },
  { constructor: BasicDefenseCard, args: [] },
  { constructor: YingChengCard, args: [] },
  { constructor: Leino, args: ["通用", 1] }, // Example with default args for preview
  { constructor: Leino, args: ["木", 2] },   // Another Leino variant
  { constructor: Leino, args: ["火", 1] },   // And another
  { constructor: WanMuJue1, args: [] },
  { constructor: LingQiBaoFaCard, args: [] },
  // ... add entries for all other cards with their constructors and default args for preview
  // e.g. { constructor: SpecificCard, args: [param1, param2] },
];

const availableCards = [];

// Use a temporary, generic owner for card initialization in the library/preview context.
// This owner won't be the actual player during gameplay but is sufficient for card.init()
// which primarily sets up ctx and owner for methods like getDescription, getColor etc.
// The actual player's PlayingCharacterState will be used when a card is equipped to a slot.
const previewOwner = gameContext.player; // Using the default player state for preview initialization

allCardBlueprints.forEach(blueprint => {
  try {
    const cardInstance = new blueprint.constructor(...blueprint.args);
    // Initialize the card for preview purposes.
    // The gameContext and a generic owner (like the default player) are used here.
    // When a card is actually equipped, it will be re-initialized with the active player context.
    cardInstance.init(gameContext, previewOwner);
    availableCards.push(cardInstance);
  } catch (error) {
    console.error(`Error instantiating or initializing card ${blueprint.constructor.name}:`, error);
  }
});

export { availableCards, allCardBlueprints }; // Modified to export allCardBlueprints
