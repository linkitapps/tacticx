"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useDrag } from "react-dnd"
import { type PlayerType, useEditorStore } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { Trash2, Edit2, Move } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface PlayerMarkerProps {
  player: PlayerType
  onDragStart?: () => void
}

export function PlayerMarker({ player, onDragStart }: PlayerMarkerProps) {
  const { updatePlayer, removePlayer, selectElement, selectedElementId, mode } = useEditorStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragHint, setIsDragHint] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()

  const isSelected = selectedElementId === player.id

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "PLAYER",
      item: () => {
        if (onDragStart) onDragStart()
        // Automatically switch to select mode when dragging starts
        if (mode !== "select") {
          useEditorStore.setState({ mode: "select" })
        }
        return { id: player.id, type: "player" }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      // Allow dragging in any mode
      canDrag: true,
    }),
    [player.id, mode, onDragStart],
  )

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    // Add subtle haptic feedback for touch devices
    if (isMobile && window.navigator.vibrate) {
      window.navigator.vibrate(30)
    }
    // Auto-switch to select mode when clicking a player
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
    selectElement(player.id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Auto-switch to select mode for editing
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
    setIsEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  // For mobile, we'll use a long press instead of double click
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()

    // First, select the player
    handleInteraction(e)

    // Set up long press timer
    longPressTimer.current = setTimeout(() => {
      // Auto-switch to select mode for editing
      if (mode !== "select") {
        useEditorStore.setState({ mode: "select" })
      }
      setIsEditing(true)
      // Add haptic feedback for edit activation
      if (window.navigator.vibrate) {
        window.navigator.vibrate([30, 30, 80])
      }
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }, 500) // 500ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePlayer(player.id, { label: e.target.value })
  }

  const handleLabelBlur = () => {
    setIsEditing(false)
  }

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false)
    }
  }

  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this player?")) {
      removePlayer(player.id)
      // Add haptic feedback for deletion
      if (isMobile && window.navigator.vibrate) {
        window.navigator.vibrate([30, 50, 80])
      }
    }
  }
  
  // Show drag hint for 1.5 seconds when player is first selected
  useEffect(() => {
    if (isSelected && !isEditing && !isDragHint) {
      setIsDragHint(true)
      const timer = setTimeout(() => {
        setIsDragHint(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isSelected, isEditing])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Clean up any timers
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  if (isDragging) {
    return null
  }

  // Determine if this is a home or away player for styling
  const isHome = player.team === "home"

  return (
    <div
      ref={drag}
      className={cn(
        "absolute cursor-move select-none transition-transform duration-200 ease-out",
        isSelected ? "z-20 scale-110" : "z-10",
        isHovering && !isSelected ? "scale-105" : "",
      )}
      style={{
        left: player.x - 12,
        top: player.y - 12,
        touchAction: "none",
      }}
      onClick={handleInteraction}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200",
          isSelected ? "ring-2 ring-white" : isHovering ? "ring-1 ring-white/50" : "",
          "shadow-lg",
          isMobile ? "w-9 h-9 text-sm" : "w-7 h-7 text-xs", // Larger for better touch targets
        )}
        style={{
          backgroundColor: player.color,
          boxShadow: isSelected
            ? `0 0 0 2px white, 0 0 12px 2px ${player.color}80`
            : isHovering
              ? `0 0 10px 2px ${player.color}60`
              : `0 0 8px 1px rgba(0,0,0,0.5)`,
        }}
      >
        <span className={isMobile ? "text-sm" : "text-xs"}>{player.number}</span>
      </div>

      {/* Drag hint animation */}
      {isDragHint && isSelected && !isEditing && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap flex items-center gap-1 animate-bounce">
          <Move className="h-3 w-3" />
          <span>Drag to move</span>
        </div>
      )}

      {player.label && !isEditing && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded whitespace-nowrap shadow-md animate-fade-in">
          {player.label}
        </div>
      )}

      {isEditing && (
        <input
          ref={inputRef}
          type="text"
          value={player.label || ""}
          onChange={handleLabelChange}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          className={cn(
            "absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-[#21262D] border border-[#30363D] text-white px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary animate-fade-in shadow-lg",
            isMobile ? "text-sm w-32" : "text-xs w-24",
          )}
          autoFocus
          placeholder="Player name"
        />
      )}

      {isSelected && mode === "select" && (
        <div className={cn(
          "absolute -top-2 -right-2 flex gap-1 animate-fade-in", 
          isMobile && "gap-2"
        )}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            onTouchStart={
              isMobile
                ? (e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }
                : undefined
            }
            className={cn(
              "bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all",
              isMobile ? "w-7 h-7" : "w-5 h-5",
            )}
            title="Edit player"
          >
            <Edit2 className={isMobile ? "h-3.5 w-3.5" : "h-2.5 w-2.5"} />
          </button>
          <button
            onClick={handleDelete}
            onTouchStart={isMobile ? handleDelete : undefined}
            className={cn(
              "bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 active:scale-95 transition-all",
              isMobile ? "w-7 h-7" : "w-5 h-5",
            )}
            title="Delete player"
          >
            <Trash2 className={isMobile ? "h-3.5 w-3.5" : "h-2.5 w-2.5"} />
          </button>
        </div>
      )}
    </div>
  )
}

