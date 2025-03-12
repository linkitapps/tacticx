"use client"

import {
  MousePointer,
  Users,
  ArrowRight,
  Type,
  Undo2,
  Redo2,
  Save,
  Share2,
  Download,
  Trash2,
  Menu,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditorStore } from "@/store/useEditorStore"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function EditorToolbar() {
  const { mode, setMode, undo, redo, saveTactic, history, historyIndex, resetEditor } = useEditorStore()
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const isMobile = useMobile()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.players.length - 1

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const id = await saveTactic()
      toast.success("Tactic saved successfully!")
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 2000)
    } catch (error) {
      toast.error("Failed to save tactic")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    // Future implementation for exporting tactics
    toast.success("Export feature coming soon!")
  }

  const handleShare = () => {
    // Future implementation for sharing tactics
    toast.success("Share feature coming soon!")
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the board? This action cannot be undone.")) {
      resetEditor()
      toast.success("Board cleared")
    }
  }

  const tools = [
    { id: "select", icon: MousePointer, label: "Select Tool", shortcut: "V", description: "Select and move elements" },
    { id: "player", icon: Users, label: "Add Player", shortcut: "P", description: "Place players on the field" },
    { id: "arrow", icon: ArrowRight, label: "Add Arrow", shortcut: "A", description: "Draw movement arrows" },
    { id: "text", icon: Type, label: "Add Text", shortcut: "T", description: "Add text annotations" },
  ]

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input or has modifier keys pressed
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
          setMode("select");
          break;
        case "p":
          setMode("player");
          break;
        case "a":
          setMode("arrow");
          break;
        case "t":
          setMode("text");
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMode, undo, redo]);

  // Mobile toolbar
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-3 rounded-md shadow-sm bg-[#161B22]/80 backdrop-blur-sm">
        {/* Main tools */}
        <div className="flex items-center gap-1 bg-[#21262D]/80 p-1 rounded-md border border-[#30363D]">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={mode === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode(tool.id as any)}
              className={cn(
                "relative p-2 transition-all duration-150",
                mode === tool.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-gray-300 hover:text-white hover:bg-[#30363D]",
              )}
            >
              <tool.icon className="h-5 w-5" />
              {mode === tool.id && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full animate-pulse"></span>
              )}
            </Button>
          ))}
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 bg-[#21262D]/80 p-1 rounded-md border border-[#30363D]">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="p-2 text-gray-300 hover:text-white hover:bg-[#30363D] disabled:opacity-30 transition-opacity"
          >
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="p-2 text-gray-300 hover:text-white hover:bg-[#30363D] disabled:opacity-30 transition-opacity"
          >
            <Redo2 className="h-5 w-5" />
          </Button>
        </div>

        {/* More actions menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white hover:bg-[#30363D] bg-[#21262D]/80 border border-[#30363D] rounded-md">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#161B22] border-t border-[#30363D]">
            <SheetHeader>
              <SheetTitle className="text-white">Actions</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Button
                variant="default"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "w-full relative overflow-hidden", 
                  showSaveSuccess ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90",
                  "transition-colors duration-300"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Tactic
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full bg-[#21262D]/80 hover:bg-[#30363D] border-[#30363D] transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Tactic
              </Button>

              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full bg-[#21262D]/80 hover:bg-[#30363D] border-[#30363D] transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Tactic
              </Button>

              <Button 
                variant="destructive" 
                onClick={handleReset} 
                className="w-full transition-all active:scale-[0.98] hover:bg-red-600/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Board
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  // Desktop toolbar
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 p-3 rounded-md bg-[#161B22]/95 backdrop-blur-sm">
        {/* Tool group */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[#21262D]/90 rounded-md border border-[#30363D] shadow-sm">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === tool.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode(tool.id as any)}
                  className={cn(
                    "flex items-center gap-2 relative h-9 transition-all duration-150",
                    mode === tool.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-300 hover:text-white hover:bg-[#30363D]",
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tool.label}</span>
                  {mode === tool.id && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full animate-pulse"></span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
                <div className="flex flex-col">
                  <span className="font-medium">{tool.label}</span>
                  <span className="text-xs text-gray-400">{tool.description}</span>
                  <span className="text-xs text-gray-400 mt-1">Shortcut: {tool.shortcut}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* History group */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[#21262D]/90 rounded-md border border-[#30363D] shadow-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-[#30363D] h-9 w-9 transition-all",
                  !canUndo ? "opacity-40 cursor-not-allowed" : "opacity-100"
                )}
              >
                <Undo2 className="h-4 w-4" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span className="font-medium">Undo</span>
                <span className="text-xs text-gray-400">Shortcut: Ctrl+Z</span>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                disabled={!canRedo}
                className={cn(
                  "text-gray-300 hover:text-white hover:bg-[#30363D] h-9 w-9 transition-all",
                  !canRedo ? "opacity-40 cursor-not-allowed" : "opacity-100"
                )}
              >
                <Redo2 className="h-4 w-4" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span className="font-medium">Redo</span>
                <span className="text-xs text-gray-400">Shortcut: Ctrl+Shift+Z</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Actions group */}
        <div className="flex items-center gap-1 px-2 py-1 bg-[#21262D]/90 rounded-md border border-[#30363D] shadow-sm ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showSaveSuccess ? "default" : "ghost"}
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "flex items-center gap-2 h-9 transition-all",
                  showSaveSuccess ? "bg-green-600 hover:bg-green-600/90 text-white" : "text-gray-300 hover:text-white hover:bg-[#30363D]",
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : showSaveSuccess ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span className="font-medium">Save Tactic</span>
                <span className="text-xs text-gray-400">Save your current tactical setup</span>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center gap-2 h-9 text-gray-300 hover:text-white hover:bg-[#30363D] transition-all">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span className="font-medium">Share Tactic</span>
                <span className="text-xs text-gray-400">Create a shareable link</span>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleExport} className="flex items-center gap-2 h-9 text-gray-300 hover:text-white hover:bg-[#30363D] transition-all">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span className="font-medium">Export Tactic</span>
                <span className="text-xs text-gray-400">Download as image</span>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleReset} className="flex items-center gap-2 h-9 text-red-500 hover:text-white hover:bg-red-600 transition-all">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span className="font-medium">Clear Board</span>
                <span className="text-xs text-red-400">Remove all elements</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Current mode indicator for desktop */}
        <div className="hidden sm:block absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-[#21262D] rounded-full px-3 py-1 text-xs font-medium border border-[#30363D] shadow-md text-white">
          {tools.find(t => t.id === mode)?.label || "Select Mode"}
        </div>
      </div>
    </TooltipProvider>
  )
}

