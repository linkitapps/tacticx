"use client"

import {
  MousePointer,
  User,
  ArrowRight,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditorStore } from "@/store/editorStoreImpl"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

export function EditorToolbar() {
  const { mode, setMode } = useEditorStore()
  const isMobile = useMobile()

  // Define the drawing tools
  const tools = [
    {
      id: "select",
      label: "Select",
      icon: MousePointer,
      description: "Select and move elements",
      shortcut: "V",
    },
    {
      id: "player",
      label: "Player",
      icon: User, // Changed from Users to User for single player icon
      description: "Add individual players to the field",
      shortcut: "P",
    },
    {
      id: "arrow",
      label: "Arrow",
      icon: ArrowRight,
      description: "Draw tactical arrows",
      shortcut: "A",
    },
    {
      id: "text",
      label: "Text",
      icon: Type,
      description: "Add text annotations",
      shortcut: "T",
    },
  ]
  
  // Mobile toolbar
  if (isMobile) {
    return (
      <div className="flex items-center justify-center p-2 rounded-md bg-[#21262D]/80 border border-[#30363D]">
        {/* Main tools */}
        <div className="flex items-center gap-1">
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

        {/* Current mode indicator for desktop */}
        <div className="hidden sm:block absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-[#21262D] rounded-full px-3 py-1 text-xs font-medium border border-[#30363D] shadow-md text-white">
          {tools.find(t => t.id === mode)?.label || "Select Mode"}
        </div>
      </div>
    </TooltipProvider>
  )
}

