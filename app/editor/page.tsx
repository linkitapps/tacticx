"use client"

import { useEffect, useRef, useState } from "react"
import { TacticalBoard } from "@/components/editor/tactical-board"
import { useEditorStore } from "@/store/useEditorStore"
import { useDevice } from "@/hooks/use-device"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EditorPropertiesSidebar } from "@/components/editor/properties-sidebar"

export default function EditorPage() {
  const { 
    mode, 
    setMode,
    canUndo,
    canRedo,
    undo,
    redo,
    clearAll,
    setCanvasDimensions
  } = useEditorStore()
  
  const { isMobile, isTablet, orientation } = useDevice()
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Update canvas dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      
      let width = rect.width
      let height = rect.height
      
      // Make sure dimensions are valid
      if (width < 10) width = 800
      if (height < 10) height = 600
      
      setCanvasDimensions(width, height)
    }
    
    // Initial update
    updateDimensions()
    
    // Update on resize
    window.addEventListener('resize', updateDimensions)
    
    // Update on orientation change for mobile
    window.addEventListener('orientationchange', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('orientationchange', updateDimensions)
    }
  }, [setCanvasDimensions])
  
  // Prevent zoom gestures on mobile
  useEffect(() => {
    if (!isMobile) return
    
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    
    // Option 1: Block pinch zoom
    document.addEventListener('touchmove', preventZoom, { passive: false })
    
    // Option 2: Block all default touch actions on the board
    const board = document.getElementById('tactical-board')
    if (board) {
      board.style.touchAction = 'none'
    }
    
    return () => {
      document.removeEventListener('touchmove', preventZoom)
      
      if (board) {
        board.style.touchAction = ''
      }
    }
  }, [isMobile])
  
  // Toggle drawing tools
  const toggleMode = (newMode: typeof mode) => {
    setMode(mode === newMode ? 'select' : newMode)
  }
  
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center p-2 bg-gray-800 text-white">
        <div className="flex space-x-2">
          <Button
            variant={mode === 'select' ? "default" : "outline"}
            onClick={() => setMode('select')}
            size="sm"
            className="text-xs"
          >
            선택
          </Button>
          
          <Button
            variant={mode === 'player' ? "default" : "outline"}
            onClick={() => toggleMode('player')}
            size="sm"
            className="text-xs"
          >
            선수
          </Button>
          
          <Button
            variant={mode === 'arrow' ? "default" : "outline"}
            onClick={() => toggleMode('arrow')}
            size="sm"
            className="text-xs"
          >
            화살표
          </Button>
          
          <Button
            variant={mode === 'text' ? "default" : "outline"}
            onClick={() => toggleMode('text')}
            size="sm"
            className="text-xs"
          >
            텍스트
          </Button>
        </div>
        
        <div className="ml-auto flex space-x-2">
          <Button
            variant="outline"
            onClick={undo}
            disabled={!canUndo}
            size="sm"
            className="text-xs"
          >
            실행취소
          </Button>
          
          <Button
            variant="outline"
            onClick={redo}
            disabled={!canRedo}
            size="sm"
            className="text-xs"
          >
            다시실행
          </Button>
          
          <Button
            variant="destructive"
            onClick={clearAll}
            size="sm"
            className="text-xs"
          >
            전체삭제
          </Button>
        </div>
      </div>
      
      {/* Main content area with tactical board and properties sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tactical board container */}
        <div 
          ref={containerRef}
          id="tactical-board"
          className={cn(
            "flex-1 bg-gray-900 overflow-hidden",
            // Only adjust layout for mobile in portrait mode, tablets and desktops should always be centered
            "justify-center flex relative",
            isMobile && orientation === 'portrait' ? "items-start pt-4" : "items-center"
          )}
        >
          <TacticalBoard />
        </div>
        
        {/* Properties sidebar - hide on mobile */}
        {!isMobile && (
          <EditorPropertiesSidebar />
        )}
      </div>
      
      {/* Status bar */}
      <div className="flex items-center p-2 bg-gray-800 text-white text-xs">
        <div className="text-gray-400">
          Mode: <span className="text-white font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
        </div>
        
        {isMobile && (
          <div className="ml-auto text-gray-400">
            {mode === 'select' && 'Tap to select • Drag to move'}
            {mode === 'player' && 'Tap to place player'}
            {mode === 'arrow' && 'Tap to start/end arrow'}
            {mode === 'text' && 'Tap to add text'}
          </div>
        )}
      </div>
    </div>
  )
}

