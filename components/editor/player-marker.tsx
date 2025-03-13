"use client"

import React, { useRef, useState, useEffect } from "react"
import { type PlayerType, useEditorStore } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface PlayerMarkerProps {
  player: PlayerType
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function PlayerMarker({ player, onDragStart, onDragEnd }: PlayerMarkerProps) {
  const { 
    updatePlayer, 
    removePlayer, 
    selectElement, 
    selectedElementId, 
    mode,
    homeTeamColor,
    awayTeamColor
  } = useEditorStore()
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const dragStartPosRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null)
  const isMobile = useMobile()

  // For mobile long press
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartTimeRef = useRef<number>(0)
  const touchMoveThresholdRef = useRef<boolean>(false)

  const isSelected = selectedElementId === player.id
  
  // Get player color based on team
  const playerColor = player.team === 'home' ? homeTeamColor : awayTeamColor

  // Track drag start position and handle events
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!elementRef.current) return

    // Auto-switch to select mode when dragging starts
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }

    // Select this player
    selectElement(player.id)

    // Calculate the current element position relative to the board
    dragStartPosRef.current = {
      x: player.x,
      y: player.y,
      clientX,
      clientY
    }

    setIsDragging(true)
    
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

    // Update player position directly
    updatePlayer(player.id, {
      x: dragStartPosRef.current.x + deltaX,
      y: dragStartPosRef.current.y + deltaY
    })
  }

  // Handle end of drag operation
  const handleDragEnd = () => {
    if (!isDragging) return

    setIsDragging(false)
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
    // Auto-switch to select mode when clicking player
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
    selectElement(player.id)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    
    // Reset the threshold flag
    touchMoveThresholdRef.current = false
    
    // Store initial touch time for differentiating between tap and long press
    touchStartTimeRef.current = Date.now()
    
    // Get the first touch point
    const touch = e.touches[0]

    // First, select the player
    handleClick(e)
    
    // Set up long press timer for potential edit actions in the future
    longPressTimer.current = setTimeout(() => {
      // Only activate long press if user hasn't started dragging
      if (!touchMoveThresholdRef.current) {
        clearLongPressTimer()
        
        // Add haptic feedback for long press
        if (window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate([30, 30, 80])
          } catch (err) {
            console.warn("Vibration not supported", err)
          }
        }
        
        // Future: Could implement player number editing or other actions here
      }
    }, 500) // 500ms long press
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent scrolling
    e.preventDefault()
    
    const touch = e.touches[0]
    
    // If we haven't started dragging yet and the finger moved more than a threshold
    if (!touchMoveThresholdRef.current && dragStartPosRef.current === null) {
      const touchTime = Date.now() - touchStartTimeRef.current
      
      // If touched briefly (not a long press) and moved, start dragging
      if (touchTime < 500) {
        touchMoveThresholdRef.current = true
        clearLongPressTimer()
        handleDragStart(touch.clientX, touch.clientY)
      }
    }
    
    // Continue drag movement if we've started dragging
    if (isDragging) {
      handleDragMove(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation()
    clearLongPressTimer()
    
    // If we were dragging, end the drag operation
    if (isDragging) {
      handleDragEnd()
    }
  }
  
  // Cancel long press timer when needed
  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    removePlayer(player.id)
    
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
      clearLongPressTimer()
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
        left: player.x,
        top: player.y,
        touchAction: "none",
      }}
      onClick={handleClick}
      onMouseDown={!isMobile ? handleMouseDown : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Player Circle */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full shadow-md transition-transform duration-150",
          isSelected ? "scale-110 ring-2 ring-white ring-opacity-70" : "",
          isDragging ? "scale-105" : ""
        )}
        style={{
          width: isMobile ? "42px" : "36px",
          height: isMobile ? "42px" : "36px",
          backgroundColor: playerColor,
          transform: `translate(-50%, -50%)`,
        }}
      >
        {/* Player Number */}
        <span className="text-white font-bold select-none" style={{ fontSize: isMobile ? "16px" : "14px" }}>
          {player.number}
        </span>
      </div>

      {/* Delete button - only visible when selected */}
      {isSelected && (
        <button
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
          onClick={handleDelete}
          style={{ transform: 'translate(50%, -50%)' }}
        >
          ×
        </button>
      )}

      {/* Player label if available */}
      {player.label && (
        <div
          className="absolute whitespace-nowrap text-xs bg-black bg-opacity-70 text-white px-1 rounded"
          style={{ top: "20px", left: "50%", transform: "translateX(-50%)" }}
        >
          {player.label}
        </div>
      )}
    </div>
  )
}

