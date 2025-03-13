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
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0A1F14] to-[#071A10] rounded-lg">
      <div className="h-full w-full flex items-center justify-center">
        <TacticalBoardInner />
      </div>
    </div>
  )
}

function TacticalBoardInner() {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const [hoverPosition, setHoverPosition] = useState<{x: number, y: number} | null>(null)
  const isMobile = useMobile()
  const [boardInitialized, setBoardInitialized] = useState(false)
  const svgDimensionsUpdatedRef = useRef(false)

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

  // Initialize the board and make sure SVG has proper dimensions
  useEffect(() => {
    if (!boardRef.current) return;
    
    // Only set SVG dimensions once and then stop updating
    // This prevents dimension-related re-render loops
    if (!boardInitialized && svgRef.current && canvasWidth > 100 && canvasHeight > 100) {
      console.log("Initializing TacticalBoard SVG with dimensions:", canvasWidth, canvasHeight);
      
      // Use fixed dimensions for the SVG that are reasonable
      const width = Math.min(Math.max(canvasWidth, 300), 1200);
      const height = Math.min(Math.max(canvasHeight, 200), 800);
      
      svgRef.current.setAttribute("width", String(width));
      svgRef.current.setAttribute("height", String(height));
      setBoardInitialized(true);
      svgDimensionsUpdatedRef.current = true;
    }
  }, [canvasWidth, canvasHeight, boardInitialized]);

  // Update SVG dimensions when canvas size changes, but limit frequency
  useEffect(() => {
    if (!svgRef.current || !boardInitialized) return;
    
    // Skip updating if we recently updated dimensions
    if (svgDimensionsUpdatedRef.current) return;
    
    // Only update if dimensions are valid and significantly different
    if (canvasWidth > 100 && canvasHeight > 100) {
      const currentWidth = parseInt(svgRef.current.getAttribute("width") || "0");
      const currentHeight = parseInt(svgRef.current.getAttribute("height") || "0");
      
      // Only update if dimensions have changed significantly
      const significantWidthChange = Math.abs(currentWidth - canvasWidth) > 50;
      const significantHeightChange = Math.abs(currentHeight - canvasHeight) > 50;
      
      if (significantWidthChange || significantHeightChange) {
        console.log("Updating TacticalBoard SVG dimensions:", canvasWidth, canvasHeight);
        
        // Use fixed dimensions for the SVG that are reasonable
        const width = Math.min(Math.max(canvasWidth, 300), 1200);
        const height = Math.min(Math.max(canvasHeight, 200), 800);
        
        svgRef.current.setAttribute("width", String(width));
        svgRef.current.setAttribute("height", String(height));
        
        // Prevent further updates for a while
        svgDimensionsUpdatedRef.current = true;
        setTimeout(() => {
          svgDimensionsUpdatedRef.current = false;
        }, 1000);
      }
    }
  }, [canvasWidth, canvasHeight, boardInitialized])

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

  // Handle mouse move for showing placement previews and arrow drawing
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e)
    
    // Update the arrow end point during drawing process
    if (mode === "arrow" && arrowDrawingState === "started") {
      // Update the temporary arrow's end position to follow the pointer/touch
      if (tempArrow) {
        // Update the end point and control point to follow cursor
        const startX = tempArrow.startX
        const startY = tempArrow.startY
        const endX = x
        const endY = y
        
        // Set control point to a reasonable default between start and end
        const controlX = (startX + endX) / 2
        const controlY = (startY + endY) / 2 - 30 // Offset to create a slight curve
        
        useEditorStore.setState({
          tempArrow: {
            ...tempArrow,
            endX,
            endY,
            controlX,
            controlY
          }
        })
      }
    } else if (mode === "arrow" && arrowDrawingState === "ended") {
      // Update control point during the adjust phase
      updateArrowControl(x, y)
    }
    
    // Update hover position for placement previews
    if ((mode === "player" || mode === "text") && !isDraggingElement) {
      setHoverPosition({ x, y })
    } else if (mode === "select" || isDraggingElement) {
      setHoverPosition(null)
    }
  }

  // Handle board interaction (click or touch)
  const handleBoardInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't add elements if we're in the middle of a drag operation
    if (isDraggingElement) return

    // For touch events, prevent default behavior when in arrow mode
    if ("touches" in e && mode === "arrow") {
      e.preventDefault();
    }

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
      // Simplified arrow drawing process - just 2 steps
      if (arrowDrawingState === "idle") {
        // Start drawing arrow
        startArrow(x, y)
        
        // Initialize with the same start and end point
        if (tempArrow) {
          useEditorStore.setState({
            tempArrow: {
              ...tempArrow,
              endX: x,
              endY: y,
              controlX: x,
              controlY: y - 30 // Slight offset so control point is not directly on the line
            },
            arrowDrawingState: "started"
          })
        }
        
        // Add haptic feedback
        if (isMobile && window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate(30)
          } catch (err) {
            console.warn("Vibration not supported", err)
          }
        }
      } else if (arrowDrawingState === "started") {
        // Place end point and complete the arrow in one step
        endArrow(x, y)
        completeArrow()
        
        // Auto-switch to select mode to allow immediate editing
        useEditorStore.setState({ mode: "select" })
        
        // Add haptic feedback
        if (isMobile && window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate([30, 50])
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

  // Watch for mode changes to auto-complete any in-progress arrow
  useEffect(() => {
    // If we switch away from arrow mode while drawing, complete the arrow
    if (mode !== "arrow" && arrowDrawingState !== "idle" && tempArrow) {
      // Only complete if we've actually positioned the endpoints (not just a click)
      if (
        arrowDrawingState === "started" && 
        tempArrow.startX !== tempArrow.endX && 
        tempArrow.startY !== tempArrow.endY
      ) {
        completeArrow()
      } else {
        // Cancel the arrow if it was just started but not positioned
        useEditorStore.setState({
          tempArrow: null,
          arrowDrawingState: "idle"
        })
      }
    }
  }, [mode, arrowDrawingState, tempArrow, completeArrow])

  // Draw the current arrow being created
  const getTempArrowPath = () => {
    if (!tempArrow) return ""

    if (arrowDrawingState === "started") {
      // Show a curved line during drawing
      return `M ${tempArrow.startX} ${tempArrow.startY} Q ${tempArrow.controlX} ${tempArrow.controlY} ${tempArrow.endX} ${tempArrow.endY}`
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
        return "cursor-crosshair" // Always use crosshair for arrow tool, regardless of state
      case "select":
        return isDraggingElement ? "cursor-grabbing" : "cursor-pointer"
      default:
        return "cursor-default"
    }
  }

  return (
    <div
      ref={boardRef}
      className={`relative transition-all duration-150 ${getToolCursor()}`}
      onClick={handleBoardInteraction}
      onTouchStart={isMobile ? handleBoardInteraction : undefined}
      onMouseMove={handleMouseMove}
      onTouchMove={(e) => {
        if (isMobile) {
          // Only prevent scrolling when actively drawing/editing arrows
          if (mode === "arrow" && arrowDrawingState !== "idle") {
            e.preventDefault();
          }
          handleMouseMove(e);
        }
      }}
      style={{ 
        touchAction: (mode === "arrow" && arrowDrawingState !== "idle") ? "none" : "auto", 
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "300px", // Ensure a minimum height
        cursor: mode === "arrow" ? "crosshair" : undefined, // Ensure arrow tool gets crosshair cursor in CSS as well
      }}
    >
      <SoccerField />

      <svg 
        ref={svgRef} 
        className="absolute top-0 left-0 pointer-events-auto" 
        width={canvasWidth || 800} 
        height={canvasHeight || 600}
        preserveAspectRatio="xMidYMid meet"
        style={{
          cursor: mode === "arrow" ? "crosshair" : "inherit" // Also set cursor on SVG element
        }}
      >
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

        {/* Arrow markers for arrowheads */}
        <defs>
          {arrows.map(arrow => (
            <marker
              key={`marker-${arrow.id}`}
              id={`arrowhead-${arrow.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={arrow.color} />
            </marker>
          ))}
        </defs>

        {/* Existing arrows - rendered as SVG paths for visual appearance only */}
        {arrows.map((arrow) => (
          <path
            key={`arrow-path-${arrow.id}`}
            d={`M ${arrow.startX} ${arrow.startY} Q ${arrow.controlX} ${arrow.controlY} ${arrow.endX} ${arrow.endY}`}
            stroke={arrow.color}
            strokeWidth={arrow.width}
            strokeDasharray={
              arrow.style === "dashed"
                ? `${arrow.width * 3} ${arrow.width * 2}`
                : arrow.style === "dotted"
                  ? `${arrow.width} ${arrow.width * 2}`
                  : "none"
            }
            fill="none"
            markerEnd={`url(#arrowhead-${arrow.id})`}
            pointerEvents="none"
          />
        ))}

        {/* Temporary arrow being drawn - with arrowhead */}
        {tempArrow && (
          <>
            <defs>
              <marker
                id="temp-arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={useEditorStore.getState().selectedColor} />
              </marker>
            </defs>
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
              markerEnd="url(#temp-arrowhead)"
            />
          </>
        )}

        {/* Control point for temp arrow - only show in ended state */}
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
              r={isMobile ? 15 : 8}
              fill="#4CAF50"
              stroke="white"
              strokeWidth={2}
              className="animate-pulse transition-all duration-150 ease-out pointer-events-auto"
              filter="drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))"
              style={{ cursor: "move", touchAction: "none" }}
              onTouchStart={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  e.stopPropagation();
                  const touch = e.touches[0];
                  const rect = boardRef.current!.getBoundingClientRect();
                  updateArrowControl(
                    touch.clientX - rect.left, 
                    touch.clientY - rect.top
                  );
                }
              }}
              onTouchMove={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  e.stopPropagation();
                  const touch = e.touches[0];
                  const rect = boardRef.current!.getBoundingClientRect();
                  updateArrowControl(
                    touch.clientX - rect.left, 
                    touch.clientY - rect.top
                  );
                }
              }}
            />
            
            {/* Finish button for completing the arrow */}
            <foreignObject
              x={tempArrow.controlX - (isMobile ? 30 : 20)}
              y={tempArrow.controlY + (isMobile ? 25 : 15)}
              width={isMobile ? 60 : 40}
              height={isMobile ? 30 : 20}
            >
              <div
                className={`bg-green-500 text-white text-xs text-center rounded px-1 py-0.5 cursor-pointer ${isMobile ? 'text-sm py-1' : ''}`}
                style={{ 
                  boxShadow: "0 0 8px rgba(0, 0, 0, 0.5)",
                  userSelect: "none"
                }}
                onClick={completeArrow}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  completeArrow();
                }}
              >
                Done
              </div>
            </foreignObject>
          </>
        )}
        
        {/* Indicator for starting an arrow - improved instructions */}
        {mode === "arrow" && arrowDrawingState === "idle" && (
          <foreignObject
            x={10}
            y={10}
            width={isMobile ? 250 : 200}
            height={30}
          >
            <div
              className={`bg-black/60 backdrop-blur-sm text-white text-xs rounded px-2 py-1 ${isMobile ? 'text-sm' : ''}`}
            >
              Tap to place start, then tap to finish arrow
            </div>
          </foreignObject>
        )}
        
        {/* Indicator for placing end point */}
        {mode === "arrow" && arrowDrawingState === "started" && (
          <foreignObject
            x={10}
            y={10}
            width={isMobile ? 250 : 200}
            height={30}
          >
            <div
              className={`bg-black/60 backdrop-blur-sm text-white text-xs rounded px-2 py-1 ${isMobile ? 'text-sm' : ''}`}
            >
              Now tap to set the end point
            </div>
          </foreignObject>
        )}
      </svg>

      {/* Interactive components for arrows - separated from SVG for better touch handling */}
      {arrows.map((arrow) => (
        <MemoizedArrowMarker 
          key={arrow.id} 
          arrow={arrow} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd} 
        />
      ))}

      {/* Dynamic tooltip helper for current mode */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full transition-opacity duration-300 ${isMobile ? mode !== 'select' ? 'opacity-70' : 'opacity-0' : 'opacity-0'}`}>
        {mode === 'player' && 'Tap to place player'}
        {mode === 'text' && 'Tap to add text'}
        {mode === 'arrow' && arrowDrawingState === 'idle' && 'Tap to start arrow'}
        {mode === 'arrow' && arrowDrawingState === 'started' && 'Tap to set end point'}
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

