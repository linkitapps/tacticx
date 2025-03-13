"use client"

import React from "react"
import { useRef, useState, useEffect } from "react"
import { type TextAnnotationType, useEditorStore } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface TextAnnotationProps {
  annotation: TextAnnotationType
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function TextAnnotation({ annotation, onDragStart, onDragEnd }: TextAnnotationProps) {
  const { updateText, removeText, selectElement, selectedElementId, mode } = useEditorStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const dragStartPosRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null)
  const isMobile = useMobile()

  // For mobile long press
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartTimeRef = useRef<number>(0)
  const touchMoveThresholdRef = useRef<boolean>(false)

  const isSelected = selectedElementId === annotation.id

  // Track drag start position and handle events
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!elementRef.current) return

    // Auto-switch to select mode when dragging starts
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }

    // Select this annotation
    selectElement(annotation.id)

    // Calculate the current element position relative to the board
    dragStartPosRef.current = {
      x: annotation.x,
      y: annotation.y,
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

    // Update annotation position directly
    updateText(annotation.id, {
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
    
    // Reset the threshold flag
    touchMoveThresholdRef.current = false
    
    // Store initial touch time for differentiating between tap and long press
    touchStartTimeRef.current = Date.now()
    
    // Get the first touch point
    const touch = e.touches[0]

    // First, select the text
    handleClick(e)

    // Set up long press timer
    longPressTimer.current = setTimeout(() => {
      // Only activate long press if user hasn't started dragging
      if (!touchMoveThresholdRef.current) {
        clearLongPressTimer()
        
        // Auto-switch to select mode for editing
        if (mode !== "select") {
          useEditorStore.setState({ mode: "select" })
        }
        
        setIsEditing(true)
        
        // Add haptic feedback for edit activation
        if (window.navigator && window.navigator.vibrate) {
          try {
            window.navigator.vibrate([30, 30, 80])
          } catch (err) {
            console.warn("Vibration not supported", err)
          }
        }
        
        setTimeout(() => {
          textareaRef.current?.focus()
          textareaRef.current?.select()
        }, 0)
      }
    }, 500) // 500ms long press
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent scrolling
    e.preventDefault()
    
    // If the user is editing, don't handle drag
    if (isEditing) return
    
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
      ref={elementRef}
      className={cn(
        "absolute cursor-move select-none max-w-[200px]", 
        isSelected ? "z-10" : "z-0",
        isDragging ? "opacity-70" : ""
      )}
      style={{
        left: annotation.x,
        top: annotation.y,
        touchAction: "none",
      }}
      onClick={handleClick}
      onMouseDown={!isMobile ? handleMouseDown : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
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

      {isSelected && mode === "select" && !isDragging && (
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

