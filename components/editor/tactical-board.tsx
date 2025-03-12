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
        delayTouchStart: 0, // Reduced delay for better iPad responsiveness
        ignoreContextMenu: true
      } : undefined}
    >
      {children}
    </DndProvider>
  )
}

function TacticalBoardInner() {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
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

  // Get coordinates from either mouse or touch event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!boardRef.current) return { x: 0, y: 0 }

    const rect = boardRef.current.getBoundingClientRect()

    // Handle touch event
    if ("touches" in e) {
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    // Handle mouse event
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // Handle board interaction (click or touch)
  const handleBoardInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't add elements if we're in the middle of a drag operation
    if (isDraggingElement) return

    const { x, y } = getCoordinates(e)

    if (mode === "player") {
      addPlayer(x, y)
    } else if (mode === "text") {
      addText(x, y, "Text")
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
      }
    } else if (mode === "select") {
      // Only clear selection when clicking on empty space in select mode
      // Make sure this is a direct click on the board, not a bubbled event
      if (e.target === boardRef.current || e.target === svgRef.current) {
        selectElement(null)
      }
    }
  }

  // Handle mouse/touch move for arrow drawing
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== "arrow" || arrowDrawingState !== "ended") return

    const { x, y } = getCoordinates(e)
    updateArrowControl(x, y)
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

  // Create a ref callback that both connects the drop target and updates our boardRef
  const setDropTargetRef = (node: HTMLDivElement | null) => {
    // Apply the drop ref
    const dropResult = drop(node);
    // Update our local ref
    boardRef.current = node;
    // Return the result
    return dropResult;
  };

  return (
    <div
      ref={setDropTargetRef}
      className="relative touch-none"
      onClick={handleBoardInteraction}
      onTouchStart={isMobile ? handleBoardInteraction : undefined}
      onMouseMove={handlePointerMove}
      onTouchMove={isMobile ? handlePointerMove : undefined}
    >
      <SoccerField />

      <svg ref={svgRef} className="absolute top-0 left-0 pointer-events-auto" width={canvasWidth} height={canvasHeight}>
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
            />
            <line
              x1={tempArrow.endX}
              y1={tempArrow.endY}
              x2={tempArrow.controlX}
              y2={tempArrow.controlY}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
            <circle
              cx={tempArrow.controlX}
              cy={tempArrow.controlY}
              r={6}
              fill="#4CAF50"
              stroke="white"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      {players.map((player) => (
        <PlayerMarker key={player.id} player={player} onDragStart={() => setIsDraggingElement(true)} />
      ))}

      {textAnnotations.map((annotation) => (
        <TextAnnotation key={annotation.id} annotation={annotation} onDragStart={() => setIsDraggingElement(true)} />
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

