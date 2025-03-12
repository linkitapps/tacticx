"use client"

import type React from "react"

import { useState } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowLeftRight,
  CornerDownRight,
  CornerUpRight,
  MoveHorizontal,
  MoveVertical,
  Recycle,
  Workflow,
} from "lucide-react"
import { nanoid } from "nanoid"

// Define arrow templates
const arrowTemplates = [
  {
    id: "straight",
    name: "Straight",
    icon: ArrowRight,
    create: (x: number, y: number, color: string) => ({
      id: nanoid(),
      startX: x - 50,
      startY: y,
      endX: x + 50,
      endY: y,
      color,
      width: 2,
      style: "solid",
      type: "standard",
      headStyle: "triangle",
      controlPoints: [],
    }),
  },
  {
    id: "bidirectional",
    name: "Bidirectional",
    icon: ArrowLeftRight,
    create: (x: number, y: number, color: string) => ({
      id: nanoid(),
      startX: x - 50,
      startY: y,
      endX: x + 50,
      endY: y,
      color,
      width: 2,
      style: "solid",
      type: "bidirectional",
      headStyle: "triangle",
      controlPoints: [],
    }),
  },
  {
    id: "curved-right",
    name: "Curved Right",
    icon: CornerDownRight,
    create: (x: number, y: number, color: string) => ({
      id: nanoid(),
      startX: x - 50,
      startY: y - 30,
      endX: x + 50,
      endY: y + 30,
      color,
      width: 2,
      style: "solid",
      type: "curved",
      headStyle: "triangle",
      controlPoints: [{ x: x + 30, y: y - 30 }],
    }),
  },
  {
    id: "curved-left",
    name: "Curved Left",
    icon: CornerUpRight,
    create: (x: number, y: number, color: string) => ({
      id: nanoid(),
      startX: x - 50,
      startY: y + 30,
      endX: x + 50,
      endY: y - 30,
      color,
      width: 2,
      style: "solid",
      type: "curved",
      headStyle: "triangle",
      controlPoints: [{ x: x + 30, y: y + 30 }],
    }),
  },
  {
    id: "overlap",
    name: "Overlap",
    icon: MoveHorizontal,
    create: (x: number, y: number, color: string) => ({
      id: nanoid(),
      startX: x - 60,
      startY: y,
      endX: x + 60,
      endY: y,
      color,
      width: 2,
      style: "solid",
      type: "curved",
      headStyle: "triangle",
      controlPoints: [{ x, y: y - 40 }],
    }),
  },
  {
    id: "underlap",
    name: "Underlap",
    icon: MoveVertical,
    create: (x: number, y: number, color: string) => ({
      id: nanoid(),
      startX: x - 60,
      startY: y,
      endX: x + 60,
      endY: y,
      color,
      width: 2,
      style: "solid",
      type: "curved",
      headStyle: "triangle",
      controlPoints: [{ x, y: y + 40 }],
    }),
  },
  {
    id: "loop",
    name: "Loop",
    icon: Recycle,
    create: (x: number, y: number, color: string) => ({
      id: nanoid(),
      startX: x - 20,
      startY: y,
      endX: x + 20,
      endY: y,
      color,
      width: 2,
      style: "solid",
      type: "curved",
      headStyle: "triangle",
      controlPoints: [
        { x: x - 20, y: y - 40 },
        { x: x + 20, y: y - 40 },
      ],
    }),
  },
  {
    id: "sequence",
    name: "Sequence",
    icon: Workflow,
    create: (x: number, y: number, color: string) => {
      const currentSequenceNumber = useEditorStore.getState().currentSequenceNumber
      return {
        id: nanoid(),
        startX: x - 50,
        startY: y,
        endX: x + 50,
        endY: y,
        color,
        width: 2,
        style: "solid",
        type: "sequence",
        headStyle: "triangle",
        controlPoints: [],
        sequenceNumber: currentSequenceNumber,
      }
    },
  },
]

export function ArrowTemplates() {
  const { arrows, selectedColor } = useEditorStore()
  const [draggedTemplate, setDraggedTemplate] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, templateId: string) => {
    setDraggedTemplate(templateId)
    // Create a ghost image
    const ghostImage = document.createElement("div")
    ghostImage.style.width = "50px"
    ghostImage.style.height = "20px"
    ghostImage.style.background = "transparent"
    document.body.appendChild(ghostImage)
    e.dataTransfer.setDragImage(ghostImage, 25, 10)
    document.body.removeChild(ghostImage)
  }

  const handleDragEnd = () => {
    setDraggedTemplate(null)
  }

  const handleAddTemplate = (templateId: string) => {
    const template = arrowTemplates.find((t) => t.id === templateId)
    if (!template) return

    // Add the template to the center of the canvas
    const canvasWidth = useEditorStore.getState().canvasWidth
    const canvasHeight = useEditorStore.getState().canvasHeight

    const newArrow = template.create(canvasWidth / 2, canvasHeight / 2, selectedColor)

    useEditorStore.setState({
      arrows: [...arrows, newArrow],
      selectedElementId: newArrow.id,
      mode: "select",
    })

    useEditorStore.getState().saveToHistory()

    // Increment sequence number if needed
    if (templateId === "sequence") {
      useEditorStore.getState().incrementSequenceNumber()
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase text-[#999] font-medium flex items-center gap-1.5">
        <ArrowRight className="h-3.5 w-3.5" />
        Arrow Templates
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {arrowTemplates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            size="sm"
            className="h-9 p-1 bg-[#252525] hover:bg-[#333] border-[#333] flex flex-col items-center justify-center"
            draggable
            onDragStart={(e) => handleDragStart(e, template.id)}
            onDragEnd={handleDragEnd}
            onClick={() => handleAddTemplate(template.id)}
          >
            <template.icon className="h-4 w-4 mb-0.5" />
            <span className="text-[10px]">{template.name}</span>
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Click to add or drag templates onto the field</p>
    </div>
  )
}

