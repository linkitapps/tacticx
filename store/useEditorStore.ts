import { create } from "zustand"
import { nanoid } from "nanoid"
import { supabase } from "@/lib/supabase"

// Types
export type PlayerType = {
  id: string
  x: number
  y: number
  number: number
  color: string
  team: "home" | "away"
  label?: string
}

export type ArrowStyle = "solid" | "dashed" | "dotted"

// Simple three-point arrow type
export type ArrowType = {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  controlX: number // Single control point for the curve
  controlY: number
  color: string
  width: number
  style: ArrowStyle
  // Temporary properties for direct DOM manipulation
  _tempStartX?: number
  _tempStartY?: number
  _tempEndX?: number
  _tempEndY?: number
  _tempControlX?: number
  _tempControlY?: number
}

// Update the TextAnnotationType to include new styling properties
export type TextAnnotationType = {
  id: string
  x: number
  y: number
  text: string
  color: string
  fontSize: number
  isBold?: boolean
  isItalic?: boolean
  alignment?: "left" | "center" | "right"
}

export type FormationType = {
  name: string
  players: Omit<PlayerType, "id">[]
}

export type EditorMode = "select" | "player" | "arrow" | "text"

// Arrow drawing states
export type ArrowDrawingState = "idle" | "started" | "ended" | "complete"

// Add tacticDescription to the state interface
interface EditorState {
  // Canvas state
  canvasWidth: number
  canvasHeight: number

  // Elements
  players: PlayerType[]
  arrows: ArrowType[]
  textAnnotations: TextAnnotationType[]

  // Editor state
  mode: EditorMode
  selectedElementId: string | null
  selectedTeam: "home" | "away"
  selectedColor: string
  selectedPlayerNumber: number
  selectedArrowStyle: ArrowStyle
  selectedArrowWidth: number

  // Arrow drawing state
  arrowDrawingState: ArrowDrawingState
  tempArrow: {
    startX: number
    startY: number
    endX: number
    endY: number
    controlX: number
    controlY: number
  } | null

  // History
  history: {
    players: PlayerType[][]
    arrows: ArrowType[][]
    textAnnotations: TextAnnotationType[][]
  }
  historyIndex: number

  // Tactic metadata
  tacticId: string | null
  tacticTitle: string
  tacticDescription: string
  isPublic: boolean

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

// Add tacticDescription to the initial state
export const useEditorStore = create<EditorState>((set, get) => ({
  // Canvas state
  canvasWidth: 800,
  canvasHeight: 600,

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
  history: {
    players: [[]],
    arrows: [[]],
    textAnnotations: [[]],
  },
  historyIndex: 0,

  // Tactic metadata
  tacticId: null,
  tacticTitle: "Untitled Tactic",
  tacticDescription: "",
  isPublic: false,

  // Actions
  setCanvasDimensions: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

  setMode: (mode) => {
    // Cancel any in-progress arrow drawing when changing modes
    if (get().arrowDrawingState !== "idle") {
      get().cancelArrow()
    }
    set({ mode })
  },

  setSelectedTeam: (team) => set({ selectedTeam: team }),

  setSelectedColor: (color) => set({ selectedColor: color }),

  setSelectedPlayerNumber: (number) => set({ selectedPlayerNumber: number }),

  setSelectedArrowStyle: (style) => set({ selectedArrowStyle: style }),

  setSelectedArrowWidth: (width) => set({ selectedArrowWidth: width }),

  // Player actions
  addPlayer: (x, y) => {
    const { selectedTeam, selectedColor, selectedPlayerNumber, players } = get()

    const newPlayer: PlayerType = {
      id: nanoid(),
      x,
      y,
      number: selectedPlayerNumber,
      color: selectedColor,
      team: selectedTeam,
    }

    set({
      players: [...players, newPlayer],
      // Increment the selected player number for the next player
      selectedPlayerNumber: selectedPlayerNumber + 1,
    })
    get().saveToHistory()
  },

  updatePlayer: (id, updates) => {
    const { players } = get()
    const updatedPlayers = players.map((player) => (player.id === id ? { ...player, ...updates } : player))

    set({ players: updatedPlayers })
    get().saveToHistory()
  },

  removePlayer: (id) => {
    const { players } = get()
    set({
      players: players.filter((player) => player.id !== id),
      selectedElementId: null,
    })
    get().saveToHistory()
  },

  // Arrow actions
  startArrow: (x, y) => {
    // Initialize the arrow with start point
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

  endArrow: (x, y) => {
    const { tempArrow } = get()
    if (!tempArrow || get().arrowDrawingState !== "started") return

    // Set the end point and calculate a default control point
    const midX = (tempArrow.startX + x) / 2
    const midY = (tempArrow.startY + y) / 2

    // Calculate perpendicular offset for the control point
    const dx = x - tempArrow.startX
    const dy = y - tempArrow.startY
    const length = Math.sqrt(dx * dx + dy * dy)

    // Default control point is perpendicular to the line at the midpoint
    let controlX = midX
    let controlY = midY

    if (length > 0) {
      // Offset perpendicular to the line by 1/3 of the length
      controlX = midX - (dy * length) / 6 / length
      controlY = midY + (dx * length) / 6 / length
    }

    set({
      arrowDrawingState: "ended",
      tempArrow: {
        ...tempArrow,
        endX: x,
        endY: y,
        controlX,
        controlY,
      },
    })
  },

  updateArrowControl: (x, y) => {
    const { tempArrow } = get()
    if (!tempArrow || get().arrowDrawingState !== "ended") return

    // Update the control point
    set({
      tempArrow: {
        ...tempArrow,
        controlX: x,
        controlY: y,
      },
    })
  },

  completeArrow: () => {
    const { tempArrow, selectedColor, selectedArrowStyle, selectedArrowWidth, arrows } = get()
    if (!tempArrow || get().arrowDrawingState !== "ended") return

    // Create the final arrow
    const newArrow: ArrowType = {
      id: nanoid(),
      startX: tempArrow.startX,
      startY: tempArrow.startY,
      endX: tempArrow.endX,
      endY: tempArrow.endY,
      controlX: tempArrow.controlX,
      controlY: tempArrow.controlY,
      color: selectedColor,
      width: selectedArrowWidth,
      style: selectedArrowStyle,
    }

    // Add the arrow first
    const updatedArrows = [...arrows, newArrow]

    // Update state with new arrow and selection
    set({
      arrows: updatedArrows,
      arrowDrawingState: "idle",
      tempArrow: null,
      selectedElementId: newArrow.id,
      mode: "select", // Switch back to select mode after drawing
    })

    get().saveToHistory()
  },

  cancelArrow: () => {
    set({
      arrowDrawingState: "idle",
      tempArrow: null,
    })
  },

  updateArrow: (id, updates) => {
    // Skip state updates during dragging if we're using direct DOM manipulation
    if (
      updates._tempStartX !== undefined ||
      updates._tempStartY !== undefined ||
      updates._tempEndX !== undefined ||
      updates._tempEndY !== undefined ||
      updates._tempControlX !== undefined ||
      updates._tempControlY !== undefined
    ) {
      return
    }

    const { arrows, selectedElementId } = get()

    // Create a new arrows array with the updated arrow
    const updatedArrows = arrows.map((arrow) => (arrow.id === id ? { ...arrow, ...updates } : arrow))

    // Update the state with minimal changes
    set({
      arrows: updatedArrows,
      // Ensure we keep the selection after updating
      selectedElementId: id,
    })
  },

  removeArrow: (id) => {
    const { arrows } = get()
    set({
      arrows: arrows.filter((arrow) => arrow.id !== id),
      selectedElementId: null,
    })
    get().saveToHistory()
  },

  // Text actions
  addText: (x, y, text) => {
    const { selectedColor, textAnnotations } = get()

    const newText: TextAnnotationType = {
      id: nanoid(),
      x,
      y,
      text,
      color: selectedColor,
      fontSize: 16,
    }

    set({
      textAnnotations: [...textAnnotations, newText],
      selectedElementId: newText.id,
    })
    get().saveToHistory()
  },

  updateText: (id, updates) => {
    const { textAnnotations } = get()
    const updatedTexts = textAnnotations.map((text) => (text.id === id ? { ...text, ...updates } : text))

    set({ textAnnotations: updatedTexts })
    get().saveToHistory()
  },

  removeText: (id) => {
    const { textAnnotations } = get()
    set({
      textAnnotations: textAnnotations.filter((text) => text.id !== id),
      selectedElementId: null,
    })
    get().saveToHistory()
  },

  // Selection
  selectElement: (id) => {
    // If we're selecting the same element, do nothing
    if (get().selectedElementId === id) return

    // Set the selected element ID
    set({ selectedElementId: id })

    // If we're in arrow mode and selecting an element, switch to select mode
    if (get().mode !== "select" && id !== null) {
      set({ mode: "select" })
    }
  },

  // Formation actions
  applyFormation: (formation) => {
    const { selectedTeam, selectedColor, canvasWidth, canvasHeight } = get()

    // Clear existing players for the selected team
    const filteredPlayers = get().players.filter((player) => player.team !== selectedTeam)

    // Create new players based on formation
    const newPlayers = formation.players.map((player) => {
      // For home team: place in left half (0 to canvasWidth/2)
      // For away team: place in right half (canvasWidth/2 to canvasWidth)
      const xPosition =
        selectedTeam === "home"
          ? player.x * (canvasWidth / 2) // Scale to left half for home team
          : canvasWidth - player.x * (canvasWidth / 2) // Scale to right half for away team

      return {
        ...player,
        id: nanoid(),
        team: selectedTeam,
        color: selectedColor,
        // Scale positions to canvas size with team-specific positioning
        x: xPosition,
        y: player.y * canvasHeight,
      }
    })

    set({ players: [...filteredPlayers, ...newPlayers] })
    get().saveToHistory()
  },

  // History actions
  saveToHistory: () => {
    const { players, arrows, textAnnotations, history, historyIndex } = get()

    // Create new history entries
    const newPlayersHistory = [...history.players.slice(0, historyIndex + 1), [...players]]
    const newArrowsHistory = [...history.arrows.slice(0, historyIndex + 1), [...arrows]]
    const newTextHistory = [...history.textAnnotations.slice(0, historyIndex + 1), [...textAnnotations]]

    set({
      history: {
        players: newPlayersHistory,
        arrows: newArrowsHistory,
        textAnnotations: newTextHistory,
      },
      historyIndex: historyIndex + 1,
    })
  },

  undo: () => {
    const { history, historyIndex } = get()

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        players: [...history.players[newIndex]],
        arrows: [...history.arrows[newIndex]],
        textAnnotations: [...history.textAnnotations[newIndex]],
        historyIndex: newIndex,
      })
    }
  },

  redo: () => {
    const { history, historyIndex } = get()

    if (historyIndex < history.players.length - 1) {
      const newIndex = historyIndex + 1
      set({
        players: [...history.players[newIndex]],
        arrows: [...history.arrows[newIndex]],
        textAnnotations: [...history.textAnnotations[newIndex]],
        historyIndex: newIndex,
      })
    }
  },

  // Tactic actions
  setTacticTitle: (title) => set({ tacticTitle: title }),

  // Add the setTacticDescription action
  setTacticDescription: (description) => set({ tacticDescription: description }),

  setIsPublic: (isPublic) => set({ isPublic }),

  // Update saveTactic to include description
  saveTactic: async () => {
    const { players, arrows, textAnnotations, tacticId, tacticTitle, tacticDescription, isPublic } = get()

    const tacticData = {
      title: tacticTitle,
      description: tacticDescription,
      pitch_data: {
        players,
        arrows,
        textAnnotations,
      },
      visibility: isPublic ? "public" : "private",
    }

    try {
      let id = tacticId

      if (id) {
        // Update existing tactic
        const { error } = await supabase.from("tactics").update(tacticData).eq("id", id)

        if (error) throw error
      } else {
        // Create new tactic
        const { data, error } = await supabase.from("tactics").insert(tacticData).select("id").single()

        if (error) throw error
        id = data.id
        set({ tacticId: id })
      }

      if (!id) {
        throw new Error("Failed to save tactic: No ID returned")
      }

      return id
    } catch (error) {
      console.error("Error saving tactic:", error)
      throw error
    }
  },

  // Update loadTactic to load description
  loadTactic: async (id) => {
    try {
      const { data, error } = await supabase.from("tactics").select("*").eq("id", id).single()

      if (error) throw error

      if (data) {
        set({
          tacticId: data.id,
          tacticTitle: data.title,
          tacticDescription: data.description || "",
          isPublic: data.visibility === "public",
          players: data.pitch_data.players || [],
          arrows: data.pitch_data.arrows || [],
          textAnnotations: data.pitch_data.textAnnotations || [],
        })

        // Reset history
        get().saveToHistory()
      }
    } catch (error) {
      console.error("Error loading tactic:", error)
      throw error
    }
  },

  // Update resetEditor to reset description
  resetEditor: () => {
    set({
      players: [],
      arrows: [],
      textAnnotations: [],
      tacticId: null,
      tacticTitle: "Untitled Tactic",
      tacticDescription: "",
      isPublic: false,
      history: {
        players: [[]],
        arrows: [[]],
        textAnnotations: [[]],
      },
      historyIndex: 0,
    })
  },
}))

