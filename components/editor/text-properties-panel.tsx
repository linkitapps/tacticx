"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Trash2, Save, Type, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from "lucide-react"

export function TextPropertiesPanel() {
  const { textAnnotations, selectedElementId, updateText, removeText } = useEditorStore()
  const [text, setText] = useState("")
  const [fontSize, setFontSize] = useState(16)
  const [color, setColor] = useState("#FFFFFF")
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("center")
  const [hasChanges, setHasChanges] = useState(false)

  // Find the selected text annotation
  const selectedText = textAnnotations.find((text) => text.id === selectedElementId)

  // Update local state when selected text changes
  useEffect(() => {
    if (selectedText) {
      setText(selectedText.text)
      setFontSize(selectedText.fontSize || 16)
      setColor(selectedText.color || "#FFFFFF")
      setIsBold(selectedText.isBold || false)
      setIsItalic(selectedText.isItalic || false)
      setAlignment(selectedText.alignment || "center")
      setHasChanges(false)
    }
  }, [selectedText])

  // If no text is selected, don't render anything
  if (!selectedText) {
    return null
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setHasChanges(true)
  }

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0])
    setHasChanges(true)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
    setHasChanges(true)
  }

  const handleBoldToggle = () => {
    setIsBold(!isBold)
    setHasChanges(true)
  }

  const handleItalicToggle = () => {
    setIsItalic(!isItalic)
    setHasChanges(true)
  }

  const handleAlignmentChange = (align: "left" | "center" | "right") => {
    setAlignment(align)
    setHasChanges(true)
  }

  const handleApply = () => {
    if (selectedText) {
      updateText(selectedText.id, {
        text,
        fontSize,
        color,
        isBold,
        isItalic,
        alignment,
      })
      setHasChanges(false)
    }
  }

  const handleDelete = () => {
    if (selectedText && window.confirm("Are you sure you want to delete this text?")) {
      removeText(selectedText.id)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
          <Type className="h-4 w-4 text-primary" />
          Text Properties
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete text</span>
        </Button>
      </div>

      <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D] space-y-4">
        {/* Text preview */}
        <div
          className="p-3 bg-[#21262D] rounded-md border border-[#30363D] text-center mb-4 min-h-[60px] flex items-center justify-center"
          style={{
            color: color,
            fontWeight: isBold ? "bold" : "normal",
            fontStyle: isItalic ? "italic" : "normal",
            textAlign: alignment,
          }}
        >
          {text || "Text Preview"}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-content" className="text-xs flex items-center gap-1.5 text-gray-300">
              <Type className="h-3.5 w-3.5 text-gray-400" />
              Text Content
            </Label>
            <textarea
              id="text-content"
              value={text}
              onChange={handleTextChange}
              className="w-full min-h-[80px] rounded-md border border-[#30363D] bg-[#21262D] px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="Enter text"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5 text-gray-300">Font Size: {fontSize}px</Label>
            </div>
            <Slider
              value={[fontSize]}
              min={10}
              max={32}
              step={1}
              onValueChange={handleFontSizeChange}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5 text-gray-300">
              <Palette className="h-3.5 w-3.5 text-gray-400" />
              Text Color
            </Label>
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded border border-[#30363D]" style={{ backgroundColor: color }} />
              <Input
                type="color"
                value={color}
                onChange={handleColorChange}
                className="h-9 flex-1 bg-[#21262D] border-[#30363D] focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5 text-gray-300">Text Style</Label>
            <div className="flex gap-2">
              <Button
                variant={isBold ? "default" : "outline"}
                size="sm"
                onClick={handleBoldToggle}
                className={cn(
                  "h-9 flex-1",
                  isBold ? "bg-primary hover:bg-primary/90" : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <Bold className="h-4 w-4 mr-1" />
                Bold
              </Button>
              <Button
                variant={isItalic ? "default" : "outline"}
                size="sm"
                onClick={handleItalicToggle}
                className={cn(
                  "h-9 flex-1",
                  isItalic ? "bg-primary hover:bg-primary/90" : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <Italic className="h-4 w-4 mr-1" />
                Italic
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5 text-gray-300">Text Alignment</Label>
            <div className="flex gap-2">
              <Button
                variant={alignment === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => handleAlignmentChange("left")}
                className={cn(
                  "h-9 flex-1",
                  alignment === "left"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={alignment === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => handleAlignmentChange("center")}
                className={cn(
                  "h-9 flex-1",
                  alignment === "center"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={alignment === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => handleAlignmentChange("right")}
                className={cn(
                  "h-9 flex-1",
                  alignment === "right"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleApply}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 transition-all",
          hasChanges
            ? "bg-primary hover:bg-primary/90 text-white"
            : "bg-[#21262D] hover:bg-[#30363D] text-gray-400 border border-[#30363D]",
        )}
        disabled={!hasChanges}
      >
        <Save className="h-4 w-4" />
        <span className={hasChanges ? "text-white" : "text-gray-400"}>Apply Changes</span>
      </Button>
    </div>
  )
}

