import { create } from "zustand"
import { StateCreator } from "zustand"
import { nanoid } from "nanoid"

import { 
  ArrowDrawingState, 
  ArrowStyle, 
  ArrowType, 
  EditorMode, 
  EditorState, 
  FormationType, 
  PlayerType, 
  TextAnnotationType 
} from "@/lib/types/editor"
import { loadTactic, saveTactic } from "@/lib/services/tactics"
import { createHistory, EditorHistory, redo, saveToHistory, undo } from "@/lib/utils/history"
import { generateId } from "@/lib/utils/editor"

interface EditorStore extends EditorState {
  // Actions
  setCanvasDimensions: (width: number, height: number) => void
  setMode: (mode: EditorMode) => void
  setSelectedTeam: (team: "home" | "away") => void
  setSelectedColor: (color: string) => void
  setSelectedPlayerNumber: (number: number) => void
  setSelectedArrowStyle: (style: ArrowStyle) => void
  setSelectedArrowWidth: (width: number) => void

  // Player actions
  addPlayer: (x: number, y: number) => void
  updatePlayer: (id: string, updates: Partial<Omit<PlayerType, "id">>) => void
  removePlayer: (id: string) => void

  // Arrow actions
  startArrow: (x: number, y: number) => void
  endArrow: (x: number, y: number) => void
  updateArrowControl: (x: number, y: number) => void
  completeArrow: () => void
  cancelArrow: () => void
  updateArrow: (id: string, updates: Partial<Omit<ArrowType, "id">>) => void
  removeArrow: (id: string) => void

  // Text actions
  addText: (x: number, y: number, text: string) => void
  updateText: (id: string, updates: Partial<Omit<TextAnnotationType, "id">>) => void
  removeText: (id: string) => void

  // Selection
  selectElement: (id: string | null) => void

  // Formation actions
  applyFormation: (formation: FormationType) => void

  // History actions
  saveToHistory: () => void
  undo: () => void
  redo: () => void

  // Tactic actions
  setTacticTitle: (title: string) => void
  setTacticDescription: (description: string) => void
  setIsPublic: (isPublic: boolean) => void
  saveTactic: () => Promise<string>
  loadTactic: (id: string) => Promise<void>
  resetEditor: () => void
}

// Initial history
const initialHistory = createHistory()

type EditorStoreCreator = StateCreator<EditorStore>

// Create the store
export const useEditorStore = create<EditorStore>((set, get) => ({
  // Canvas state
  canvasWidth: 0,
  canvasHeight: 0,

  // Elements
  players: [],
  arrows: [],
  textAnnotations: [],

  // Editor state
  mode: "select",
  selectedElementId: null,
  selectedTeam: "home",
  selectedColor: "#19B8A6", // Vibrant Teal
  selectedPlayerNumber: 1,
  selectedArrowStyle: "solid",
  selectedArrowWidth: 2,

  // Arrow drawing state
  arrowDrawingState: "idle",
  tempArrow: null,

  // History
  history: initialHistory,
  historyIndex: 0,

  // Tactic metadata
  tacticId: null,
  tacticTitle: "Untitled Tactic",
  tacticDescription: "",
  isPublic: false,

  // Actions
  setCanvasDimensions: (width: number, height: number) => set({ canvasWidth: width, canvasHeight: height }),
  
  setMode: (mode: EditorMode) => set({ mode }),
  
  setSelectedTeam: (team: "home" | "away") => set({ selectedTeam: team }),
  
  setSelectedColor: (color: string) => set({ selectedColor: color }),
  
  setSelectedPlayerNumber: (number: number) => set({ selectedPlayerNumber: number }),
  
  setSelectedArrowStyle: (style: ArrowStyle) => set({ selectedArrowStyle: style }),
  
  setSelectedArrowWidth: (width: number) => set({ selectedArrowWidth: width }),

  // Player actions
  addPlayer: (x: number, y: number) => {
    const { players, selectedTeam, selectedColor, selectedPlayerNumber, saveToHistory } = get()
    
    const newPlayers = [
      ...players,
      {
        id: generateId(),
        x,
        y,
        team: selectedTeam,
        color: selectedColor,
        number: selectedPlayerNumber,
      },
    ]
    
    set({ players: newPlayers })
    saveToHistory()
  },
  
  updatePlayer: (id: string, updates: Partial<Omit<PlayerType, "id">>) => {
    const { players, saveToHistory } = get()
    
    const newPlayers = players.map((player) =>
      player.id === id ? { ...player, ...updates } : player
    )
    
    set({ players: newPlayers })
    saveToHistory()
  },
  
  removePlayer: (id: string) => {
    const { players, selectedElementId, saveToHistory } = get()
    
    const newPlayers = players.filter((player) => player.id !== id)
    
    set({ 
      players: newPlayers,
      selectedElementId: selectedElementId === id ? null : selectedElementId 
    })
    
    saveToHistory()
  },

  // Arrow actions
  startArrow: (x: number, y: number) => {
    set({
      arrowDrawingState: "started",
      tempArrow: {
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        controlX: x,
        controlY: y,
      },
    })
  },
  
  endArrow: (x: number, y: number) => {
    const { tempArrow } = get()
    
    if (!tempArrow) return
    
    set({
      arrowDrawingState: "ended",
      tempArrow: {
        ...tempArrow,
        endX: x,
        endY: y,
      },
    })
  },
  
  updateArrowControl: (x: number, y: number) => {
    const { tempArrow, arrowDrawingState } = get()
    
    if (!tempArrow || arrowDrawingState !== "ended") return
    
    set({
      tempArrow: {
        ...tempArrow,
        controlX: x,
        controlY: y,
      },
    })
  },
  
  completeArrow: () => {
    const { tempArrow, arrows, selectedColor, selectedArrowStyle, selectedArrowWidth, saveToHistory } = get()
    
    if (!tempArrow) return
    
    const newArrow: ArrowType = {
      id: generateId(),
      startX: tempArrow.startX,
      startY: tempArrow.startY,
      endX: tempArrow.endX,
      endY: tempArrow.endY,
      controlX: tempArrow.controlX,
      controlY: tempArrow.controlY,
      color: selectedColor,
      style: selectedArrowStyle,
      width: selectedArrowWidth,
    }
    
    set({
      arrows: [...arrows, newArrow],
      arrowDrawingState: "idle",
      tempArrow: null,
    })
    
    saveToHistory()
  },
  
  cancelArrow: () => {
    set({
      arrowDrawingState: "idle",
      tempArrow: null,
    })
  },
  
  updateArrow: (id: string, updates: Partial<Omit<ArrowType, "id">>) => {
    const { arrows, saveToHistory } = get()
    
    const newArrows = arrows.map((arrow) =>
      arrow.id === id ? { ...arrow, ...updates } : arrow
    )
    
    set({ arrows: newArrows })
    saveToHistory()
  },
  
  removeArrow: (id: string) => {
    const { arrows, selectedElementId, saveToHistory } = get()
    
    const newArrows = arrows.filter((arrow) => arrow.id !== id)
    
    set({ 
      arrows: newArrows,
      selectedElementId: selectedElementId === id ? null : selectedElementId
    })
    
    saveToHistory()
  },

  // Text actions
  addText: (x: number, y: number, text: string) => {
    const { textAnnotations, selectedColor, saveToHistory } = get()
    
    const newText: TextAnnotationType = {
      id: generateId(),
      x,
      y,
      text,
      color: selectedColor,
      fontSize: 14,
    }
    
    set({ textAnnotations: [...textAnnotations, newText] })
    saveToHistory()
  },
  
  updateText: (id: string, updates: Partial<Omit<TextAnnotationType, "id">>) => {
    const { textAnnotations, saveToHistory } = get()
    
    const newTexts = textAnnotations.map((text) =>
      text.id === id ? { ...text, ...updates } : text
    )
    
    set({ textAnnotations: newTexts })
    saveToHistory()
  },
  
  removeText: (id: string) => {
    const { textAnnotations, selectedElementId, saveToHistory } = get()
    
    const newTexts = textAnnotations.filter((text) => text.id !== id)
    
    set({ 
      textAnnotations: newTexts,
      selectedElementId: selectedElementId === id ? null : selectedElementId  
    })
    
    saveToHistory()
  },

  // Selection
  selectElement: (id: string | null) => set({ selectedElementId: id }),

  // Formation actions
  applyFormation: (formation: FormationType) => {
    const { saveToHistory, selectedTeam, selectedColor } = get()
    
    // Convert Formation to Players with IDs
    const newPlayers = formation.players.map((player) => ({
      ...player,
      id: generateId(),
      team: selectedTeam,
      color: selectedColor,
    }))
    
    set({ players: newPlayers })
    saveToHistory()
  },

  // History actions
  saveToHistory: () => {
    const { players, arrows, textAnnotations, history, historyIndex } = get()
    
    const newHistory = saveToHistory(
      { ...history, historyIndex },
      players,
      arrows,
      textAnnotations
    )
    
    set({ history: newHistory, historyIndex: newHistory.historyIndex })
  },
  
  undo: () => {
    const { history, historyIndex } = get()
    const result = undo({ ...history, historyIndex })
    
    if (!result) return
    
    set({
      history: result.history,
      historyIndex: result.history.historyIndex,
      players: result.players,
      arrows: result.arrows,
      textAnnotations: result.textAnnotations,
    })
  },
  
  redo: () => {
    const { history, historyIndex } = get()
    const result = redo({ ...history, historyIndex })
    
    if (!result) return
    
    set({
      history: result.history,
      historyIndex: result.history.historyIndex,
      players: result.players,
      arrows: result.arrows,
      textAnnotations: result.textAnnotations,
    })
  },

  // Tactic actions
  setTacticTitle: (title: string) => set({ tacticTitle: title }),
  
  setTacticDescription: (description: string) => set({ tacticDescription: description }),
  
  setIsPublic: (isPublic: boolean) => set({ isPublic }),
  
  saveTactic: async () => {
    const { 
      tacticId, 
      tacticTitle, 
      tacticDescription, 
      isPublic, 
      players, 
      arrows, 
      textAnnotations 
    } = get()
    
    const id = await saveTactic({
      tacticId,
      title: tacticTitle,
      description: tacticDescription,
      isPublic,
      players,
      arrows, 
      textAnnotations
    })
    
    set({ tacticId: id })
    return id
  },
  
  loadTactic: async (id: string) => {
    const tactic = await loadTactic(id)
    
    if (!tactic) return
    
    set({
      tacticId: tactic.id,
      tacticTitle: tactic.title,
      tacticDescription: tactic.description,
      isPublic: tactic.isPublic,
      players: tactic.players,
      arrows: tactic.arrows,
      textAnnotations: tactic.textAnnotations,
      // Reset history
      history: {
        players: [tactic.players],
        arrows: [tactic.arrows],
        textAnnotations: [tactic.textAnnotations],
      },
      historyIndex: 0,
    })
  },
  
  resetEditor: () => {
    set({
      tacticId: null,
      tacticTitle: "Untitled Tactic",
      tacticDescription: "",
      isPublic: false,
      players: [],
      arrows: [],
      textAnnotations: [],
      history: createHistory(),
      selectedElementId: null,
    })
  },
})) 