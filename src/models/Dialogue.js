export class DialogueSegment {
    constructor (message) {
        this.message = message
        // Time lapse when auto play is enabled
        this.autoPlayTimeLapse = 0
        // The animation speed of characters popping up when the dialogue appears
        this.playSpeed = 50
    }
};

export class Dialogue {
    constructor () {
        this.segments = []
        this.autoPlay = false
    }
};

export function makeDialogue (messages) {
    var dialogue = new Dialogue()
    for(var i = 0; i < messages.length; i++) {
        const segment = new DialogueSegment(messages[i]);
        dialogue.segments.push(segment);
    }
    return dialogue
}

import eventBus from '../utils/eventBus.js'

// Emit an event which will be listened by the DialogeScreen component
export function fireDialogue (dialogue) {
    if (dialogue instanceof Dialogue) {
        eventBus.emit('dialogue', dialogue)
    } else {
        console.error("Invalid argument: Expected an instance of Dialogue.")
    }
}