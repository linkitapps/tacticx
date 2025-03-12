"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { Palette, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Preset colors for quick selection
const presetColors = [
  { value: "#19B8A6", name: "Teal" }, // Vibrant Teal (previously Indigo)
  { value: "#00D4FF", name: "Blue" }, // Highlight Neon
  { value: "#00FF7F", name: "Green" }, // Dynamic Green
  { value: "#FF3B30", name: "Red" }, // Red
  { value: "#FFCC00", name: "Yellow" }, // Yellow
  { value: "#5856D6", name: "Purple" }, // Purple
  { value: "#FFFFFF", name: "White" }, // White
  { value: "#000000", name: "Black" }, // Black
]

export function ColorSelector() {
  const { selectedColor, setSelectedColor } = useEditorStore()
  const [customColor, setCustomColor] = useState(selectedColor)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Update custom color when selected color changes
  useEffect(() => {
    setCustomColor(selectedColor)
  }, [selectedColor])

  // Handle custom color change
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    setSelectedColor(newColor)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase text-[#999] font-medium flex items-center gap-1.5">
        <Palette className="h-3.5 w-3.5" />
        Player Color
      </h3>

      {/* Color preview and picker toggle */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-md border border-gray-700 cursor-pointer"
          style={{ backgroundColor: selectedColor }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 bg-[#252525] border-[#333] hover:bg-[#333] flex-1"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          {showColorPicker ? "Hide Color Picker" : "Custom Color"}
        </Button>
      </div>

      {/* Custom color picker */}
      {showColorPicker && (
        <div className="p-2 bg-[#1a1a1a] rounded-md border border-[#333] mb-2">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            className="w-full h-8 bg-transparent cursor-pointer"
          />
          <div className="mt-2 text-xs text-gray-400 flex justify-between">
            <span>Current: {customColor}</span>
            <button
              className="text-primary hover:underline"
              onClick={() => {
                navigator.clipboard.writeText(customColor)
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Preset colors */}
      <div className="grid grid-cols-4 gap-2">
        {presetColors.map((color) => (
          <button
            key={color.value}
            className={cn(
              "w-full aspect-square rounded-md transition-all flex items-center justify-center",
              selectedColor === color.value
                ? "ring-2 ring-primary ring-offset-1 ring-offset-[#1a1a1a] scale-105 z-10"
                : "hover:scale-105",
            )}
            style={{
              backgroundColor: color.value,
              boxShadow: selectedColor === color.value ? `0 0 10px ${color.value}40` : "none",
            }}
            onClick={() => {
              setSelectedColor(color.value)
              setCustomColor(color.value)
            }}
            aria-label={`Select color ${color.name}`}
            title={color.name}
          >
            {selectedColor === color.value && (
              <span
                className={`text-xs font-bold ${
                  ["#FFFFFF", "#FFCC00", "#00FF7F"].includes(color.value) ? "text-black" : "text-white"
                }`}
              >
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

