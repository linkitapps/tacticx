"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useEditorStore, type ArrowType } from "@/store/useEditorStore"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface ArrowMarkerProps {
  arrow: ArrowType
}

export function ArrowMarker({ arrow }: ArrowMarkerProps) {
  const { removeArrow, selectElement, selectedElementId, mode, updateArrow } = useEditorStore()
  const isMobile = useMobile()
  const [isDraggingPoint, setIsDraggingPoint] = useState<"start" | "end" | "control" | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const elementRef = useRef<SVGGElement>(null)

  const isSelected = selectedElementId === arrow.id

  // Handle interaction (click or touch)
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Stop event propagation to prevent deselection
    e.stopPropagation()
    if ("preventDefault" in e) e.preventDefault()

    // Select this arrow
    selectElement(arrow.id)

    // If not in select mode, switch to select mode
    if (mode !== "select") {
      useEditorStore.setState({ mode: "select" })
    }
  }

  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if ("preventDefault" in e) e.preventDefault()
    removeArrow(arrow.id)
  }

  // Get coordinates from either mouse or touch event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const svg = elementRef.current?.closest("svg")
    if (!svg) return { x: 0, y: 0 }

    const rect = svg.getBoundingClientRect()

    // Handle touch event
    if ("touches" in e) {
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
    }

    // Handle mouse event
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // Handle point interaction start (mousedown or touchstart)
  const handlePointInteractionStart = (e: React.MouseEvent | React.TouchEvent, point: "start" | "end" | "control") => {
    e.stopPropagation()
    if ("preventDefault" in e) e.preventDefault()

    // Ensure this arrow is selected when manipulating points
    if (selectedElementId !== arrow.id) {
      selectElement(arrow.id)
    }

    setIsDraggingPoint(point)

    // Add a class to the body to indicate dragging is in progress
    document.body.classList.add("arrow-point-dragging")
  }

  // Handle pointer move (mousemove or touchmove)
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDraggingPoint === null) return

    const { x, y } = getCoordinates(e)
    const svg = elementRef.current?.closest("svg")
    if (!svg) return

    // Use direct DOM manipulation for smoother dragging
    if (isDraggingPoint === "start") {
      // Update the DOM elements directly
      const pathElements = svg.querySelectorAll(`path[data-arrow-id="${arrow.id}"]`)
      pathElements.forEach((path) => {
        const d = path.getAttribute("d") || ""
        const newD = d.replace(/M\s+[\d.]+\s+[\d.]+/, `M ${x} ${y}`)
        path.setAttribute("d", newD)
      })

      // Update control point lines if they exist
      const controlLines = svg.querySelectorAll(`line[data-arrow-id="${arrow.id}"][data-line-type="start-control"]`)
      controlLines.forEach((line) => {
        line.setAttribute("x1", x.toString())
        line.setAttribute("y1", y.toString())
      })

      // Update start point circle
      const startCircles = svg.querySelectorAll(`circle[data-arrow-id="${arrow.id}"][data-point-type="start"]`)
      startCircles.forEach((circle) => {
        circle.setAttribute("cx", x.toString())
        circle.setAttribute("cy", y.toString())
      })

      // Store the values to apply on mouse up
      arrow._tempStartX = x
      arrow._tempStartY = y
    } else if (isDraggingPoint === "end") {
      // Update the DOM elements directly
      const pathElements = svg.querySelectorAll(`path[data-arrow-id="${arrow.id}"]`)
      pathElements.forEach((path) => {
        const d = path.getAttribute("d") || ""
        // Replace the end coordinates in the path
        const newD = d.replace(/(\s+[\d.]+\s+[\d.]+)$/, ` ${x} ${y}`)
        path.setAttribute("d", newD)
      })

      // Update control point lines if they exist
      const controlLines = svg.querySelectorAll(`line[data-arrow-id="${arrow.id}"][data-line-type="end-control"]`)
      controlLines.forEach((line) => {
        line.setAttribute("x1", x.toString())
        line.setAttribute("y1", y.toString())
      })

      // Update end point circle
      const endCircles = svg.querySelectorAll(`circle[data-arrow-id="${arrow.id}"][data-point-type="end"]`)
      endCircles.forEach((circle) => {
        circle.setAttribute("cx", x.toString())
        circle.setAttribute("cy", y.toString())
      })

      // Update arrow head
      const arrowHead = svg.querySelector(`polygon[data-arrow-id="${arrow.id}"]`)
      if (arrowHead) {
        // Calculate new arrow head points
        const dx = x - arrow.controlX
        const dy = y - arrow.controlY
        const angle = Math.atan2(dy, dx)
        const headLength = 15
        const headAngle = Math.PI / 6
        const headX1 = x - headLength * Math.cos(angle - headAngle)
        const headY1 = y - headLength * Math.sin(angle - headAngle)
        const headX2 = x - headLength * Math.cos(angle + headAngle)
        const headY2 = y - headLength * Math.sin(angle + headAngle)
        arrowHead.setAttribute("points", `${x},${y} ${headX1},${headY1} ${headX2},${headY2}`)
      }

      // Store the values to apply on mouse up
      arrow._tempEndX = x
      arrow._tempEndY = y
    } else if (isDraggingPoint === "control") {
      // Update the DOM elements directly
      const pathElements = svg.querySelectorAll(`path[data-arrow-id="${arrow.id}"]`)
      pathElements.forEach((path) => {
        const d = path.getAttribute("d") || ""
        // Replace the control point coordinates in the path
        const newD = d.replace(/Q\s+([\d.]+)\s+([\d.]+)/, `Q ${x} ${y}`)
        path.setAttribute("d", newD)
      })

      // Update control point lines
      const controlLines = svg.querySelectorAll(`line[data-arrow-id="${arrow.id}"]`)
      controlLines.forEach((line) => {
        if (line.getAttribute("data-line-type")?.includes("control")) {
          line.setAttribute("x2", x.toString())
          line.setAttribute("y2", y.toString())
        }
      })

      // Update control point circle
      const controlCircles = svg.querySelectorAll(`circle[data-arrow-id="${arrow.id}"][data-point-type="control"]`)
      controlCircles.forEach((circle) => {
        circle.setAttribute("cx", x.toString())
        circle.setAttribute("cy", y.toString())
      })

      // Update arrow head
      const arrowHead = svg.querySelector(`polygon[data-arrow-id="${arrow.id}"]`)
      if (arrowHead) {
        // Calculate new arrow head points
        const dx = arrow.endX - x
        const dy = arrow.endY - y
        const angle = Math.atan2(dy, dx)
        const headLength = 15
        const headAngle = Math.PI / 6
        const headX1 = arrow.endX - headLength * Math.cos(angle - headAngle)
        const headY1 = arrow.endY - headLength * Math.sin(angle - headAngle)
        const headX2 = arrow.endX - headLength * Math.cos(angle + headAngle)
        const headY2 = arrow.endY - headLength * Math.sin(angle + headAngle)
        arrowHead.setAttribute("points", `${arrow.endX},${arrow.endY} ${headX1},${headY1} ${headX2},${headY2}`)
      }

      // Store the values to apply on mouse up
      arrow._tempControlX = x
      arrow._tempControlY = y
    }
  }

  // Handle interaction end (mouseup or touchend)
  const handleInteractionEnd = () => {
    if (isDraggingPoint !== null) {
      // Apply the stored temporary values to the actual state
      const updates: Partial<Omit<ArrowType, "id">> = {}

      if (isDraggingPoint === "start" && arrow._tempStartX !== undefined && arrow._tempStartY !== undefined) {
        updates.startX = arrow._tempStartX
        updates.startY = arrow._tempStartY
        delete arrow._tempStartX
        delete arrow._tempStartY
      } else if (isDraggingPoint === "end" && arrow._tempEndX !== undefined && arrow._tempEndY !== undefined) {
        updates.endX = arrow._tempEndX
        updates.endY = arrow._tempEndY
        delete arrow._tempEndX
        delete arrow._tempEndY
      } else if (
        isDraggingPoint === "control" &&
        arrow._tempControlX !== undefined &&
        arrow._tempControlY !== undefined
      ) {
        updates.controlX = arrow._tempControlX
        updates.controlY = arrow._tempControlY
        delete arrow._tempControlX
        delete arrow._tempControlY
      }

      // Only update the state once at the end of dragging
      if (Object.keys(updates).length > 0) {
        updateArrow(arrow.id, updates)
        // Save to history only when the drag is complete
        useEditorStore.getState().saveToHistory()
      }

      setIsDraggingPoint(null)

      // Remove the dragging class
      document.body.classList.remove("arrow-point-dragging")
    }
  }

  // Add global mouse/touch up handler to ensure we stop dragging even if the pointer leaves the SVG
  useEffect(() => {
    const handleGlobalInteractionEnd = () => {
      if (isDraggingPoint !== null) {
        handleInteractionEnd()
      }
    }

    window.addEventListener("mouseup", handleGlobalInteractionEnd)
    window.addEventListener("touchend", handleGlobalInteractionEnd)

    return () => {
      window.removeEventListener("mouseup", handleGlobalInteractionEnd)
      window.removeEventListener("touchend", handleGlobalInteractionEnd)
    }
  }, [isDraggingPoint])

  // Generate the SVG path for the arrow
  const getArrowPath = () => {
    return `M ${arrow.startX} ${arrow.startY} Q ${arrow.controlX} ${arrow.controlY} ${arrow.endX} ${arrow.endY}`
  }

  // Calculate arrow head points
  const getArrowHead = () => {
    // For a quadratic bezier curve, the tangent at the end point is from the control point to the end point
    const dx = arrow.endX - arrow.controlX
    const dy = arrow.endY - arrow.controlY
    const angle = Math.atan2(dy, dx)

    // Arrow head properties
    const headLength = 15
    const headAngle = Math.PI / 6 // 30 degrees

    // Calculate arrow head points
    const headX1 = arrow.endX - headLength * Math.cos(angle - headAngle)
    const headY1 = arrow.endY - headLength * Math.sin(angle - headAngle)
    const headX2 = arrow.endX - headLength * Math.cos(angle + headAngle)
    const headY2 = arrow.endY - headLength * Math.sin(angle + headAngle)

    return `${arrow.endX},${arrow.endY} ${headX1},${headY1} ${headX2},${headY2}`
  }

  // Get stroke-dasharray based on arrow style
  const getStrokeDashArray = () => {
    switch (arrow.style) {
      case "dashed":
        return `${arrow.width * 3} ${arrow.width * 2}`
      case "dotted":
        return `${arrow.width} ${arrow.width * 2}`
      default:
        return "none"
    }
  }

  // Determine the size of touch targets based on device
  const touchTargetSize = isMobile ? 20 : 15
  const controlPointSize = isMobile ? 8 : 6

  return (
    <g
      ref={elementRef}
      onClick={handleInteraction}
      onTouchStart={isMobile ? handleInteraction : undefined}
      className="cursor-pointer pointer-events-auto"
      onMouseMove={handlePointerMove}
      onTouchMove={isMobile ? handlePointerMove : undefined}
      onMouseUp={handleInteractionEnd}
      onTouchEnd={isMobile ? handleInteractionEnd : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerDown={(e) => e.stopPropagation()} // Prevent other handlers
    >
      {/* Arrow line with glow effect */}
      <defs>
        <filter id={`glow-${arrow.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Glow effect for selected arrows */}
      {isSelected && (
        <path
          d={getArrowPath()}
          stroke="white"
          strokeWidth={arrow.width + 4}
          strokeOpacity={0.5}
          fill="none"
          filter={`url(#glow-${arrow.id})`}
          data-arrow-id={arrow.id}
        />
      )}

      {/* Main arrow line */}
      <path
        d={getArrowPath()}
        stroke={arrow.color}
        strokeWidth={arrow.width}
        strokeDasharray={getStrokeDashArray()}
        fill="none"
        className={cn(isSelected ? "stroke-[3]" : "", "pointer-events-auto")}
        onClick={handleInteraction}
        onTouchStart={isMobile ? handleInteraction : undefined}
        data-arrow-id={arrow.id}
      />

      {/* Arrow head */}
      <polygon
        points={getArrowHead()}
        fill={arrow.color}
        filter={isSelected ? `url(#glow-${arrow.id})` : ""}
        className="pointer-events-auto"
        onClick={handleInteraction}
        onTouchStart={isMobile ? handleInteraction : undefined}
        data-arrow-id={arrow.id}
      />

      {/* Control points - only show when selected */}
      {isSelected && (
        <>
          {/* Start point */}
          <g>
            <circle
              cx={arrow.startX}
              cy={arrow.startY}
              r={touchTargetSize}
              fill="transparent"
              className="cursor-move"
              onMouseDown={(e) => handlePointInteractionStart(e, "start")}
              onTouchStart={isMobile ? (e) => handlePointInteractionStart(e, "start") : undefined}
            />
            <circle
              cx={arrow.startX}
              cy={arrow.startY}
              r={controlPointSize}
              fill={arrow.color}
              stroke="white"
              strokeWidth={2}
              className="cursor-move"
              onMouseDown={(e) => handlePointInteractionStart(e, "start")}
              onTouchStart={isMobile ? (e) => handlePointInteractionStart(e, "start") : undefined}
              data-arrow-id={arrow.id}
              data-point-type="start"
            />
          </g>

          {/* End point */}
          <g>
            <circle
              cx={arrow.endX}
              cy={arrow.endY}
              r={touchTargetSize}
              fill="transparent"
              className="cursor-move"
              onMouseDown={(e) => handlePointInteractionStart(e, "end")}
              onTouchStart={isMobile ? (e) => handlePointInteractionStart(e, "end") : undefined}
            />
            <circle
              cx={arrow.endX}
              cy={arrow.endY}
              r={controlPointSize}
              fill={arrow.color}
              stroke="white"
              strokeWidth={2}
              className="cursor-move"
              onMouseDown={(e) => handlePointInteractionStart(e, "end")}
              onTouchStart={isMobile ? (e) => handlePointInteractionStart(e, "end") : undefined}
              data-arrow-id={arrow.id}
              data-point-type="end"
            />
          </g>

          {/* Control point */}
          <g>
            {/* Line connecting control point to start and end */}
            <line
              x1={arrow.startX}
              y1={arrow.startY}
              x2={arrow.controlX}
              y2={arrow.controlY}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 2"
              data-arrow-id={arrow.id}
              data-line-type="start-control"
            />
            <line
              x1={arrow.endX}
              y1={arrow.endY}
              x2={arrow.controlX}
              y2={arrow.controlY}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 2"
              data-arrow-id={arrow.id}
              data-line-type="end-control"
            />

            <circle
              cx={arrow.controlX}
              cy={arrow.controlY}
              r={touchTargetSize}
              fill="transparent"
              className="cursor-move"
              onMouseDown={(e) => handlePointInteractionStart(e, "control")}
              onTouchStart={isMobile ? (e) => handlePointInteractionStart(e, "control") : undefined}
            />
            <circle
              cx={arrow.controlX}
              cy={arrow.controlY}
              r={controlPointSize}
              fill="#4CAF50"
              stroke="white"
              strokeWidth={2}
              className="cursor-move"
              onMouseDown={(e) => handlePointInteractionStart(e, "control")}
              onTouchStart={isMobile ? (e) => handlePointInteractionStart(e, "control") : undefined}
              data-arrow-id={arrow.id}
              data-point-type="control"
            />
          </g>
        </>
      )}

      {/* Delete button - only show when selected */}
      {isSelected && mode === "select" && (
        <g onClick={handleDelete} onTouchStart={isMobile ? handleDelete : undefined}>
          <circle
            cx={arrow.startX}
            cy={arrow.startY - 20}
            r={isMobile ? 16 : 12}
            fill="#FF3B30"
            className="cursor-pointer"
            filter="drop-shadow(0 0 2px rgba(0,0,0,0.5))"
          />
          <text
            x={arrow.startX}
            y={arrow.startY - 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={isMobile ? 18 : 14}
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  )
}

