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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditorStore } from "@/store/useEditorStore"
import { useState } from "react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function EditorToolbar() {
  const { mode, setMode, undo, redo, saveTactic, history, historyIndex, resetEditor } = useEditorStore()
  const [isSaving, setIsSaving] = useState(false)
  const isMobile = useMobile()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.players.length - 1

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const id = await saveTactic()
      toast.success("Tactic saved successfully!")
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
    { id: "select", icon: MousePointer, label: "Select Tool", shortcut: "V" },
    { id: "player", icon: Users, label: "Add Player", shortcut: "P" },
    { id: "arrow", icon: ArrowRight, label: "Add Arrow", shortcut: "A" },
    { id: "text", icon: Type, label: "Add Text", shortcut: "T" },
  ]

  // Mobile toolbar
  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-3 rounded-md shadow-sm">
        {/* Main tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={mode === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode(tool.id as any)}
              className={cn(
                "relative p-2",
                mode === tool.id
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-300 hover:text-white hover:bg-[#30363D]",
              )}
            >
              <tool.icon className="h-5 w-5" />
              {mode === tool.id && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"></span>
              )}
            </Button>
          ))}
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="p-2 text-gray-300 hover:text-white hover:bg-[#30363D] disabled:opacity-30"
          >
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="p-2 text-gray-300 hover:text-white hover:bg-[#30363D] disabled:opacity-30"
          >
            <Redo2 className="h-5 w-5" />
          </Button>
        </div>

        {/* More actions menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white hover:bg-[#30363D]">
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
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
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
                className="w-full bg-[#21262D] hover:bg-[#30363D] border-[#30363D]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Tactic
              </Button>

              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full bg-[#21262D] hover:bg-[#30363D] border-[#30363D]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Tactic
              </Button>

              <Button variant="destructive" onClick={handleReset} className="w-full">
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
      <div className="flex items-center gap-2 p-3 rounded-md">
        <div className="flex items-center gap-1 mr-2 bg-[#21262D] p-1 rounded-md border border-[#30363D]">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={mode === tool.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode(tool.id as any)}
                  className={cn(
                    "flex items-center gap-2 relative h-9",
                    mode === tool.id
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-300 hover:text-white hover:bg-[#30363D]",
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tool.label}</span>
                  {mode === tool.id && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"></span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
                <div className="flex flex-col">
                  <span>{tool.label}</span>
                  <span className="text-xs text-gray-400">Shortcut: {tool.shortcut}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#21262D] p-1 rounded-md border border-[#30363D]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                disabled={!canUndo}
                className="text-gray-300 hover:text-white hover:bg-[#30363D] disabled:opacity-30 h-9 w-9"
              >
                <Undo2 className="h-4 w-4" />
                <span className="sr-only">Undo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span>Undo</span>
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
                className="text-gray-300 hover:text-white hover:bg-[#30363D] disabled:opacity-30 h-9 w-9"
              >
                <Redo2 className="h-4 w-4" />
                <span className="sr-only">Redo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              <div className="flex flex-col">
                <span>Redo</span>
                <span className="text-xs text-gray-400">Shortcut: Ctrl+Y</span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-gray-300 hover:text-white hover:bg-[#30363D]"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
              Clear Board
            </TooltipContent>
          </Tooltip>

          <div className="bg-[#21262D] p-1 rounded-md border border-[#30363D] flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  className="text-gray-300 hover:text-white hover:bg-[#30363D]"
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
                Export Tactic
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-gray-300 hover:text-white hover:bg-[#30363D]"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
                Share Tactic
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 ml-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#21262D] border-[#30363D] text-white">
                <div className="flex flex-col">
                  <span>Save Tactic</span>
                  <span className="text-xs text-gray-400">Shortcut: Ctrl+S</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

