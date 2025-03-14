"use client"

import { useEditorStore } from "@/store/editorStoreImpl"
import PropertiesPanel from "./properties-panel"

export function EditorPropertiesSidebar() {
  const { 
    selectedElementId
  } = useEditorStore()
  
  if (!selectedElementId) {
    return (
      <div className="w-[300px] bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-white font-medium text-lg mb-4">Properties</h2>
        <div className="text-gray-400 text-center pt-6">
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-[300px] bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-white font-medium text-lg mb-4">Properties</h2>
      <PropertiesPanel />
    </div>
  )
} 