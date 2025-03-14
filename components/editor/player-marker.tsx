"use client"

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react"
import { useEditorStore } from "@/store/editorStoreImpl"
import { useDevice } from "@/hooks/use-device"
import { cn } from "@/lib/utils"
import { Player } from "@/store/editorStoreImpl"

interface PlayerMarkerProps {
  player: Player
  onDragStart: () => void
  onDragEnd: () => void
}

export function PlayerMarker({ player, onDragStart, onDragEnd }: PlayerMarkerProps) {
  const { isMobile, isTablet } = useDevice()
  const { selectedElementId, selectElement, updatePlayerPosition, deletePlayer } = useEditorStore()
  
  // Set local state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: player.x, y: player.y })
  const [showDelete, setShowDelete] = useState(false)
  
  const playerRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const isSelected = selectedElementId === player.id
  
  // Simple debugging log for property changes
  useEffect(() => {
    console.log(`Player ${player.id} updated:`, 
      JSON.stringify({
        number: player.number,
        color: player.color,
        label: player.label,
        isSelected
      })
    );
  }, [player.id, player.number, player.color, player.label, isSelected])
  
  // Reset position when player coordinates change
  useEffect(() => {
    setPosition({ x: player.x, y: player.y })
  }, [player.x, player.y])
  
  // Handle click/tap on player
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    console.log("Player clicked:", player.id, player.number, player.color)
    
    // Select this player
    selectElement(player.id)
    
    // Show delete button when selected
    setShowDelete(true)
    
    // Hide delete button after a timeout
    const hideTimeout = setTimeout(() => {
      if (selectedElementId === player.id) {
        setShowDelete(false)
      }
    }, 3000)
    
    return () => clearTimeout(hideTimeout)
  }, [player.id, player.number, player.color, selectElement, selectedElementId])
  
  // Handle delete button click
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deletePlayer(player.id)
  }, [deletePlayer, player.id])
  
  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!playerRef.current) return
    
    e.stopPropagation()
    
    // Capture initial position
    startPosRef.current = { x: e.clientX, y: e.clientY }
    offsetRef.current = { x: position.x, y: position.y }
    
    // Start dragging
    setIsDragging(true)
    onDragStart()
    
    // Select this player
    selectElement(player.id)
  }, [position, onDragStart, player.id, selectElement])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    // Calculate new position
    const deltaX = e.clientX - startPosRef.current.x
    const deltaY = e.clientY - startPosRef.current.y
    
    const newX = offsetRef.current.x + deltaX
    const newY = offsetRef.current.y + deltaY
    
    // Update local position
    setPosition({ x: newX, y: newY })
  }, [isDragging])
  
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return
    
    // End dragging
    setIsDragging(false)
    onDragEnd()
    
    // Update store with final position
    updatePlayerPosition(player.id, position.x, position.y)
  }, [isDragging, onDragEnd, player.id, position.x, position.y, updatePlayerPosition])
  
  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!playerRef.current || e.touches.length !== 1) return
    
    e.stopPropagation()
    
    // Prevent default to avoid scrolling
    e.preventDefault()
    
    const touch = e.touches[0]
    
    // Capture initial position
    startPosRef.current = { x: touch.clientX, y: touch.clientY }
    offsetRef.current = { x: position.x, y: position.y }
    
    // Set up long press detection for selection without dragging
    longPressTimeoutRef.current = setTimeout(() => {
      // Select this player on long press
      selectElement(player.id)
      setShowDelete(true)
    }, 500)
    
    // Start dragging
    setIsDragging(true)
    onDragStart()
    
    // Select this player
    selectElement(player.id)
  }, [position, onDragStart, player.id, selectElement])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    
    // Cancel long press detection
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
    
    // Prevent default to avoid scrolling
    e.preventDefault()
    
    const touch = e.touches[0]
    
    // Calculate new position
    const deltaX = touch.clientX - startPosRef.current.x
    const deltaY = touch.clientY - startPosRef.current.y
    
    const newX = offsetRef.current.x + deltaX
    const newY = offsetRef.current.y + deltaY
    
    // Update local position
    setPosition({ x: newX, y: newY })
  }, [isDragging])
  
  const handleTouchEnd = useCallback(() => {
    // Cancel long press detection
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
      longPressTimeoutRef.current = null
    }
    
    if (!isDragging) return
    
    // End dragging
    setIsDragging(false)
    onDragEnd()
    
    // Update store with final position
    updatePlayerPosition(player.id, position.x, position.y)
  }, [isDragging, onDragEnd, player.id, position.x, position.y, updatePlayerPosition])
  
  // Set up global event listeners
  useEffect(() => {
    // Only add listeners if dragging
    if (!isDragging) return
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])
  
  // Get the current display color - use player's actual color always
  const displayColor = player.color; // Always use player's actual color
  
  return (
    <div
      ref={playerRef}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2",
        isDragging ? "z-30" : "z-20",
        "touch-none"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: "auto", // Important: override parent's pointer-events: none
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-player-id={player.id}
      data-player-number={player.number}
      data-player-color={player.color}
    >
      {/* Player circle - simplified with direct props rendering */}
      <div
        ref={circleRef}
        className={cn(
          "flex items-center justify-center rounded-full player-circle",
          "text-white font-bold",
          "transition-all",
          isSelected ? "border-[3px] border-white ring-2 ring-blue-500" : "border-2 border-white"
        )}
        style={{
          width: `${player.size || 44}px`,
          height: `${player.size || 44}px`,
          fontSize: `${(player.size || 44) * 0.5}px`,
          backgroundColor: displayColor,
          transition: "background-color 0.2s ease-in, border 0.2s ease-in"
        }}
      >
        {player.number}
      </div>
      
      {/* Player label */}
      {player.label && (
        <div 
          className="player-label absolute text-white text-center w-full -bottom-6 px-1 bg-black bg-opacity-50 rounded text-xs whitespace-nowrap overflow-hidden"
          style={{ maxWidth: `${player.size * 2 || 88}px` }}
        >
          {player.label}
        </div>
      )}
      
      {/* Delete button */}
      {isSelected && showDelete && (
        <button
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          onClick={handleDelete}
          style={{ pointerEvents: "auto" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
} 