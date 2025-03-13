"use client"

import React, { useRef, useState, useEffect } from "react"
import { type ArrowType, useEditorStore } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface ArrowMarkerProps {
  arrow: ArrowType
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function ArrowMarker({ arrow, onDragStart, onDragEnd }: ArrowMarkerProps) {
  const { updateArrow, removeArrow, selectElement, selectedElementId, mode } = useEditorStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingEnd, setIsDraggingEnd] = useState(false)
  const [isDraggingControl, setIsDraggingControl] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const startPointRef = useRef<HTMLDivElement>(null)
  const endPointRef = useRef<HTMLDivElement>(null)
  const controlPointRef = useRef<HTMLDivElement>(null)
  const dragStartPosRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null)
  const isMobile = useMobile()

  const isSelected = selectedElementId === arrow.id
  const handleSize = isMobile ? 12 : 8
  const deleteButtonSize = isMobile ? 14 : 10
  const touchAreaWidth = isMobile ? 30 : 20

  // Listen for mode changes to handle deselection
  useEffect(() => {
    // If not in select mode, deselect this arrow
    if (isSelected && mode !== "select") {
      selectElement(null);
    }
  }, [mode, isSelected, selectElement]);

  // Calculate arrow properties
  const dx = arrow.endX - arrow.startX
  const dy = arrow.endY - arrow.startY
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  // Handle arrow selection and click behavior
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault() // Prevent any default behaviors
    
    // Auto-switch to select mode when clicking arrow
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
    
    // Select this arrow
    selectElement(arrow.id)
    
    // Add haptic feedback for selection
    if (isMobile && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(20)
      } catch (err) {
        console.warn("Vibration not supported", err)
      }
    }
  }

  // Track drag start position and handle events for the entire arrow
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!elementRef.current) return

    // Auto-switch to select mode when dragging starts
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }

    // Select this arrow
    selectElement(arrow.id)

    // Calculate the current element position relative to the board
    dragStartPosRef.current = {
      x: arrow.startX,
      y: arrow.startY,
      clientX,
      clientY
    }

    setIsDragging(true)
    setIsDraggingEnd(false)
    setIsDraggingControl(false)
    
    // Haptic feedback for drag start
    if (isMobile && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(30)
      } catch (err) {
        console.warn("Vibration not supported", err)
      }
    }

    // Notify parent 
    if (onDragStart) onDragStart()

    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }

  // Track drag start position for the end point of the arrow
  const handleEndPointDragStart = (clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    
    if (!endPointRef.current) return

    // Auto-switch to select mode when dragging starts
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }

    // Select this arrow
    selectElement(arrow.id)

    // Calculate the current element position relative to the board
    dragStartPosRef.current = {
      x: arrow.endX,
      y: arrow.endY,
      clientX,
      clientY
    }

    setIsDragging(true)
    setIsDraggingEnd(true)
    setIsDraggingControl(false)
    
    // Haptic feedback for drag start
    if (isMobile && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(30)
      } catch (err) {
        console.warn("Vibration not supported", err)
      }
    }

    // Notify parent 
    if (onDragStart) onDragStart()

    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }

  // Track drag start position for the control point
  const handleControlPointDragStart = (clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    
    if (!controlPointRef.current) return

    // Auto-switch to select mode when dragging starts
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }

    // Select this arrow
    selectElement(arrow.id)

    // Calculate the current element position relative to the board
    dragStartPosRef.current = {
      x: arrow.controlX,
      y: arrow.controlY,
      clientX,
      clientY
    }

    setIsDragging(true)
    setIsDraggingEnd(false)
    setIsDraggingControl(true)
    
    // Haptic feedback for drag start
    if (isMobile && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(30)
      } catch (err) {
        console.warn("Vibration not supported", err)
      }
    }

    // Notify parent 
    if (onDragStart) onDragStart()

    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
  }

  // Handle mouse move during drag
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStartPosRef.current) return

    const deltaX = clientX - dragStartPosRef.current.clientX
    const deltaY = clientY - dragStartPosRef.current.clientY

    if (isDraggingControl) {
      // Only update the control point
      updateArrow(arrow.id, {
        controlX: dragStartPosRef.current.x + deltaX,
        controlY: dragStartPosRef.current.y + deltaY
      })
    } else if (isDraggingEnd) {
      // Only update the end point
      updateArrow(arrow.id, {
        endX: dragStartPosRef.current.x + deltaX,
        endY: dragStartPosRef.current.y + deltaY
      })
    } else {
      // Update all points (move the entire arrow)
      updateArrow(arrow.id, {
        startX: dragStartPosRef.current.x + deltaX,
        startY: dragStartPosRef.current.y + deltaY,
        endX: arrow.endX + deltaX,
        endY: arrow.endY + deltaY,
        controlX: arrow.controlX + deltaX,
        controlY: arrow.controlY + deltaY
      })
    }
  }

  // Handle end of drag operation
  const handleDragEnd = () => {
    if (!isDragging) return

    setIsDragging(false)
    setIsDraggingEnd(false)
    setIsDraggingControl(false)
    dragStartPosRef.current = null

    // Notify parent
    if (onDragEnd) onDragEnd()

    // Re-enable text selection
    document.body.style.userSelect = ''
    document.body.style.webkitUserSelect = ''
  }

  // Handle delete button click
  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    removeArrow(arrow.id)
    
    // Add haptic feedback for deletion
    if (isMobile && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate([30, 50, 80])
      } catch (err) {
        console.warn("Vibration not supported", err)
      }
    }
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag on left mouse button
    if (e.button !== 0) return
    
    // Don't start drag if clicked on a button
    if ((e.target as HTMLElement).tagName === 'BUTTON') return

    e.stopPropagation()
    handleDragStart(e.clientX, e.clientY)

    // Add global event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    handleDragMove(e.clientX, e.clientY)
  }

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault()
    handleDragEnd()
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // Touch event handlers 
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    
    // Get the first touch point
    const touch = e.touches[0]

    // First, select the arrow
    handleClick(e)
    
    handleDragStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent scrolling during arrow manipulation
    if (isDragging) {
      e.preventDefault()
    }
    e.stopPropagation()
    
    const touch = e.touches[0]
    
    // Continue drag movement if we've started dragging
    if (isDragging) {
      handleDragMove(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation()
    
    // If we were dragging, end the drag operation
    if (isDragging) {
      handleDragEnd()
    }
  }

  // Clean up any timers and event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute cursor-move select-none",
        isSelected ? "z-20" : "z-10",
        isDragging ? "opacity-70" : ""
      )}
      style={{
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        touchAction: "none",
        pointerEvents: "none", // Make the container non-interactive
      }}
    >
      {/* Hit area for the arrow */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-auto"
        style={{ zIndex: 5 }}
      >
        <path
          d={`M ${arrow.startX} ${arrow.startY} Q ${arrow.controlX} ${arrow.controlY} ${arrow.endX} ${arrow.endY}`}
          stroke="transparent"
          strokeWidth={touchAreaWidth}
          fill="none"
          onClick={handleClick}
          onMouseDown={!isMobile ? handleMouseDown : undefined}
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
          className="cursor-pointer"
        />
      </svg>

      {/* Visual feedback when selected */}
      {isSelected && (
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 3 }}
        >
          {/* Highlight outline to show arrow is selected */}
          <path
            d={`M ${arrow.startX} ${arrow.startY} Q ${arrow.controlX} ${arrow.controlY} ${arrow.endX} ${arrow.endY}`}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={arrow.width + (isMobile ? 10 : 6)}
            fill="none"
          />
          {/* Visible helper lines for control point */}
          <line
            x1={arrow.startX}
            y1={arrow.startY}
            x2={arrow.controlX}
            y2={arrow.controlY}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
          <line
            x1={arrow.endX}
            y1={arrow.endY}
            x2={arrow.controlX}
            y2={arrow.controlY}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        </svg>
      )}

      {/* Control Points - only show when selected */}
      {isSelected && mode === "select" && (
        <>
          {/* Start point handle */}
          <div
            ref={startPointRef}
            className={cn(
              "absolute rounded-full bg-white border-2 pointer-events-auto shadow-md",
              isDragging && !isDraggingEnd && !isDraggingControl ? "opacity-70" : ""
            )}
            style={{
              left: arrow.startX - handleSize,
              top: arrow.startY - handleSize,
              width: handleSize * 2,
              height: handleSize * 2,
              borderColor: arrow.color,
              cursor: "move",
              zIndex: 30
            }}
            onMouseDown={!isMobile ? handleMouseDown : undefined}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          />
          
          {/* Control point handle - Make it distinct */}
          <div
            ref={controlPointRef}
            className={cn(
              "absolute rounded-full bg-green-500 border-2 border-white pointer-events-auto shadow-md",
              isDragging && isDraggingControl ? "opacity-70" : ""
            )}
            style={{
              left: arrow.controlX - handleSize,
              top: arrow.controlY - handleSize,
              width: handleSize * 2,
              height: handleSize * 2,
              cursor: "move",
              zIndex: 30
            }}
            onMouseDown={!isMobile ? (e) => {
              e.stopPropagation();
              handleControlPointDragStart(e.clientX, e.clientY, e);
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            } : undefined}
            onTouchStart={isMobile ? (e) => {
              e.preventDefault(); // Prevent scrolling during touch
              handleControlPointDragStart(e.touches[0].clientX, e.touches[0].clientY, e);
            } : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          />
          
          {/* End point handle */}
          <div
            ref={endPointRef}
            className={cn(
              "absolute rounded-full bg-white border-2 pointer-events-auto shadow-md",
              isDragging && isDraggingEnd ? "opacity-70" : ""
            )}
            style={{
              left: arrow.endX - handleSize,
              top: arrow.endY - handleSize,
              width: handleSize * 2,
              height: handleSize * 2,
              borderColor: arrow.color,
              cursor: "move",
              zIndex: 30
            }}
            onMouseDown={!isMobile ? (e) => {
              e.stopPropagation();
              handleEndPointDragStart(e.clientX, e.clientY, e);
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            } : undefined}
            onTouchStart={isMobile ? (e) => {
              e.preventDefault(); // Prevent scrolling during touch
              handleEndPointDragStart(e.touches[0].clientX, e.touches[0].clientY, e);
            } : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
          />
          
          {/* Delete button - make it more visible */}
          <button
            onClick={handleDelete}
            onTouchStart={isMobile ? handleDelete : undefined}
            className="absolute bg-red-600 text-white rounded-full flex items-center justify-center pointer-events-auto shadow-md"
            style={{
              left: (arrow.startX + arrow.endX) / 2 - deleteButtonSize,
              top: (arrow.startY + arrow.endY) / 2 - deleteButtonSize,
              width: deleteButtonSize * 2,
              height: deleteButtonSize * 2,
              fontSize: isMobile ? '1.1rem' : '0.9rem',
              zIndex: 40
            }}
          >
            ×
          </button>
          
          {/* Small "Shape" label near control point to inform users */}
          <div
            className="absolute pointer-events-none bg-black/40 text-white text-xs rounded px-1 py-0.5"
            style={{
              left: arrow.controlX + handleSize + 4,
              top: arrow.controlY - 8,
              zIndex: 30,
              fontSize: isMobile ? '0.65rem' : '0.55rem',
              opacity: 0.8
            }}
          >
            Shape
          </div>
        </>
      )}
    </div>
  )
}

