"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useEditorStore, type ArrowStyle } from "@/store/useEditorStore"
import { Trash2, Save, PenLineIcon as StraightLine, LineChart, Minus, Palette, Maximize, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

export function ArrowPropertiesPanel() {
  const { arrows, selectedElementId, updateArrow, removeArrow, selectElement } = useEditorStore()
  const [width, setWidth] = useState<number>(2)
  const [style, setStyle] = useState<ArrowStyle>("solid")
  const [color, setColor] = useState<string>("#6366F1")
  const [hasChanges, setHasChanges] = useState(false)

  // Find the selected arrow
  const selectedArrow = arrows.find((arrow) => arrow.id === selectedElementId)

  // Update local state when selected arrow changes
  useEffect(() => {
    if (selectedArrow) {
      setWidth(selectedArrow.width)
      setStyle(selectedArrow.style)
      setColor(selectedArrow.color)
      setHasChanges(false)
    }
  }, [selectedArrow])

  // If no arrow is selected, don't render anything
  if (!selectedArrow) {
    return null
  }

  const handleWidthChange = (value: number[]) => {
    setWidth(value[0])
    setHasChanges(true)
  }

  const handleStyleChange = (newStyle: ArrowStyle) => {
    setStyle(newStyle)
    setHasChanges(true)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
    setHasChanges(true)
  }

  const handleApply = () => {
    if (selectedArrow) {
      updateArrow(selectedArrow.id, {
        width,
        style,
        color,
      })
      setHasChanges(false)

      // Explicitly ensure this arrow stays selected
      setTimeout(() => {
        selectElement(selectedArrow.id)
      }, 0)
    }
  }

  const handleDelete = () => {
    if (selectedArrow && window.confirm("Are you sure you want to delete this arrow?")) {
      removeArrow(selectedArrow.id)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
          <StraightLine className="h-4 w-4 text-primary" />
          Arrow Properties
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete arrow</span>
        </Button>
      </div>

      <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D] space-y-4">
        {/* Arrow preview */}
        <div className="flex items-center justify-center mb-2 h-16">
          <svg width="200" height="40" viewBox="0 0 200 40" className="overflow-visible">
            <path
              d={`M 40,20 Q 100,${style === "solid" ? "20" : "5"} 160,20`}
              stroke={color}
              strokeWidth={width}
              strokeDasharray={
                style === "dashed" ? `${width * 3} ${width * 2}` : style === "dotted" ? `${width} ${width * 2}` : "none"
              }
              fill="none"
            />
            <polygon points="160,20 150,15 150,25" fill={color} />
          </svg>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5 text-gray-300">
              <Sliders className="h-3.5 w-3.5 text-gray-400" />
              Arrow Style
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={style === "solid" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStyleChange("solid")}
                className={cn(
                  "h-9",
                  style === "solid"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <StraightLine className="h-4 w-4 mr-1" />
                Solid
              </Button>
              <Button
                variant={style === "dashed" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStyleChange("dashed")}
                className={cn(
                  "h-9",
                  style === "dashed"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <LineChart className="h-4 w-4 mr-1" />
                Dashed
              </Button>
              <Button
                variant={style === "dotted" ? "default" : "outline"}
                size="sm"
                onClick={() => handleStyleChange("dotted")}
                className={cn(
                  "h-9",
                  style === "dotted"
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D]",
                )}
              >
                <Minus className="h-4 w-4 mr-1" />
                Dotted
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5 text-gray-300">
                <Maximize className="h-3.5 w-3.5 text-gray-400" />
                Line Width: {width}px
              </Label>
            </div>
            <Slider value={[width]} min={1} max={10} step={1} onValueChange={handleWidthChange} className="py-2" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1.5 text-gray-300">
              <Palette className="h-3.5 w-3.5 text-gray-400" />
              Arrow Color
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
        </div>
      </div>

      <div className="bg-[#0D1117] rounded-lg border border-[#30363D] p-3 text-xs text-gray-300 space-y-2">
        <p className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
          <strong>Drag points:</strong> Move any of the three points to adjust the arrow
        </p>
        <p className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          <strong>Adjust curve:</strong> Drag the green control point to change the curve
        </p>
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
        Apply Changes
      </Button>
    </div>
  )
}

