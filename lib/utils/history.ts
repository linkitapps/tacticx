import { ArrowType, PlayerType, TextAnnotationType } from "@/lib/types/editor"
import { deepClone } from "./editor"

export interface EditorHistory {
  players: PlayerType[][]
  arrows: ArrowType[][]
  textAnnotations: TextAnnotationType[][]
  historyIndex: number
}

const MAX_HISTORY_LENGTH = 50

/**
 * Save current state to history
 */
export function saveToHistory(
  history: EditorHistory,
  currentPlayers: PlayerType[],
  currentArrows: ArrowType[],
  currentTextAnnotations: TextAnnotationType[]
): EditorHistory {
  // Create new arrays for the history stack
  const newPlayersStack = history.players.slice(0, history.historyIndex + 1)
  const newArrowsStack = history.arrows.slice(0, history.historyIndex + 1)
  const newTextStack = history.textAnnotations.slice(0, history.historyIndex + 1)
  
  // Add current state to history
  newPlayersStack.push(deepClone(currentPlayers))
  newArrowsStack.push(deepClone(currentArrows))
  newTextStack.push(deepClone(currentTextAnnotations))
  
  // Limit history length
  if (newPlayersStack.length > MAX_HISTORY_LENGTH) {
    newPlayersStack.shift()
    newArrowsStack.shift()
    newTextStack.shift()
  }
  
  return {
    players: newPlayersStack,
    arrows: newArrowsStack,
    textAnnotations: newTextStack,
    historyIndex: newPlayersStack.length - 1
  }
}

/**
 * Go back in history (undo)
 */
export function undo(history: EditorHistory): {
  history: EditorHistory
  players: PlayerType[]
  arrows: ArrowType[]
  textAnnotations: TextAnnotationType[]
} | null {
  if (history.historyIndex <= 0) {
    return null // Nothing to undo
  }
  
  const newIndex = history.historyIndex - 1
  
  return {
    history: {
      ...history,
      historyIndex: newIndex
    },
    players: deepClone(history.players[newIndex]),
    arrows: deepClone(history.arrows[newIndex]),
    textAnnotations: deepClone(history.textAnnotations[newIndex])
  }
}

/**
 * Go forward in history (redo)
 */
export function redo(history: EditorHistory): {
  history: EditorHistory
  players: PlayerType[]
  arrows: ArrowType[]
  textAnnotations: TextAnnotationType[]
} | null {
  if (history.historyIndex >= history.players.length - 1) {
    return null // Nothing to redo
  }
  
  const newIndex = history.historyIndex + 1
  
  return {
    history: {
      ...history,
      historyIndex: newIndex
    },
    players: deepClone(history.players[newIndex]),
    arrows: deepClone(history.arrows[newIndex]),
    textAnnotations: deepClone(history.textAnnotations[newIndex])
  }
}

/**
 * Create a new history
 */
export function createHistory(): EditorHistory {
  return {
    players: [[]],
    arrows: [[]],
    textAnnotations: [[]],
    historyIndex: 0
  }
} 