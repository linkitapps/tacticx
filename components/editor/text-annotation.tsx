"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { useDevice } from "@/hooks/use-device"
import { cn } from "@/lib/utils"

interface TextAnnotationProps {
  annotation: any // Will type properly once we see the store structure
  onDragStart: () => void
  onDragEnd: () => void
}

export function TextAnnotation({ annotation, onDragStart, onDragEnd }: TextAnnotationProps) {
  const { isMobile, isTablet } = useDevice()
  const { selectedElementId, selectElement, updateTextPosition, updateTextContent, deleteText } = useEditorStore()
  
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [position, setPosition] = useState({ x: annotation.x, y: annotation.y })
  const [text, setText] = useState(annotation.text)
  
  const textRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const isSelected = selectedElementId === annotation.id
  
  // Reset position and text from props when annotation changes
  useEffect(() => {
    setPosition({ x: annotation.x, y: annotation.y })
    setText(annotation.text)
  }, [annotation.x, annotation.y, annotation.text])
  
  // Handle click/tap on text
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    
    // Select this text
    selectElement(annotation.id)
  }, [annotation.id, selectElement])
  
  // Handle double click to start editing
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isMobile) return // Skip on mobile, use long press instead
    
    setIsEditing(true)
    
    // Focus and select all text in the input when it becomes available
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 10)
  }, [isMobile])
  
  // Handle long press on mobile to start editing
  const handleLongPress = useCallback(() => {
    if (!isMobile) return
    
    setIsEditing(true)
    
    // Focus the input when it becomes available
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 10)
  }, [isMobile])
  
  // Handle delete button click
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    deleteText(annotation.id)
  }, [deleteText, annotation.id])
  
  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start dragging if we're in edit mode
    if (isEditing || !textRef.current) return
    
    e.stopPropagation()
    
    // Capture initial position
    startPosRef.current = { x: e.clientX, y: e.clientY }
    offsetRef.current = { x: position.x, y: position.y }
    
    // Start dragging
    setIsDragging(true)
    onDragStart()
    
    // Select this text
    selectElement(annotation.id)
  }, [position, isEditing, onDragStart, annotation.id, selectElement])
  
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
    updateTextPosition(annotation.id, position.x, position.y)
  }, [isDragging, onDragEnd, annotation.id, position.x, position.y, updateTextPosition])
  
  // Touch drag handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't start dragging if we're in edit mode
    if (isEditing || !textRef.current || e.touches.length !== 1) return
    
    e.stopPropagation()
    
    const touch = e.touches[0]
    
    // Capture initial position
    startPosRef.current = { x: touch.clientX, y: touch.clientY }
    offsetRef.current = { x: position.x, y: position.y }
    
    // Start long press detection
    const longPressTimeout = setTimeout(() => {
      handleLongPress()
    }, 800)
    
    // Store timeout ID to clear it on move/end
    textRef.current.dataset.longPressTimeoutId = String(longPressTimeout)
    
    // Start dragging
    setIsDragging(true)
    onDragStart()
    
    // Select this text
    selectElement(annotation.id)
  }, [position, isEditing, onDragStart, annotation.id, selectElement, handleLongPress])
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || !textRef.current) return
    
    // Cancel long press detection
    const timeoutId = textRef.current.dataset.longPressTimeoutId
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId, 10))
      delete textRef.current.dataset.longPressTimeoutId
    }
    
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
    if (!textRef.current) return
    
    // Cancel long press detection
    const timeoutId = textRef.current.dataset.longPressTimeoutId
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId, 10))
      delete textRef.current.dataset.longPressTimeoutId
    }
    
    if (!isDragging) return
    
    // End dragging
    setIsDragging(false)
    onDragEnd()
    
    // Update store with final position
    updateTextPosition(annotation.id, position.x, position.y)
  }, [isDragging, onDragEnd, annotation.id, position.x, position.y, updateTextPosition])
  
  // Handle text change
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }, [])
  
  // Handle edit completion
  const handleStopEditing = useCallback(() => {
    setIsEditing(false)
    updateTextContent(annotation.id, text)
  }, [annotation.id, text, updateTextContent])
  
  // Handle keyboard events in the textarea
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // If Escape, cancel editing
    if (e.key === 'Escape') {
      setText(annotation.text) // Reset to original
      setIsEditing(false)
    }
    
    // If Enter (without shift), complete editing
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault() // Prevent newline
      handleStopEditing()
    }
  }, [annotation.text, handleStopEditing])
  
  // Set up global event listeners
  useEffect(() => {
    // Only add listeners if dragging
    if (!isDragging) return
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])
  
  return (
    <div
      ref={textRef}
      className={cn(
        "absolute transform -translate-x-1/2",
        isDragging ? "z-30" : "z-20",
        "max-w-[200px]"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: "auto",
        cursor: isEditing ? "text" : "grab"
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onBlur={handleStopEditing}
          onKeyDown={handleKeyDown}
          className="min-w-[100px] min-h-[60px] bg-black bg-opacity-70 p-2 rounded text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <div
          className={cn(
            "p-2 rounded text-white text-center",
            "bg-black bg-opacity-70",
            isSelected && "ring-2 ring-blue-500"
          )}
        >
          {text.split('\n').map((line: string, i: number) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line || ' '}
            </React.Fragment>
          ))}
          
          {/* Delete button */}
          {isSelected && (
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
      )}
    </div>
  )
} 