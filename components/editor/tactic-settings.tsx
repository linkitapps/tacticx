"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useEditorStore } from "@/store/useEditorStore"
import { Globe, Lock, FileText, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function TacticSettings() {
  const { tacticTitle, tacticDescription, isPublic, setTacticTitle, setTacticDescription, setIsPublic } =
    useEditorStore()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(tacticTitle)
  const [description, setDescription] = useState(tacticDescription)
  const [visibility, setVisibility] = useState(isPublic)

  const handleSave = () => {
    setTacticTitle(title)
    setTacticDescription(description)
    setIsPublic(visibility)
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTitle(tacticTitle)
      setDescription(tacticDescription)
      setVisibility(isPublic)
    }
    setIsOpen(open)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white flex items-center gap-1.5">
        <FileText className="h-4 w-4 text-primary" />
        Tactic Settings
      </h3>

      <div className="bg-[#0D1117] rounded-lg border border-[#30363D] overflow-hidden">
        <div className="p-4">
          <h4 className="font-medium text-white truncate mb-1">{tacticTitle || "Untitled Tactic"}</h4>
          {tacticDescription && <p className="text-xs text-gray-300 mb-2 line-clamp-2">{tacticDescription}</p>}
          <p className="text-xs flex items-center gap-1 text-gray-300">
            {isPublic ? (
              <>
                <Globe className="h-3 w-3 text-green-400" />
                <span className="text-green-400">Public</span>
                <span className="text-gray-500 mx-1">•</span>
                <span className="text-gray-400">Anyone with the link can view</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-400">Private</span>
                <span className="text-gray-500 mx-1">•</span>
                <span className="text-gray-400">Only you can view</span>
              </>
            )}
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between rounded-none border-t border-[#30363D] p-3 h-auto text-sm text-gray-300 hover:bg-[#21262D]"
            >
              <span>Edit Settings</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161B22] border-[#30363D]">
            <DialogHeader>
              <DialogTitle className="text-white">Tactic Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tactic-title" className="text-gray-300">
                  Title
                </Label>
                <Input
                  id="tactic-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter tactic title"
                  className="bg-[#21262D] border-[#30363D] focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tactic-description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="tactic-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter tactic description (optional)"
                  className="bg-[#21262D] border-[#30363D] focus:border-primary min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Visibility</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={visibility ? "default" : "outline"}
                    onClick={() => setVisibility(true)}
                    type="button"
                    className={cn(
                      "flex items-center gap-2 h-auto py-3",
                      visibility
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D] text-gray-300",
                    )}
                  >
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">Public</span>
                      </div>
                      <span className="text-xs opacity-80">Anyone with the link</span>
                    </div>
                  </Button>
                  <Button
                    variant={!visibility ? "default" : "outline"}
                    onClick={() => setVisibility(false)}
                    type="button"
                    className={cn(
                      "flex items-center gap-2 h-auto py-3",
                      !visibility
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : "bg-[#21262D] hover:bg-[#30363D] border-[#30363D] text-gray-300",
                    )}
                  >
                    <div className="flex flex-col items-start text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">Private</span>
                      </div>
                      <span className="text-xs opacity-80">Only you can view</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

