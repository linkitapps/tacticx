"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface MarkdownEditorProps {
  initialContent: string
  fileName: string
  onSave: (content: string) => void
  onCancel: () => void
}

export function MarkdownEditor({ initialContent, fileName, onSave, onCancel }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
  }, [])

  const handleSave = () => {
    onSave(content)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{fileName}</h2>
        <div>
          <Button variant="outline" size="sm" onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 p-4 bg-[#252525] rounded border border-[#333] text-white resize-none focus:outline-none"
        placeholder="Write your documentation here..."
      />
    </div>
  )
}

