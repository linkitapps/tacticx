import { nanoid } from "nanoid"
import { ArrowType, PlayerType, TextAnnotationType } from "@/lib/types/editor"

/**
 * Generate a unique ID for elements
 */
export function generateId(): string {
  return nanoid(10)
}

/**
 * Calculate the midpoint between two points
 */
export function calculateMidpoint(x1: number, y1: number, x2: number, y2: number): { x: number, y: number } {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  }
}

/**
 * Check if a point is inside a player element
 */
export function isPointInsidePlayer(x: number, y: number, player: PlayerType, playerRadius: number): boolean {
  const dx = x - player.x
  const dy = y - player.y
  return dx * dx + dy * dy <= playerRadius * playerRadius
}

/**
 * Check if a point is near an arrow (for selection)
 */
export function isPointNearArrow(
  x: number, 
  y: number, 
  arrow: ArrowType,
  threshold: number = 8
): boolean {
  // Simplified implementation - check distance to the bezier curve
  // For production code, you'd want a more accurate curve distance calculation
  const points = [
    { x: arrow.startX, y: arrow.startY },
    { x: arrow.controlX, y: arrow.controlY },
    { x: arrow.endX, y: arrow.endY },
  ]
  
  // Check distance to each segment of the bezier approximation
  for (let i = 0; i < points.length - 1; i++) {
    const dist = distanceToLineSegment(
      x, y,
      points[i].x, points[i].y,
      points[i + 1].x, points[i + 1].y
    )
    if (dist < threshold) return true
  }
  
  return false
}

/**
 * Calculate distance from point to line segment
 */
function distanceToLineSegment(
  px: number, py: number,
  x1: number, y1: number, 
  x2: number, y2: number
): number {
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1
  
  if (lenSq !== 0) param = dot / lenSq
  
  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  const dx = px - xx
  const dy = py - yy
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Check if a point is inside a text annotation (for selection)
 */
export function isPointInsideText(
  x: number, 
  y: number, 
  text: TextAnnotationType, 
  padding: number = 10
): boolean {
  // Estimate text width based on content and font size
  // This is an approximation - for production use a more accurate measurement
  const textWidth = text.text.length * (text.fontSize * 0.6)
  const textHeight = text.fontSize * 1.2
  
  return (
    x >= text.x - padding && 
    x <= text.x + textWidth + padding && 
    y >= text.y - padding && 
    y <= text.y + textHeight + padding
  )
}

/**
 * Create a deep clone of an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
} 