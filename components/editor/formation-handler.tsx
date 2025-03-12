"use client"

import { useEffect } from "react"
import { useEditorStore } from "@/store/useEditorStore"

// This component handles the rotation of formations to match the horizontal pitch
export function FormationHandler() {
  const { applyFormation } = useEditorStore()

  // Override the applyFormation function to rotate formations
  useEffect(() => {
    const originalApplyFormation = applyFormation

    // Replace the applyFormation function with our rotated version
    useEditorStore.setState({
      applyFormation: (formation) => {
        // Create a rotated version of the formation
        const rotatedPositions = formation.positions.map((pos) => ({
          // Swap x and y coordinates and adjust for field dimensions
          // Assuming field is 800x600 (width x height)
          x: 400 + (pos.y - 300) * 0.8, // Center + scaled y offset
          y: 300 - (pos.x - 400) * 0.8, // Center - scaled x offset
          number: pos.number,
          team: pos.team,
        }))

        // Apply the rotated formation
        originalApplyFormation({
          ...formation,
          positions: rotatedPositions,
        })
      },
    })

    // Restore original function on unmount
    return () => {
      useEditorStore.setState({ applyFormation: originalApplyFormation })
    }
  }, [applyFormation])

  return null // This is a utility component with no UI
}

