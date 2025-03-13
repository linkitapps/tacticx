"use client"

import { useEffect, useState, useRef } from "react"
import { TacticalBoard } from "@/components/editor/tactical-board"
import { EditorToolbar } from "@/components/editor/toolbar"
import { useEditorStore } from "@/store/useEditorStore"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Undo, Redo } from "lucide-react"
import { useRouter } from "next/navigation"

// Detect if we're on an iPad to apply special handling
const isIpad = typeof navigator !== 'undefined' && 
  (/iPad/.test(navigator.userAgent) || 
  (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));

export default function EditorPage() {
  // Apply iPad-specific fixes if needed
  useEffect(() => {
    if (isIpad) {
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('manager.actions is not a function')) {
          event.preventDefault();
          console.warn('Prevented iPad DND error: manager.actions is not a function');
        }
      });
    }
  }, []);

  const { 
    selectedElementId,
    setCanvasDimensions,
    mode,
    arrowDrawingState,
    cancelArrow,
    selectElement,
    undo,
    redo,
    canUndo,
    canRedo,
    saveTactic,
  } = useEditorStore();
  
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const isMobile = useMobile();
  const [isSaving, setIsSaving] = useState(false);
  const dimensionsInitializedRef = useRef(false);
  
  // Handle save action
  const handleSave = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      const id = await saveTactic();
      console.log("Tactic saved with ID:", id);
      // Show success message or feedback here
    } catch (error) {
      console.error("Error saving tactic:", error);
      // Show error message here
    } finally {
      setIsSaving(false);
    }
  };

  // Add keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Handle ESC key to cancel actions
      if (e.key === 'Escape') {
        if (arrowDrawingState !== 'idle') {
          cancelArrow()
        } else {
          // Only clear selection, keep current tool
          selectElement(null)
        }
        return
      }

      // Undo/Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
        e.preventDefault();
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (canRedo) redo();
        e.preventDefault();
        return;
      }

      // Skip other modifier key combinations
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return
      }

      // Tool shortcuts (handled by EditorStore)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [arrowDrawingState, cancelArrow, selectElement, undo, redo, canUndo, canRedo])

  // Update the container ref handling in the EditorPage component
  useEffect(() => {
    if (!containerRef) return;

    // Set absolute minimum dimensions to ensure visibility
    const MIN_WIDTH = isMobile ? 320 : 640;
    const MIN_HEIGHT = isMobile ? 400 : 480;
    
    // Only initialize dimensions once to prevent update loops
    if (dimensionsInitializedRef.current) {
      return;
    }

    const initializeDimensions = () => {
      const rect = containerRef.getBoundingClientRect();
      
      // Only proceed if we have reasonable dimensions
      if (rect.width < 100 || rect.height < 100) {
        console.warn("Container has invalid initial dimensions, using minimums");
        setCanvasDimensions(MIN_WIDTH, MIN_HEIGHT);
        return;
      }
      
      // Apply minimum dimensions if needed
      const width = Math.max(rect.width, MIN_WIDTH);
      const height = Math.max(rect.height, MIN_HEIGHT);
      
      setCanvasDimensions(width, height);
      dimensionsInitializedRef.current = true;
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      initializeDimensions();
      
      // On mobile, recalculate dimensions once when device orientation changes
      if (isMobile) {
        const handleOrientationChange = () => {
          dimensionsInitializedRef.current = false; // Allow one update after orientation change
          
          // Wait for orientation change to complete
          setTimeout(() => {
            initializeDimensions();
          }, 500);
        };
        
        window.addEventListener('orientationchange', handleOrientationChange);
        return () => window.removeEventListener('orientationchange', handleOrientationChange);
      }
    });
  }, [containerRef, setCanvasDimensions, isMobile]);

  // UNIFIED LAYOUT for mobile and desktop
  return (
    <div className="flex flex-col h-screen bg-[#0D1117] overflow-hidden">
      {/* Toolbar row */}
      <div className="bg-[#0D1117] border-b border-[#30363D] py-2 px-3">
        <EditorToolbar />
      </div>

      {/* Main content area - full width */}
      <div className="flex-1 bg-[#0D1117] relative overflow-hidden"> 
        <div 
          className="w-full h-full"
          ref={setContainerRef}
          style={{ 
            minHeight: isMobile ? '400px' : '480px',
            minWidth: isMobile ? '320px' : '640px',
          }}
        >
          <TacticalBoard />
        </div>
      </div>

      {/* Status bar with context-sensitive tips and undo/redo for mobile */}
      <div className="bg-[#161B22] border-t border-[#30363D] py-2 px-3 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div>
            {mode === 'select' && 'Tap elements to select, drag to move'}
            {mode === 'player' && 'Tap on field to place players'}
            {mode === 'arrow' && 'Tap to start arrow, tap again to end'}
            {mode === 'text' && 'Tap on field to add text'}
          </div>
          
          {/* History controls for mobile */}
          {isMobile && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-white rounded-md"
                disabled={!canUndo}
                onClick={undo}
              >
                <Undo className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-400 hover:text-white rounded-md"
                disabled={!canRedo}
                onClick={redo}
              >
                <Redo className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

