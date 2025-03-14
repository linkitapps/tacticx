import { create } from 'zustand'
import { nanoid } from "nanoid"

// Types
export type ArrowStyle = 'solid' | 'dashed' | 'dotted'

export interface Player {
  id: string
  x: number
  y: number
  number: string
  color: string
  size: number
  label?: string
}

export interface Arrow {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  controlX: number
  controlY: number
  color: string
  width: number
  style?: ArrowStyle
}

export interface TextAnnotation {
  id: string
  x: number
  y: number
  text: string
  fontSize?: number
  color?: string
}

export type EditorMode = 'select' | 'player' | 'arrow' | 'text'
export type ArrowDrawingState = 'idle' | 'started' | 'completed'

export interface EditorState {
  // Canvas dimensions
  canvasWidth: number
  canvasHeight: number
  setCanvasDimensions: (width: number, height: number) => void
  
  // Elements
  players: Player[]
  arrows: Arrow[]
  textAnnotations: TextAnnotation[]
  
  // Editing state
  mode: EditorMode
  setMode: (mode: EditorMode) => void
  selectedElementId: string | null
  selectElement: (id: string | null) => void
  
  // Player actions
  addPlayer: (x: number, y: number) => void
  updatePlayerPosition: (id: string, x: number, y: number) => void
  updatePlayer: (id: string, updates: Partial<Omit<Player, 'id' | 'x' | 'y'>>) => void
  deletePlayer: (id: string) => void
  
  // Arrow actions
  arrowDrawingState: ArrowDrawingState
  tempArrow: Arrow | null
  startArrow: (x: number, y: number) => void
  endArrow: (x: number, y: number) => void
  completeArrow: () => void
  cancelArrow: () => void
  deleteArrow: (id: string) => void
  updateArrow: (id: string, updates: Partial<Omit<Arrow, 'id'>>) => void
  
  // Text actions
  addText: (x: number, y: number, text: string) => void
  updateTextPosition: (id: string, x: number, y: number) => void
  updateTextContent: (id: string, text: string) => void
  deleteText: (id: string) => void
  updateTextAnnotation: (id: string, updates: Partial<Omit<TextAnnotation, 'id'>>) => void
  
  // History
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  
  // Utils
  clearAll: () => void
}

type HistoryState = {
  players: Player[]
  arrows: Arrow[]
  textAnnotations: TextAnnotation[]
}

// Store implementation
export const useEditorStore = create<EditorState>((set, get) => {
  // Track history for undo/redo
  const history: HistoryState[] = []
  let currentHistoryIndex = -1
  
  const saveToHistory = () => {
    const { players, arrows, textAnnotations } = get()
    
    // Truncate future history if we're not at the end
    if (currentHistoryIndex < history.length - 1) {
      history.splice(currentHistoryIndex + 1)
    }
    
    // Add current state to history
    history.push({ 
      players: JSON.parse(JSON.stringify(players)), 
      arrows: JSON.parse(JSON.stringify(arrows)), 
      textAnnotations: JSON.parse(JSON.stringify(textAnnotations)) 
    })
    currentHistoryIndex = history.length - 1
    
    // Update undo/redo availability
    set({ canUndo: currentHistoryIndex > 0, canRedo: false })
  }
  
  return {
    // Canvas dimensions
    canvasWidth: 800,
    canvasHeight: 600,
    setCanvasDimensions: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
    
    // Elements
    players: [],
    arrows: [],
    textAnnotations: [],
    
    // Editing state
    mode: 'select',
    setMode: (mode) => set({ mode }),
    selectedElementId: null,
    selectElement: (id) => set({ selectedElementId: id }),
    
    // Player actions
    addPlayer: (x, y) => {
      // Create a new player with a default color and no team designation
      const newPlayer: Player = {
        id: nanoid(),
        x,
        y,
        number: String(get().players.length + 1),
        color: '#2563EB', // Default blue
        size: 44
      }
      
      set((state) => ({
        players: [...state.players, newPlayer],
        selectedElementId: newPlayer.id
      }))
      
      saveToHistory()
    },
    
    updatePlayerPosition: (id, x, y) => {
      set((state) => ({
        players: state.players.map(player => 
          player.id === id ? { ...player, x, y } : player
        )
      }))
      
      saveToHistory()
    },
    
    updatePlayer: (id, updates) => {
      console.log(`==========================================`);
      console.log(`🔄 PLAYER UPDATE for ${id}:`, updates);
      
      // Find the player to update
      const currentState = get();
      const playerToUpdate = currentState.players.find(p => p.id === id);
      
      if (!playerToUpdate) {
        console.error("Player not found:", id);
        return;
      }
      
      // Special handling for color updates - log explicitly
      if (updates.color) {
        console.log(`🎨 COLOR UPDATE - Player ${id}: ${playerToUpdate.color} → ${updates.color}`);
      }
      
      // Create updated player by merging existing player with updates
      const updatedPlayer = {
        ...playerToUpdate,  // Start with all existing properties
        ...updates,         // Apply all updates
      };
      
      console.log("Updated player will be:", updatedPlayer);
      
      // Create a new players array (important for React to detect changes)
      const updatedPlayers = currentState.players.map(player => 
        player.id === id ? updatedPlayer : player
      );
      
      // Update state in one operation
      set({
        players: updatedPlayers,
        selectedElementId: currentState.selectedElementId // Maintain selection
      });
      
      // Save to history
      saveToHistory();
      
      console.log("Player update complete");
      console.log(`==========================================`);
    },
    
    deletePlayer: (id) => {
      set((state) => ({
        players: state.players.filter(player => player.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
      }))
      
      saveToHistory()
    },
    
    // Arrow actions
    arrowDrawingState: 'idle',
    tempArrow: null,
    
    startArrow: (x, y) => {
      const tempArrow: Arrow = {
        id: 'temp',
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        controlX: x,
        controlY: y - 20,
        color: 'white',
        width: 2
      }
      
      set({
        tempArrow,
        arrowDrawingState: 'started'
      })
    },
    
    endArrow: (x, y) => {
      set((state) => {
        if (!state.tempArrow) return {}
        
        return {
          tempArrow: {
            ...state.tempArrow,
            endX: x,
            endY: y,
            controlX: (state.tempArrow.startX + x) / 2,
            controlY: (state.tempArrow.startY + y) / 2 - 20
          }
        }
      })
    },
    
    completeArrow: () => {
      const { tempArrow } = get()
      
      if (!tempArrow) return
      
      // Only add the arrow if start and end points are different enough
      const dx = tempArrow.endX - tempArrow.startX
      const dy = tempArrow.endY - tempArrow.startY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 10) {
        const newArrow: Arrow = {
          ...tempArrow,
          id: nanoid()
        }
        
        set((state) => ({
          arrows: [...state.arrows, newArrow],
          tempArrow: null,
          arrowDrawingState: 'idle',
          selectedElementId: newArrow.id
        }))
        
        saveToHistory()
      } else {
        // Cancel the arrow if too small
        set({
          tempArrow: null,
          arrowDrawingState: 'idle'
        })
      }
    },
    
    cancelArrow: () => {
      set({
        tempArrow: null,
        arrowDrawingState: 'idle'
      })
    },
    
    deleteArrow: (id) => {
      set((state) => ({
        arrows: state.arrows.filter(arrow => arrow.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
      }))
      
      saveToHistory()
    },
    
    updateArrow: (id, updates) => {
      // First get the state before updating it
      const currentState = get();
      
      // Find the arrow to update
      const arrowToUpdate = currentState.arrows.find(a => a.id === id);
      
      if (!arrowToUpdate) {
        console.error("Arrow not found:", id);
        return;
      }
      
      console.log(`==========================================`);
      console.log(`🔄 ARROW UPDATE for ${id}:`, updates);
      
      // Special handling for color updates - log explicitly
      if (updates.color) {
        console.log(`🎨 ARROW COLOR UPDATE - Arrow ${id}: ${arrowToUpdate.color} → ${updates.color}`);
      }
      
      // Create a completely new arrow object with the updates
      const updatedArrow = {
        ...arrowToUpdate,
        ...updates
      };
      
      console.log("Updating arrow from:", arrowToUpdate);
      console.log("To:", updatedArrow);
      
      // Create a completely new array of arrows
      const updatedArrows = currentState.arrows.map(arrow => 
        arrow.id === id ? updatedArrow : arrow
      );
      
      // Update state in one operation - don't deselect the arrow
      set({
        arrows: updatedArrows,
        selectedElementId: currentState.selectedElementId // Maintain selection
      });
      
      // Save to history
      saveToHistory();
      
      console.log("Arrow update complete");
      console.log(`==========================================`);
    },
    
    // Text actions
    addText: (x, y, text) => {
      const newText: TextAnnotation = {
        id: nanoid(),
        x,
        y,
        text
      }
      
      set((state) => ({
        textAnnotations: [...state.textAnnotations, newText],
        selectedElementId: newText.id
      }))
      
      saveToHistory()
    },
    
    updateTextPosition: (id, x, y) => {
      set((state) => ({
        textAnnotations: state.textAnnotations.map(annotation => 
          annotation.id === id ? { ...annotation, x, y } : annotation
        )
      }))
      
      saveToHistory()
    },
    
    updateTextContent: (id, text) => {
      set((state) => ({
        textAnnotations: state.textAnnotations.map(annotation => 
          annotation.id === id ? { ...annotation, text } : annotation
        )
      }))
      
      saveToHistory()
    },
    
    deleteText: (id) => {
      set((state) => ({
        textAnnotations: state.textAnnotations.filter(annotation => annotation.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
      }))
      
      saveToHistory()
    },
    
    updateTextAnnotation: (id, updates) => {
      // First get the state before updating it
      const currentState = get();
      
      // Find the text to update
      const textToUpdate = currentState.textAnnotations.find(t => t.id === id);
      
      if (!textToUpdate) {
        console.error("Text annotation not found:", id);
        return;
      }
      
      console.log(`==========================================`);
      console.log(`🔄 TEXT UPDATE for ${id}:`, updates);
      
      // Create a completely new text object with the updates
      const updatedText = {
        ...textToUpdate,
        ...updates
      };
      
      console.log("Updating text from:", textToUpdate);
      console.log("To:", updatedText);
      
      // Create a completely new array of text annotations
      const updatedTexts = currentState.textAnnotations.map(text => 
        text.id === id ? updatedText : text
      );
      
      // Update state in one operation - don't deselect the text
      set({
        textAnnotations: updatedTexts,
        selectedElementId: currentState.selectedElementId // Maintain selection
      });
      
      // Save to history
      saveToHistory();
      
      console.log("Text update complete");
      console.log(`==========================================`);
    },
    
    // History actions
    canUndo: false,
    canRedo: false,
    
    undo: () => {
      if (currentHistoryIndex <= 0) return
      
      currentHistoryIndex--
      const previousState = history[currentHistoryIndex]
      
      set({
        players: previousState.players,
        arrows: previousState.arrows,
        textAnnotations: previousState.textAnnotations,
        canUndo: currentHistoryIndex > 0,
        canRedo: currentHistoryIndex < history.length - 1
      })
    },
    
    redo: () => {
      if (currentHistoryIndex >= history.length - 1) return
      
      currentHistoryIndex++
      const nextState = history[currentHistoryIndex]
      
      set({
        players: nextState.players,
        arrows: nextState.arrows,
        textAnnotations: nextState.textAnnotations,
        canUndo: currentHistoryIndex > 0,
        canRedo: currentHistoryIndex < history.length - 1
      })
    },
    
    // Utils
    clearAll: () => {
      set({
        players: [],
        arrows: [],
        textAnnotations: [],
        selectedElementId: null
      })
      
      saveToHistory()
    }
  }
}) 