"use client"

import { useEffect, useState } from "react"
import { TacticalBoard } from "@/components/editor/tactical-board"
import { EditorToolbar } from "@/components/editor/toolbar"
import { PlayerPropertiesPanel } from "@/components/editor/player-properties-panel"
import { ArrowPropertiesPanel } from "@/components/editor/arrow-properties-panel"
import { FormationSelector } from "@/components/editor/formation-selector"
import { TacticSettings } from "@/components/editor/tactic-settings"
import { useEditorStore } from "@/store/useEditorStore"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Settings, PanelLeft, PanelRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// Import the TextPropertiesPanel
import { TextPropertiesPanel } from "@/components/editor/text-properties-panel"

export default function EditorPage() {
  const { selectedElementId, arrows, players, setCanvasDimensions, textAnnotations } = useEditorStore()
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const isMobile = useMobile()
  const [showLeftSidebar, setShowLeftSidebar] = useState(!isMobile)
  const [showRightSidebar, setShowRightSidebar] = useState(!isMobile)

  // Determine which properties panel to show based on the selected element
  const selectedArrow = arrows.find((arrow) => arrow.id === selectedElementId)
  const selectedPlayer = players.find((player) => player.id === selectedElementId)
  const selectedText = textAnnotations.find((text) => text.id === selectedElementId)

  // Update canvas dimensions when the container size changes
  useEffect(() => {
    if (!containerRef) return

    const updateDimensions = () => {
      const { width, height } = containerRef.getBoundingClientRect()
      setCanvasDimensions(width, height)
    }

    // Initial update
    updateDimensions()

    // Update on resize
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef)

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, setCanvasDimensions])

  // For mobile, use sheets instead of sidebars
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-[#0D1117]">
        <div className="p-2 bg-[#161B22] border-b border-[#30363D]">
          <EditorToolbar />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-hidden" ref={setContainerRef}>
            <TacticalBoard />
          </div>
        </div>

        {/* Mobile bottom sheets */}
        <div className="flex justify-between p-2 bg-[#161B22] border-t border-[#30363D]">
          {/* Formations & Settings Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#21262D] border-[#30363D] hover:bg-[#30363D] hover:border-[#6E7681]"
              >
                <PanelLeft className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#161B22] border-r border-[#30363D] w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-white">Tactic Settings</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <FormationSelector />
                <TacticSettings />
              </div>
            </SheetContent>
          </Sheet>

          {/* Properties Sheet - only show if something is selected */}
          {(selectedPlayer || selectedArrow || selectedText) && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#21262D] border-[#30363D] hover:bg-[#30363D] hover:border-[#6E7681]"
                >
                  <PanelRight className="h-4 w-4 mr-2" />
                  Properties
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#161B22] border-l border-[#30363D] w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="text-white">
                    {selectedPlayer ? "Player Properties" : selectedArrow ? "Arrow Properties" : "Text Properties"}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {selectedPlayer && <PlayerPropertiesPanel />}
                  {selectedArrow && <ArrowPropertiesPanel />}
                  {selectedText && <TextPropertiesPanel />}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    )
  }

  // Desktop layout with collapsible sidebars
  return (
    <div className="flex flex-col h-screen bg-[#0D1117]">
      <div className="p-3 bg-[#161B22] border-b border-[#30363D] shadow-sm">
        <EditorToolbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out bg-[#161B22] border-r border-[#30363D] overflow-y-auto",
            showLeftSidebar ? "w-72 opacity-100" : "w-0 opacity-0",
          )}
        >
          {showLeftSidebar && (
            <div className="p-4 space-y-6">
              <FormationSelector />
              <TacticSettings />
            </div>
          )}
        </div>

        {/* Left sidebar toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          className={cn(
            "absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#161B22] border border-[#30363D] rounded-r-md rounded-l-none h-20 transition-all duration-300",
            showLeftSidebar ? "left-72" : "left-0",
          )}
        >
          {showLeftSidebar ? (
            <ChevronLeft className="h-5 w-5 text-gray-300" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-300" />
          )}
        </Button>

        {/* Main content */}
        <div className="flex-1 overflow-hidden relative" ref={setContainerRef}>
          <TacticalBoard />

          {/* Overlay when no element is selected */}
          {!selectedPlayer && !selectedArrow && showRightSidebar && (
            <div className="absolute inset-0 bg-gradient-to-l from-[#161B22]/10 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Right sidebar toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRightSidebar(!showRightSidebar)}
          className={cn(
            "absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#161B22] border border-[#30363D] rounded-l-md rounded-r-none h-20 transition-all duration-300",
            showRightSidebar ? "right-72" : "right-0",
          )}
        >
          {showRightSidebar ? (
            <ChevronRight className="h-5 w-5 text-gray-300" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-300" />
          )}
        </Button>

        {/* Right sidebar - Properties panel */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out bg-[#161B22] border-l border-[#30363D] overflow-y-auto",
            showRightSidebar ? "w-72 opacity-100" : "w-0 opacity-0",
          )}
        >
          {showRightSidebar && (
            <div className="p-4">
              {selectedPlayer && <PlayerPropertiesPanel />}
              {selectedArrow && <ArrowPropertiesPanel />}
              {selectedText && <TextPropertiesPanel />}
              {!selectedPlayer && !selectedArrow && !selectedText && (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-gray-400 p-6">
                  <Settings className="h-12 w-12 mb-4 text-gray-500 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Element Selected</h3>
                  <p className="text-sm">Select a player, arrow, or text on the field to edit its properties</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

