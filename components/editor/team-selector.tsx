"use client"

import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { Shield } from "lucide-react"

export function TeamSelector() {
  const { selectedTeam, setSelectedTeam } = useEditorStore()

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase text-[#999] font-medium flex items-center gap-1.5">
        <Shield className="h-3.5 w-3.5" />
        Active Team
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => setSelectedTeam("home")}
          className={cn(
            "h-10 relative overflow-hidden transition-all border",
            selectedTeam === "home"
              ? "bg-primary/20 text-white border-primary"
              : "bg-[#252525] hover:bg-[#333] border-[#333] hover:border-primary/50",
          )}
        >
          <span className="relative z-10 font-medium">Home</span>
          {selectedTeam === "home" && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => setSelectedTeam("away")}
          className={cn(
            "h-10 relative overflow-hidden transition-all border",
            selectedTeam === "away"
              ? "bg-highlight/20 text-white border-highlight"
              : "bg-[#252525] hover:bg-[#333] border-[#333] hover:border-highlight/50",
          )}
        >
          <span className="relative z-10 font-medium">Away</span>
          {selectedTeam === "away" && (
            <div className="absolute inset-0 bg-gradient-to-r from-highlight/30 to-highlight/10" />
          )}
        </Button>
      </div>
    </div>
  )
}

