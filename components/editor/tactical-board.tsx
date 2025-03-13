"use client"

import React from "react"
import { useRef, useEffect, useState } from "react"
import { SoccerField } from "./soccer-field"
import { PlayerMarker } from "./player-marker"
import { ArrowMarker } from "./arrow-marker"
import { TextAnnotation } from "./text-annotation"
import { useEditorStore } from "@/store/useEditorStore"
import { useMobile } from "@/hooks/use-mobile"

// This will help with performance by preventing unnecessary re-renders
const MemoizedArrowMarker = React.memo(ArrowMarker)
const MemoizedPlayerMarker = React.memo(PlayerMarker)
const MemoizedTextAnnotation = React.memo(TextAnnotation)

export function TacticalBoard() {
  const isMobile = useMobile()
  
  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <TacticalBoardInner />
    </div>
  )
}

function TacticalBoardInner() {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const [hoverPosition, setHoverPosition] = useState<{x: number, y: number} | null>(null)
  const isMobile = useMobile()

  const {
    canvasWidth,
    canvasHeight,
    players,
    arrows,
    textAnnotations,
    mode,
    selectedElementId,
    arrowDrawingState,
    tempArrow,
    addPlayer,
    updatePlayer,
    updateText,
    startArrow,
    endArrow,
    updateArrowControl,
    completeArrow,
    addText,
    selectElement,
  } = useEditorStore()

  // Get coordinates from either mouse or touch event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!boardRef.current) return { x: 0, y: 0 }

    const rect = boardRef.current.getBoundingClientRect()

    // Handle touch event
    if ("touches" in e && e.touches.length > 0) {
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    // Handle mouse event
    if ("clientX" in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    // Default fallback
    return { x: 0, y: 0 }
  }

  // Handle mouse move for showing placement previews
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode === "arrow" && arrowDrawingState === "ended") {
      const { x, y } = getCoordinates(e)
      updateArrowControl(x, y)
    }
    
    // Update hover position for placement previews
    if ((mode === "player" || mode === "text") && !isDraggingElement) {
      const { x, y } = getCoordinates(e)
      setHoverPosition({ x, y })
    } else if (mode === "select" || mode === "arrow" || isDraggingElement) {
      setHoverPosition(null)
    }
  }

  // Handle board interaction (click or touch)
  const handleBoardInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't add elements if we're in the middle of a drag operation
    if (isDraggingElement) return

    const { x, y } = getCoordinates(e)

    if (mode === "player") {
      addPlayer(x, y)
      // Add haptic feedback for touch devices if available
      if (isMobile && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(50)
        } catch (err) {
          console.warn("Vibration not supported", err)
        }
      }
    } else if (mode === "text") {
      addText(x, y, "Text")
      // Add haptic feedback for touch devices if available
      if (isMobile && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate(50)
        } catch (err) {
          console.warn("Vibration not supported", err)
        }
      }
    } else if (mode === "arrow") {
      // Handle arrow drawing state
      if (arrowDrawingState === "idle") {
        // Start drawing arrow
        startArrow(x, y)
      } else if (arrowDrawingState === "started") {
        // Set end point
        endArrow(x, y)
      } else if (arrowDrawingState === "ended") {
        // Complete the arrow
        completeArrow()
        // Add haptic feedback for touch devices if available
        if (isMobile && window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate(50)
          } catch (err) {
            console.warn("Vibration not supported", err)
          }
        }
      }
    } else if (mode === "select") {
      // Only clear selection when clicking on empty space in select mode
      // Make sure this is a direct click on the board, not a bubbled event
      if (e.target === boardRef.current || e.target === svgRef.current) {
        selectElement(null)
      }
    }
  }

  // Update SVG dimensions when canvas size changes
  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.setAttribute("width", canvasWidth.toString())
      svgRef.current.setAttribute("height", canvasHeight.toString())
    }
  }, [canvasWidth, canvasHeight])

  // Listen for drag start and end events from children
  const handleDragStart = () => {
    setIsDraggingElement(true)
    setHoverPosition(null)
  }

  const handleDragEnd = () => {
    // Delay resetting the dragging state to prevent accidental interactions
    setTimeout(() => {
      setIsDraggingElement(false)
    }, 50)
  }

  // Draw the current arrow being created
  const getTempArrowPath = () => {
    if (!tempArrow) return ""

    if (arrowDrawingState === "started") {
      // Just a straight line from start to current mouse position
      return `M ${tempArrow.startX} ${tempArrow.startY} L ${tempArrow.endX} ${tempArrow.endY}`
    } else if (arrowDrawingState === "ended") {
      // Curved line using the control point
      return `M ${tempArrow.startX} ${tempArrow.startY} Q ${tempArrow.controlX} ${tempArrow.controlY} ${tempArrow.endX} ${tempArrow.endY}`
    }

    return ""
  }

  // Get the tool cursor based on current mode
  const getToolCursor = () => {
    switch (mode) {
      case "player":
        return "cursor-cell"
      case "text":
        return "cursor-text"
      case "arrow":
        return arrowDrawingState === "idle" ? "cursor-crosshair" : "cursor-move"
      default:
        return "cursor-default"
    }
  }

  return (
    <div
      ref={boardRef}
      className={`relative touch-none transition-all duration-150 ${getToolCursor()} ${isDraggingElement ? 'cursor-grabbing' : ''} ${mode === 'select' ? 'cursor-pointer' : ''}`}
      onClick={handleBoardInteraction}
      onTouchStart={isMobile ? handleBoardInteraction : undefined}
      onMouseMove={handleMouseMove}
      onTouchMove={isMobile ? handleMouseMove : undefined}
    >
      <SoccerField />

      <svg ref={svgRef} className="absolute top-0 left-0 pointer-events-auto" width={canvasWidth} height={canvasHeight}>
        {/* Element placement previews */}
        {hoverPosition && mode === "player" && !isDraggingElement && (
          <circle
            cx={hoverPosition.x}
            cy={hoverPosition.y}
            r={18}
            fill={useEditorStore.getState().selectedColor}
            fillOpacity={0.4}
            stroke={useEditorStore.getState().selectedColor}
            strokeWidth={2}
            strokeOpacity={0.6}
            strokeDasharray="4 2"
            className="animate-pulse"
          />
        )}
        
        {hoverPosition && mode === "text" && !isDraggingElement && (
          <rect
            x={hoverPosition.x - 30}
            y={hoverPosition.y - 12}
            width={60}
            height={24}
            fill={useEditorStore.getState().selectedColor}
            fillOpacity={0.2}
            stroke={useEditorStore.getState().selectedColor}
            strokeWidth={1}
            strokeOpacity={0.6}
            strokeDasharray="4 2"
            rx={4}
            className="animate-pulse"
          />
        )}

        {/* Existing arrows - using memoized component */}
        {arrows.map((arrow) => (
          <MemoizedArrowMarker key={arrow.id} arrow={arrow} />
        ))}

        {/* Temporary arrow being drawn */}
        {tempArrow && (
          <path
            d={getTempArrowPath()}
            stroke={useEditorStore.getState().selectedColor}
            strokeWidth={useEditorStore.getState().selectedArrowWidth}
            strokeDasharray={
              useEditorStore.getState().selectedArrowStyle === "dashed"
                ? `${useEditorStore.getState().selectedArrowWidth * 3} ${useEditorStore.getState().selectedArrowWidth * 2}`
                : useEditorStore.getState().selectedArrowStyle === "dotted"
                  ? `${useEditorStore.getState().selectedArrowWidth} ${useEditorStore.getState().selectedArrowWidth * 2}`
                  : "none"
            }
            fill="none"
            className="transition-all duration-150 ease-out"
            filter="drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))"
          />
        )}

        {/* Control point for temp arrow */}
        {tempArrow && arrowDrawingState === "ended" && (
          <>
            <line
              x1={tempArrow.startX}
              y1={tempArrow.startY}
              x2={tempArrow.controlX}
              y2={tempArrow.controlY}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 2"
              className="transition-all duration-150 ease-out"
            />
            <line
              x1={tempArrow.endX}
              y1={tempArrow.endY}
              x2={tempArrow.controlX}
              y2={tempArrow.controlY}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 2"
              className="transition-all duration-150 ease-out"
            />
            <circle
              cx={tempArrow.controlX}
              cy={tempArrow.controlY}
              r={6}
              fill="#4CAF50"
              stroke="white"
              strokeWidth={2}
              className="animate-pulse transition-all duration-150 ease-out"
              filter="drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))"
            />
          </>
        )}
      </svg>

      {/* Dynamic tooltip helper for current mode */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full transition-opacity duration-300 ${isMobile ? mode !== 'select' ? 'opacity-70' : 'opacity-0' : 'opacity-0'}`}>
        {mode === 'player' && 'Tap to place player'}
        {mode === 'text' && 'Tap to add text'}
        {mode === 'arrow' && arrowDrawingState === 'idle' && 'Tap to start arrow'}
        {mode === 'arrow' && arrowDrawingState === 'started' && 'Tap to set endpoint'}
        {mode === 'arrow' && arrowDrawingState === 'ended' && 'Drag to adjust curve, tap to finish'}
      </div>

      {/* Player markers with new drag handlers */}
      {players.map((player) => (
        <MemoizedPlayerMarker 
          key={player.id} 
          player={player} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      ))}

      {/* Text annotations - to be updated in a similar way */}
      {textAnnotations.map((annotation) => (
        <MemoizedTextAnnotation key={annotation.id} annotation={annotation} onDragStart={handleDragStart} />
      ))}
    </div>
  )
}

