"use client"

import React from "react"
import { useRef, useEffect, useState } from "react"
import { DndProvider, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { SoccerField } from "./soccer-field"
import { PlayerMarker } from "./player-marker"
import { ArrowMarker } from "./arrow-marker"
import { TextAnnotation } from "./text-annotation"
import { useEditorStore } from "@/store/useEditorStore"
import { useMobile } from "@/hooks/use-mobile"

// Add this at the top of the file, after the imports:
// This will help with performance by preventing unnecessary re-renders
const MemoizedArrowMarker = React.memo(ArrowMarker)
const MemoizedPlayerMarker = React.memo(PlayerMarker)
const MemoizedTextAnnotation = React.memo(TextAnnotation)

// Create a backend provider that switches between HTML5 and Touch backends
const DndBackendProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMobile()

  // Use TouchBackend with proper options for mobile, HTML5Backend for desktop
  // Fixed for iOS/iPad compatibility
  return (
    <DndProvider 
      backend={isMobile ? TouchBackend : HTML5Backend} 
      options={isMobile ? {
        enableMouseEvents: true,
        delayTouchStart: 100, // Increased delay for better compatibility
        ignoreContextMenu: true,
        touchSlop: 10, // More tolerance for touch movement
        enableTouchEvents: true,
        enableKeyboardEvents: true,
        enableHoverOutsideTarget: true
      } : undefined}
    >
      {children}
    </DndProvider>
  )
}

function TacticalBoardInner() {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)
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

  // Handle drop for players and text
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ["PLAYER", "TEXT"],
      drop: (item: { id: string; type: string }, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset()
        if (!delta) return

        const type = item.type
        const id = item.id

        if (type === "player") {
          const player = players.find((p) => p.id === id)
          if (player) {
            updatePlayer(id, {
              x: player.x + delta.x,
              y: player.y + delta.y,
            })
          }
        } else if (type === "text") {
          const text = textAnnotations.find((t) => t.id === id)
          if (text) {
            updateText(id, {
              x: text.x + delta.x,
              y: text.y + delta.y,
            })
          }
        }

        // Reset dragging state after drop
        setTimeout(() => {
          setIsDraggingElement(false)
        }, 50)
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [players, textAnnotations, updatePlayer, updateText],
  )

  // Connect the drop ref
  useEffect(() => {
    if (dropRef.current && typeof drop === 'function') {
      drop(dropRef.current)
    }
  }, [drop])

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

  // Listen for drag start and end events
  useEffect(() => {
    const handleDragStart = () => {
      setIsDraggingElement(true)
      setHoverPosition(null)
    }

    const handleDragEnd = () => {
      // We'll set this to false in the drop handler to ensure
      // we don't trigger a click right after a drop
      setTimeout(() => {
        setIsDraggingElement(false)
      }, 100)
    }

    // Add global event listeners
    window.addEventListener("dragstart", handleDragStart)
    window.addEventListener("dragend", handleDragEnd)

    // For touch devices
    window.addEventListener("touchstart", handleDragStart)
    window.addEventListener("touchend", handleDragEnd)

    return () => {
      window.removeEventListener("dragstart", handleDragStart)
      window.removeEventListener("dragend", handleDragEnd)
      window.removeEventListener("touchstart", handleDragStart)
      window.removeEventListener("touchend", handleDragEnd)
    }
  }, [])

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
      ref={(node) => {
        // Update our local ref first
        boardRef.current = node;
        dropRef.current = node;
      }}
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

      {/* Memoized components to optimize rendering */}
      {players.map((player) => (
        <MemoizedPlayerMarker key={player.id} player={player} onDragStart={() => setIsDraggingElement(true)} />
      ))}

      {textAnnotations.map((annotation) => (
        <MemoizedTextAnnotation key={annotation.id} annotation={annotation} onDragStart={() => setIsDraggingElement(true)} />
      ))}
    </div>
  )
}

export function TacticalBoard() {
  return (
    <DndBackendProvider>
      <TacticalBoardInner />
    </DndBackendProvider>
  )
}

