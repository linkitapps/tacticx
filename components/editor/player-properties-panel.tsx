"use client"

import { cn } from "@/lib/utils"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/store/useEditorStore"
import { User, Type, Hash, Trash2, Save, Palette } from "lucide-react"

export function PlayerPropertiesPanel() {
  const { players, selectedElementId, updatePlayer, removePlayer } = useEditorStore()
  const [number, setNumber] = useState<number>(1)
  const [name, setName] = useState<string>("")
  const [color, setColor] = useState<string>("#6366F1")
  const [hasChanges, setHasChanges] = useState(false)

  // Find the selected player
  const selectedPlayer = players.find((player) => player.id === selectedElementId)

  // Update local state when selected player changes
  useEffect(() => {
    if (selectedPlayer) {
      setNumber(selectedPlayer.number)
      setName(selectedPlayer.label || "")
      setColor(selectedPlayer.color)
      setHasChanges(false)
    }
  }, [selectedPlayer])

  // If no player is selected, don't render anything
  if (!selectedPlayer) {
    return null
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 99) {
      setNumber(value)
      setHasChanges(true)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setHasChanges(true)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
    setHasChanges(true)
  }

  const handleApply = () => {
    if (selectedPlayer) {
      updatePlayer(selectedPlayer.id, {
        number,
        label: name,
        color,
      })
      setHasChanges(false)
    }
  }

  const handleDelete = () => {
    if (selectedPlayer && window.confirm("Are you sure you want to delete this player?")) {
      removePlayer(selectedPlayer.id)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
          <User className="h-4 w-4 text-primary" />
          Player Properties
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete player</span>
        </Button>
      </div>

      <div className="p-4 bg-[#0D1117] rounded-lg border border-[#30363D] space-y-4">
        {/* Player preview */}
        <div className="flex items-center justify-center mb-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 0 2px #30363D, 0 0 10px 2px ${color}40`,
            }}
          >
            {number}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="player-number-edit" className="text-xs flex items-center gap-1.5 text-gray-300">
              <Hash className="h-3.5 w-3.5 text-gray-400" />
              Number
            </Label>
            <Input
              id="player-number-edit"
              type="number"
              min="1"
              max="99"
              value={number}
              onChange={handleNumberChange}
              className="h-9 bg-[#21262D] border-[#30363D] focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-name" className="text-xs flex items-center gap-1.5 text-gray-300">
              <Type className="h-3.5 w-3.5 text-gray-400" />
              Name/Label
            </Label>
            <Input
              id="player-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter player name or position"
              className="h-9 bg-[#21262D] border-[#30363D] focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-color" className="text-xs flex items-center gap-1.5 text-gray-300">
              <Palette className="h-3.5 w-3.5 text-gray-400" />
              Player Color
            </Label>
            <div className="flex gap-2">
              <div className="w-9 h-9 rounded border border-[#30363D]" style={{ backgroundColor: color }} />
              <Input
                id="player-color"
                type="color"
                value={color}
                onChange={handleColorChange}
                className="h-9 flex-1 bg-[#21262D] border-[#30363D] focus:border-primary"
              />
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
        Apply Changes
      </Button>
    </div>
  )
}

