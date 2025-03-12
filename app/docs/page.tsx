"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MarkdownEditor } from "@/components/markdown-editor"
import { Loader2, FileText, Plus, Edit, Trash } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export default function DocsPage() {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { user, isLoading } = useAuth({ required: true })

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from("markdown").list()

      if (error) throw error

      setFiles(data.map((file) => file.name))
      setLoading(false)
    } catch (error) {
      console.error("Error fetching files:", error)
      setLoading(false)
    }
  }

  const fetchFileContent = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from("markdown").download(fileName)

      if (error) throw error

      const content = await data.text()
      setFileContent(content)
      setSelectedFile(fileName)
    } catch (error) {
      console.error("Error fetching file content:", error)
    }
  }

  const handleSave = async (content: string) => {
    try {
      const { data, error } = await supabase.storage.from("markdown").upload(`${selectedFile}`, content, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) throw error

      setIsEditing(false)
      fetchFiles()
    } catch (error) {
      console.error("Error saving file:", error)
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return

    try {
      const { error } = await supabase.storage.from("markdown").remove([fileName])

      if (error) throw error

      if (selectedFile === fileName) {
        setSelectedFile(null)
        setFileContent("")
      }

      fetchFiles()
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName) return

    try {
      const fileName = newFileName.endsWith(".md") ? newFileName : `${newFileName}.md`

      const { data, error } = await supabase.storage
        .from("markdown")
        .upload(fileName, "# New Document\n\nStart writing here...", {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) throw error

      setIsCreating(false)
      setNewFileName("")
      fetchFiles()
      fetchFileContent(fileName)
      setIsEditing(true)
    } catch (error) {
      console.error("Error creating file:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#121212] text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documentation</h1>
        <Button onClick={() => setIsCreating(!isCreating)} className="flex items-center gap-2">
          <Plus size={16} />
          New File
        </Button>
      </div>

      {isCreating && (
        <div className="mb-6 p-4 bg-[#1a1a1a] rounded border border-[#333]">
          <h2 className="text-lg font-semibold mb-2">Create New File</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.md"
              className="flex-1 px-3 py-2 bg-[#252525] border border-[#333] rounded"
            />
            <Button onClick={handleCreateFile}>Create</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* File list */}
        <div className="w-64 bg-[#1a1a1a] rounded border border-[#333] p-4 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Files</h2>

          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ul className="space-y-2">
              {files.length === 0 ? (
                <p className="text-sm text-gray-400">No files found</p>
              ) : (
                files.map((file) => (
                  <li
                    key={file}
                    className={`flex justify-between items-center p-2 rounded hover:bg-[#252525] ${
                      selectedFile === file ? "bg-[#252525]" : ""
                    }`}
                  >
                    <button className="flex items-center gap-2 text-left flex-1" onClick={() => fetchFileContent(file)}>
                      <FileText size={16} />
                      <span className="truncate">{file}</span>
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          fetchFileContent(file)
                          setIsEditing(true)
                        }}
                        className="p-1 hover:text-primary"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(file)} className="p-1 hover:text-red-500" title="Delete">
                        <Trash size={14} />
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedFile ? (
            isEditing ? (
              <MarkdownEditor
                initialContent={fileContent}
                fileName={selectedFile}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedFile}</h2>
                  <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
                <div
                  className="flex-1 overflow-auto p-4 bg-[#252525] rounded border border-[#333]"
                  dangerouslySetInnerHTML={{
                    __html: fileContent
                      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
                      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
                      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
                      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
                      .replace(/\*(.*)\*/gim, "<em>$1</em>")
                      .replace(/^- (.*$)/gim, "<li>$1</li>")
                      .replace(/<\/li>\n<li>/gim, "</li><li>")
                      .replace(/<li>(.*)<\/li>/gim, '<ul class="list-disc pl-5 my-2"><li>$1</li></ul>')
                      .replace(/\n/gim, "<br>"),
                  }}
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText size={48} className="mb-4 opacity-30" />
              <p>Select a file to view or edit</p>
              <p className="text-sm mt-2">Or create a new file to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

