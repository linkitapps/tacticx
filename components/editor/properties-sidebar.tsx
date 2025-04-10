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
        <h2 className="text-white font-medium text-lg mb-4">속성</h2>
        <div className="text-gray-400 text-center pt-6">
          <p>요소를 선택하여 속성을 편집하세요</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-[300px] bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <h2 className="text-white font-medium text-lg mb-4">속성</h2>
      <PropertiesPanel />
    </div>
  )
} 