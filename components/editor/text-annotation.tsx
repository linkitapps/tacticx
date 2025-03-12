"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useDrag } from "react-dnd"
import { type TextAnnotationType, useEditorStore } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface TextAnnotationProps {
  annotation: TextAnnotationType
  onDragStart?: () => void
}

export function TextAnnotation({ annotation, onDragStart }: TextAnnotationProps) {
  const { updateText, removeText, selectElement, selectedElementId, mode } = useEditorStore()
  const [isEditing, setIsEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useMobile()

  // For mobile long press
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const isSelected = selectedElementId === annotation.id

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "TEXT",
      item: () => {
        if (onDragStart) onDragStart()
        // Automatically switch to select mode when dragging starts
        if (mode !== "select") {
          useEditorStore.setState({ mode: "select" })
        }
        return { id: annotation.id, type: "text" }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      // Allow dragging in any mode
      canDrag: true,
    }),
    [annotation.id, mode, onDragStart],
  )

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Auto-switch to select mode for editing
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
    setIsEditing(true)
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }, 0)
  }

  // For mobile, use long press instead of double click
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()

    // First, select the text
    handleClick(e)

    // Set up long press timer
    longPressTimer.current = setTimeout(() => {
      // Auto-switch to select mode for editing
      if (mode !== "select") {
        useEditorStore.setState({ mode: "select" })
      }
      setIsEditing(true)
      setTimeout(() => {
        textareaRef.current?.focus()
        textareaRef.current?.select()
      }, 0)
    }, 500) // 500ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateText(annotation.id, { text: e.target.value })
  }

  const handleTextBlur = () => {
    setIsEditing(false)
  }

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      setIsEditing(false)
    }
  }

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    // Auto-switch to select mode when clicking text
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
    selectElement(annotation.id)
  }

  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    removeText(annotation.id)
  }

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

  // Get text style properties with defaults
  const textStyles = {
    fontSize: `${annotation.fontSize || 16}px`,
    color: annotation.color || "#FFFFFF",
    fontWeight: annotation.isBold ? "bold" : "normal",
    fontStyle: annotation.isItalic ? "italic" : "normal",
    textAlign: annotation.alignment || "center",
  }

  return (
    <div
      ref={drag}
      className={cn("absolute cursor-move select-none max-w-[200px]", isSelected ? "z-10" : "z-0")}
      style={{
        left: annotation.x,
        top: annotation.y,
        touchAction: "none",
      }}
      onClick={handleClick}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={annotation.text}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          className={cn(
            "bg-black/80 border border-gray-700 text-white p-2 rounded resize-none min-w-[120px] min-h-[60px]",
            isMobile && "min-w-[160px] min-h-[80px] text-base",
          )}
          style={textStyles}
          autoFocus
        />
      ) : (
        <div
          className={cn(
            "p-2 rounded whitespace-pre-wrap",
            isSelected
              ? "ring-2 ring-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              : "shadow-[0_0_10px_rgba(0,0,0,0.5)]",
            "bg-black/80 text-white",
            isMobile && "p-3",
          )}
          style={textStyles}
        >
          {annotation.text}
        </div>
      )}

      {isSelected && mode === "select" && (
        <button
          onClick={handleDelete}
          onTouchStart={isMobile ? handleDelete : undefined}
          className={cn(
            "absolute -top-2 -right-2 bg-red-600 text-white rounded-full flex items-center justify-center text-xs shadow-lg",
            isMobile ? "w-8 h-8 text-base" : "w-6 h-6",
          )}
        >
          ×
        </button>
      )}
    </div>
  )
}

