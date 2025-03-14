export type PlayerType = {
  id: string
  x: number
  y: number
  number: number
  color: string
  label?: string
}

export type ArrowStyle = "solid" | "dashed" | "dotted"

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

export type ArrowDrawingState = "idle" | "started" | "ended" | "complete"

export interface EditorState {
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
} 