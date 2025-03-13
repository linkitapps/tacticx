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
  const elementRef = useRef<HTMLDivElement>(null)
  const startPointRef = useRef<HTMLDivElement>(null)
  const endPointRef = useRef<HTMLDivElement>(null)
  const dragStartPosRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null)
  const isMobile = useMobile()

  const isSelected = selectedElementId === arrow.id

  // Calculate arrow properties
  const dx = arrow.endX - arrow.startX
  const dy = arrow.endY - arrow.startY
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

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

    if (isDraggingEnd) {
      // Only update the end point
      updateArrow(arrow.id, {
        endX: dragStartPosRef.current.x + deltaX,
        endY: dragStartPosRef.current.y + deltaY
      })
    } else {
      // Update both start and end points (move the entire arrow)
      updateArrow(arrow.id, {
        startX: dragStartPosRef.current.x + deltaX,
        startY: dragStartPosRef.current.y + deltaY,
        endX: arrow.endX + deltaX,
        endY: arrow.endY + deltaY
      })
    }
  }

  // Handle end of drag operation
  const handleDragEnd = () => {
    if (!isDragging) return

    setIsDragging(false)
    setIsDraggingEnd(false)
    dragStartPosRef.current = null

    // Notify parent
    if (onDragEnd) onDragEnd()

    // Re-enable text selection
    document.body.style.userSelect = ''
    document.body.style.webkitUserSelect = ''
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

  const handleEndPointMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag on left mouse button
    if (e.button !== 0) return
    
    handleEndPointDragStart(e.clientX, e.clientY, e)

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

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    // Auto-switch to select mode when clicking arrow
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
    selectElement(arrow.id)
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

  const handleEndPointTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    
    // Get the first touch point
    const touch = e.touches[0]
    
    handleEndPointDragStart(touch.clientX, touch.clientY, e)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent scrolling
    e.preventDefault()
    
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
        isSelected ? "z-10" : "z-0",
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
      {/* Arrow line */}
      <div
        className="absolute pointer-events-auto" // Make this element interactive
        style={{
          left: arrow.startX,
          top: arrow.startY,
          width: `${length}px`,
          height: `${arrow.width}px`,
          backgroundColor: arrow.color,
          transform: `rotate(${angle}deg)`,
          transformOrigin: "left center",
          opacity: isDragging ? 0.7 : 1,
        }}
        onClick={handleClick}
        onMouseDown={!isMobile ? handleMouseDown : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      />

      {/* Arrow head */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: arrow.endX,
          top: arrow.endY,
          width: 0,
          height: 0,
          borderLeft: `${10 + arrow.width}px solid ${arrow.color}`,
          borderTop: `${5 + arrow.width / 2}px solid transparent`,
          borderBottom: `${5 + arrow.width / 2}px solid transparent`,
          transform: `rotate(${angle}deg) translateX(-50%)`,
          transformOrigin: "center center",
          opacity: isDragging ? 0.7 : 1,
        }}
      />

      {/* Start point handle (visible when selected) */}
      {isSelected && mode === "select" && (
        <div
          ref={startPointRef}
          className={cn(
            "absolute rounded-full bg-white border-2 pointer-events-auto",
            isMobile ? "w-6 h-6" : "w-4 h-4",
            isDragging && !isDraggingEnd ? "opacity-70" : ""
          )}
          style={{
            left: arrow.startX - (isMobile ? 12 : 8),
            top: arrow.startY - (isMobile ? 12 : 8),
            borderColor: arrow.color,
            cursor: "move",
          }}
          onMouseDown={!isMobile ? handleMouseDown : undefined}
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        />
      )}

      {/* End point handle (visible when selected) */}
      {isSelected && mode === "select" && (
        <div
          ref={endPointRef}
          className={cn(
            "absolute rounded-full bg-white border-2 pointer-events-auto",
            isMobile ? "w-6 h-6" : "w-4 h-4",
            isDragging && isDraggingEnd ? "opacity-70" : ""
          )}
          style={{
            left: arrow.endX - (isMobile ? 12 : 8),
            top: arrow.endY - (isMobile ? 12 : 8),
            borderColor: arrow.color,
            cursor: "move",
          }}
          onMouseDown={!isMobile ? handleEndPointMouseDown : undefined}
          onTouchStart={isMobile ? handleEndPointTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        />
      )}

      {/* Delete button (visible when selected) */}
      {isSelected && mode === "select" && !isDragging && (
        <button
          onClick={handleDelete}
          onTouchStart={isMobile ? handleDelete : undefined}
          className={cn(
            "absolute bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg pointer-events-auto",
            isMobile ? "w-8 h-8 text-base" : "w-6 h-6"
          )}
          style={{
            left: (arrow.startX + arrow.endX) / 2 - (isMobile ? 16 : 12),
            top: (arrow.startY + arrow.endY) / 2 - (isMobile ? 16 : 12),
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

