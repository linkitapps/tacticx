"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formations } from "@/lib/formations"
import { useEditorStore } from "@/store/useEditorStore"
import { Rows3, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function FormationSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { applyFormation } = useEditorStore()

  const handleSelectFormation = (formationName: string) => {
    try {
      // Find the formation by name
      const formation = formations.find((f) => f.name === formationName)

      // Check if formation exists
      if (!formation) {
        console.error(`Formation "${formationName}" not found`)
        return
      }

      // Apply the formation directly
      applyFormation(formation)
      setIsOpen(false)
    } catch (error) {
      console.error("Error applying formation:", error)
    }
  }

  // Common formations to show as quick access buttons
  const commonFormations = ["4-4-2", "4-3-3", "4-2-3-1"]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
        <Rows3 className="h-4 w-4 text-primary" />
        Formations
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {commonFormations.map((name) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            onClick={() => handleSelectFormation(name)}
            className="h-10 bg-[#21262D] hover:bg-[#30363D] border-[#30363D] hover:border-[#6E7681] font-medium"
          >
            {name}
          </Button>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-[#21262D] hover:bg-[#30363D] border-[#30363D] hover:border-[#6E7681] flex items-center justify-between"
          >
            <span>More Formations</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#161B22] border-[#30363D]">
          <DialogHeader>
            <DialogTitle className="text-white">Choose a Formation</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {formations.map((formation) => (
              <Button
                key={formation.name}
                variant="outline"
                onClick={() => handleSelectFormation(formation.name)}
                className={cn(
                  "justify-center h-12 text-base bg-[#21262D] hover:bg-[#30363D] border-[#30363D] hover:border-[#6E7681]",
                  commonFormations.includes(formation.name) && "border-primary/50",
                )}
              >
                {formation.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

