"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { SoccerField } from "@/components/editor/soccer-field"
import { useEditorStore, Arrow } from "@/store/editorStoreImpl"
import { useDevice } from "@/hooks/use-device"
import { PlayerMarker } from "@/components/editor/player-marker"
import { TextAnnotation } from "@/components/editor/text-annotation"
import { cn } from "@/lib/utils"

// Create a separate Arrow component that can use hooks
const ArrowPath = ({ arrow, onDelete }: { arrow: Arrow, onDelete: (id: string) => void }) => {
  const { selectElement } = useEditorStore();

  return (
    <g>
      <path
        d={`M ${arrow.startX} ${arrow.startY} Q ${arrow.controlX} ${arrow.controlY} ${arrow.endX} ${arrow.endY}`}
        stroke={arrow.color}
        strokeWidth={arrow.width || 2}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={arrow.style === 'dashed' ? '10,5' : arrow.style === 'dotted' ? '5,5' : undefined}
        markerEnd={`url(#arrow-${arrow.id})`}
        onClick={(e) => {
          e.stopPropagation();
          selectElement(arrow.id);
        }}
        data-arrow-id={arrow.id}
        data-arrow-style={arrow.style || 'solid'}
      />
    </g>
  );
};

export function TacticalBoard() {
  const boardRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { 
    canvasWidth, 
    canvasHeight,
    players,
    arrows,
    textAnnotations,
    mode,
    selectedElementId,
    
    // Actions
    addPlayer,
    addText,
    startArrow,
    endArrow,
    completeArrow,
    cancelArrow,
    arrowDrawingState,
    tempArrow,
    selectElement,
    deleteArrow
  } = useEditorStore()
  
  const { isMobile, isTablet, orientation } = useDevice()
  const [isDragging, setIsDragging] = useState(false)
  
  // Handle position calculation from mouse/touch event
  const getPointerPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!boardRef.current) return { x: 0, y: 0 }
    
    const rect = boardRef.current.getBoundingClientRect()
    
    // Handle touch event
    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    }
    
    // Handle mouse event
    if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
    
    return { x: 0, y: 0 }
  }, [])
  
  // Handle element drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])
  
  // Handle element drag end
  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      setIsDragging(false)
    }, 0)
  }, [])
  
  // Handle clicks or taps on the board to place elements
  const handleBoardInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Don't handle interaction when drag operation is in progress
    if (isDragging) return
    
    // Calculate coordinates
    const { x, y } = getPointerPosition(e)
    
    // Handle different tools
    if (mode === 'player') {
      // Create new player at current position
      addPlayer(x, y)
    }
    else if (mode === 'text') {
      // Create new text annotation at current position
      addText(x, y, 'New text')
    }
    else if (mode === 'arrow') {
      if (arrowDrawingState === 'idle') {
        // Start drawing an arrow
        startArrow(x, y)
      } 
      else if (arrowDrawingState === 'started') {
        // Complete the arrow drawing
        endArrow(x, y)
        completeArrow()
      }
    }
    else if (mode === 'select') {
      // Deselect any selected element when clicking empty space
      selectElement(null)
    }
  }, [mode, isDragging, arrowDrawingState, addPlayer, addText, startArrow, endArrow, completeArrow, selectElement, getPointerPosition])
  
  // Handle mouse/touch move for arrow preview
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'arrow' || arrowDrawingState !== 'started' || !tempArrow) return
    
    // Calculate pointer position
    const { x, y } = getPointerPosition(e)
    
    // Update temporary arrow end position
    useEditorStore.setState({
      tempArrow: {
        ...tempArrow,
        endX: x,
        endY: y,
        controlX: (tempArrow.startX + x) / 2,
        controlY: (tempArrow.startY + y) / 2 - 20 // Slight curve upward
      }
    })
  }, [mode, arrowDrawingState, tempArrow, getPointerPosition])
  
  // Handle key events (like Escape to cancel arrow drawing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'arrow' && arrowDrawingState !== 'idle') {
          cancelArrow()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mode, arrowDrawingState, cancelArrow])
  
  return (
    <div 
      ref={boardRef}
      className={cn(
        "relative w-full h-full",
        // Only mobile should adapt to portrait orientation, tablets and desktops should always be landscape
        isMobile && orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[5/3]',
        mode === 'player' ? 'cursor-cell' : 
        mode === 'text' ? 'cursor-text' : 
        mode === 'arrow' ? 'cursor-crosshair' : 
        'cursor-default'
      )}
      onClick={handleBoardInteraction}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onTouchStart={isMobile ? handleBoardInteraction : undefined}
    >
      {/* Soccer field (bottom layer) */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <SoccerField />
      </div>
      
      {/* SVG layer for arrows */}
      <svg
        ref={svgRef}
        width={canvasWidth || 800}
        height={canvasHeight || 600}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 5 }}
      >
        <defs>
          {/* Create markers for all arrows */}
          {arrows.map(arrow => (
            <marker
              key={`marker-${arrow.id}`}
              id={`arrow-${arrow.id}`}
              markerWidth={10 + (arrow.width || 2) / 2}
              markerHeight={7 + (arrow.width || 2) / 2}
              refX={9 + (arrow.width || 2) / 4}
              refY={3.5 + (arrow.width || 2) / 4}
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={arrow.color || '#ffffff'}
              />
            </marker>
          ))}
          
          {/* Marker for temp arrow */}
          {tempArrow && (
            <marker
              id="temp-arrow"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill={tempArrow.color || '#ffffff'}
              />
            </marker>
          )}
        </defs>
        
        {/* Draw all arrows using the ArrowPath component */}
        {arrows.map(arrow => (
          <ArrowPath key={arrow.id} arrow={arrow} onDelete={deleteArrow} />
        ))}
        
        {/* Draw temporary arrow if in the process of creating one */}
        {tempArrow && (
          <path
            d={`M ${tempArrow.startX} ${tempArrow.startY} Q ${tempArrow.controlX} ${tempArrow.controlY} ${tempArrow.endX} ${tempArrow.endY}`}
            stroke={(tempArrow as Arrow).color || '#ffffff'}
            strokeWidth={(tempArrow as Arrow).width || 2}
            fill="none"
            strokeDasharray={arrowDrawingState === 'started' ? '5,5' : undefined}
            strokeLinecap="round"
            markerEnd="url(#temp-arrow)"
          />
        )}
      </svg>
      
      {/* Players layer */}
      <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
        {players.map((player) => {
          // Create a basic key that will be stable but change when player properties change
          const playerKey = `player-${player.id}`;
          
          return (
            <PlayerMarker 
              key={playerKey} 
              player={player}
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd} 
            />
          );
        })}
      </div>
      
      {/* Text annotations layer */}
      <div className="absolute inset-0" style={{ zIndex: 15, pointerEvents: 'none' }}>
        {textAnnotations.map(annotation => (
          <TextAnnotation 
            key={annotation.id} 
            annotation={annotation} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd} 
          />
        ))}
      </div>
    </div>
  )
} 