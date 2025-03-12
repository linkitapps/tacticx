"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEditorStore } from "@/store/useEditorStore"

export function PlayerNumberSelector() {
  const { selectedPlayerNumber, setSelectedPlayerNumber } = useEditorStore()

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 99) {
      setSelectedPlayerNumber(value)
    }
  }

  const incrementNumber = () => {
    if (selectedPlayerNumber < 99) {
      setSelectedPlayerNumber(selectedPlayerNumber + 1)
    }
  }

  const decrementNumber = () => {
    if (selectedPlayerNumber > 1) {
      setSelectedPlayerNumber(selectedPlayerNumber - 1)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Player Number</h3>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={decrementNumber}
          disabled={selectedPlayerNumber <= 1}
          className="h-10 w-10"
        >
          -
        </Button>
        <Input
          type="number"
          min="1"
          max="99"
          value={selectedPlayerNumber}
          onChange={handleNumberChange}
          className="w-16 mx-2 text-center h-10"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={incrementNumber}
          disabled={selectedPlayerNumber >= 99}
          className="h-10 w-10"
        >
          +
        </Button>
      </div>
    </div>
  )
}

