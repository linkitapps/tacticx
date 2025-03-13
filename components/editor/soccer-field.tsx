"use client"

import { useEffect, useRef } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { useMobile } from "@/hooks/use-mobile"

export function SoccerField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { canvasWidth, canvasHeight, setCanvasDimensions } = useEditorStore()
  const isMobile = useMobile()

  // Draw the soccer field with pixel-perfect precision
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Use crisp edges for all lines
    ctx.imageSmoothingEnabled = false

    // Helper function to draw pixel-perfect lines
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      // Ensure we're drawing on pixel boundaries for sharpness
      const adjustedX1 = Math.floor(x1) + 0.5
      const adjustedY1 = Math.floor(y1) + 0.5
      const adjustedX2 = Math.floor(x2) + 0.5
      const adjustedY2 = Math.floor(y2) + 0.5

      ctx.beginPath()
      ctx.moveTo(adjustedX1, adjustedY1)
      ctx.lineTo(adjustedX2, adjustedY2)
      ctx.stroke()
    }

    // Helper function to draw pixel-perfect rectangles
    const drawRect = (x: number, y: number, width: number, height: number, fill = false) => {
      // Ensure we're drawing on pixel boundaries for sharpness
      const adjustedX = Math.floor(x) + 0.5
      const adjustedY = Math.floor(y) + 0.5
      const adjustedWidth = Math.floor(width)
      const adjustedHeight = Math.floor(height)

      if (fill) {
        ctx.fillRect(adjustedX - 0.5, adjustedY - 0.5, adjustedWidth, adjustedHeight)
      } else {
        ctx.strokeRect(adjustedX, adjustedY, adjustedWidth, adjustedHeight)
      }
    }

    // Safe arc drawing helper function
    const drawArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number, fill = false) => {
      // Validate inputs to prevent errors on mobile devices
      if (isNaN(x) || isNaN(y) || isNaN(radius) || radius <= 0 || 
          isNaN(startAngle) || isNaN(endAngle)) {
        console.warn("Invalid parameters for arc drawing:", { x, y, radius, startAngle, endAngle });
        return;
      }
      
      try {
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        if (fill) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      } catch (err) {
        console.error("Error drawing arc:", err);
      }
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Field dimensions - standard soccer field has ratio of 105:68 (length:width)
    // On mobile, we'll flip it to be vertical (68:105)
    const fieldRatio = isMobile ? 68 / 105 : 105 / 68
    const padding = isMobile ? 20 : 30 // Smaller padding on mobile
    
    // Calculate field dimensions based on orientation
    let fieldWidth, fieldHeight;
    
    if (isMobile) {
      // For mobile: vertical field (narrower width, taller height)
      fieldWidth = canvas.width - padding * 2;
      fieldHeight = fieldWidth / fieldRatio; // This will make it taller than wide
    } else {
      // For desktop: horizontal field (wider width, shorter height)
      fieldWidth = canvas.width - padding * 2;
      fieldHeight = fieldWidth / fieldRatio;
    }

    // Center the field vertically if needed
    const verticalPadding = (canvas.height - fieldHeight) / 2
    const topY = Math.max(padding, verticalPadding)

    const centerX = canvas.width / 2
    const centerY = topY + fieldHeight / 2

    // Create gradient for field background
    const gradient = isMobile 
      ? ctx.createLinearGradient(0, topY, 0, topY + fieldHeight)  // Vertical gradient
      : ctx.createLinearGradient(0, topY, 0, topY + fieldHeight); // Horizontal gradient
      
    gradient.addColorStop(0, "#0A1F14")
    gradient.addColorStop(0.5, "#0C2517")
    gradient.addColorStop(1, "#0A1F14")

    // Draw base field color with gradient
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw alternating stripes with subtle gradient
    const stripeCount = isMobile ? 8 : 12 // Fewer stripes on mobile
    const stripeWidth = Math.floor(fieldWidth / stripeCount)

    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#0C2517" : "#0A1F14" // Alternating dark greens
      drawRect(padding + i * stripeWidth, topY, stripeWidth, fieldHeight, true)
    }

    // Add subtle texture to the field
    ctx.globalAlpha = 0.05
    for (let i = 0; i < (isMobile ? 300 : 500); i++) {
      const x = padding + Math.random() * fieldWidth
      const y = topY + Math.random() * fieldHeight
      const size = Math.random() * 2 + 1
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(x, y, size, size)
    }
    ctx.globalAlpha = 1.0

    // Set line properties - brighter white for better contrast
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = isMobile ? 1.5 : 2 // Slightly thinner lines on mobile

    // Add subtle glow to lines
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
    ctx.shadowBlur = isMobile ? 3 : 5
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Draw field outline
    drawRect(padding, topY, fieldWidth, fieldHeight)

    // Center line
    if (isMobile) {
      // Horizontal center line for vertical pitch
      drawLine(padding, centerY, padding + fieldWidth, centerY)
    } else {
      // Vertical center line for horizontal pitch
      drawLine(centerX, topY, centerX, topY + fieldHeight)
    }

    // Center circle - standard is 9.15m radius (9.15/105 ≈ 0.087 of field length)
    // For vertical pitch, we need to adjust this scaling
    const radiusScale = isMobile ? 0.087 * (68/105) : 0.087;
    const centerCircleRadius = Math.max(5, fieldWidth * radiusScale)
    drawArc(centerX, centerY, centerCircleRadius, 0, Math.PI * 2)

    // Center dot
    drawArc(centerX, centerY, isMobile ? 2 : 3, 0, Math.PI * 2, true)

    // Penalty areas - standard is 16.5m x 40.3m 
    // Need to adjust these for vertical orientation on mobile
    let penaltyAreaWidth, penaltyAreaHeight;
    
    if (isMobile) {
      // For mobile vertical field:
      penaltyAreaWidth = fieldWidth * 0.593;  // 40.3/68 ≈ 0.593 (now the width since field is rotated)
      penaltyAreaHeight = fieldHeight * 0.157; // 16.5/105 ≈ 0.157 (now the height since field is rotated)
    } else {
      // For desktop horizontal field:
      penaltyAreaWidth = fieldWidth * 0.157;  // 16.5/105 ≈ 0.157
      penaltyAreaHeight = fieldHeight * 0.593; // 40.3/68 ≈ 0.593
    }

    if (isMobile) {
      // For mobile vertical field - top and bottom penalty areas
      // Top penalty area (was left)
      drawRect(
        centerX - penaltyAreaWidth / 2,
        topY,
        penaltyAreaWidth,
        penaltyAreaHeight
      )
      
      // Bottom penalty area (was right)
      drawRect(
        centerX - penaltyAreaWidth / 2,
        topY + fieldHeight - penaltyAreaHeight,
        penaltyAreaWidth,
        penaltyAreaHeight
      )
    } else {
      // For desktop horizontal field - left and right penalty areas
      // Left penalty area
      drawRect(padding, centerY - penaltyAreaHeight / 2, penaltyAreaWidth, penaltyAreaHeight)
      
      // Right penalty area
      drawRect(
        canvas.width - padding - penaltyAreaWidth,
        centerY - penaltyAreaHeight / 2,
        penaltyAreaWidth,
        penaltyAreaHeight
      )
    }

    // Goal areas - standard is 5.5m x 18.32m
    // Need to adjust these for vertical orientation on mobile
    let goalAreaWidth, goalAreaHeight;
    
    if (isMobile) {
      // For mobile vertical field:
      goalAreaWidth = fieldWidth * 0.269;   // 18.32/68 ≈ 0.269 (now the width since field is rotated)
      goalAreaHeight = fieldHeight * 0.052;  // 5.5/105 ≈ 0.052 (now the height since field is rotated)
    } else {
      // For desktop horizontal field:
      goalAreaWidth = fieldWidth * 0.052;   // 5.5/105 ≈ 0.052
      goalAreaHeight = fieldHeight * 0.269;  // 18.32/68 ≈ 0.269
    }

    if (isMobile) {
      // For mobile vertical field - top and bottom goal areas
      // Top goal area (was left)
      drawRect(
        centerX - goalAreaWidth / 2,
        topY,
        goalAreaWidth,
        goalAreaHeight
      )
      
      // Bottom goal area (was right)
      drawRect(
        centerX - goalAreaWidth / 2,
        topY + fieldHeight - goalAreaHeight,
        goalAreaWidth,
        goalAreaHeight
      )
    } else {
      // For desktop horizontal field - left and right goal areas
      // Left goal area
      drawRect(padding, centerY - goalAreaHeight / 2, goalAreaWidth, goalAreaHeight)
      
      // Right goal area
      drawRect(
        canvas.width - padding - goalAreaWidth, 
        centerY - goalAreaHeight / 2, 
        goalAreaWidth, 
        goalAreaHeight
      )
    }

    // Penalty spots - standard is 11m from goal line
    const penaltySpotDistance = isMobile ? fieldHeight * 0.105 : fieldWidth * 0.105; // 11/105 ≈ 0.105

    if (isMobile) {
      // For mobile vertical field - top and bottom penalty spots
      // Top penalty spot (was left)
      drawArc(centerX, topY + penaltySpotDistance, 2, 0, Math.PI * 2, true)
      
      // Bottom penalty spot (was right)
      drawArc(centerX, topY + fieldHeight - penaltySpotDistance, 2, 0, Math.PI * 2, true)
    } else {
      // For desktop horizontal field - left and right penalty spots
      // Left penalty spot
      drawArc(padding + penaltySpotDistance, centerY, 3, 0, Math.PI * 2, true)
      
      // Right penalty spot
      drawArc(canvas.width - padding - penaltySpotDistance, centerY, 3, 0, Math.PI * 2, true)
    }

    // Penalty arcs - standard is 9.15m from penalty spot (same as center circle)
    if (isMobile) {
      // For mobile vertical field - top and bottom penalty arcs
      // Top penalty arc (was left) - draw only the portion outside the penalty area
      // Adjusted arc angles to show only the part outside the penalty area (the half-circle facing down)
      drawArc(centerX, topY + penaltySpotDistance, centerCircleRadius, Math.PI * 0.25, Math.PI * 0.75)
      
      // Bottom penalty arc (was right) - draw only the portion outside the penalty area (the half-circle facing up)
      drawArc(centerX, topY + fieldHeight - penaltySpotDistance, centerCircleRadius, Math.PI * 1.25, Math.PI * 1.75)
    } else {
      // For desktop horizontal field - left and right penalty arcs
      // Left penalty arc - draw only the portion outside the penalty area
      drawArc(padding + penaltySpotDistance, centerY, centerCircleRadius, -Math.PI * 0.3, Math.PI * 0.3)
      
      // Right penalty arc
      drawArc(canvas.width - padding - penaltySpotDistance, centerY, centerCircleRadius, Math.PI * 0.7, Math.PI * 1.3)
    }

    // Corner arcs - standard is 1m radius (1/105 ≈ 0.0095)
    const cornerRadius = Math.max(5, isMobile ? fieldWidth * 0.012 : fieldWidth * 0.0095) // Slightly larger on mobile for visibility

    // Draw corner arcs (same for both orientations, just adjusting the radius for mobile)
    // Top-left corner
    drawArc(padding, topY, cornerRadius, 0, Math.PI / 2)
    
    // Top-right corner
    drawArc(canvas.width - padding, topY, cornerRadius, Math.PI / 2, Math.PI)
    
    // Bottom-left corner
    drawArc(padding, topY + fieldHeight, cornerRadius, -Math.PI / 2, 0)
    
    // Bottom-right corner
    drawArc(canvas.width - padding, topY + fieldHeight, cornerRadius, Math.PI, Math.PI * 1.5)

    // Draw goals - standard is 7.32m wide x 2.44m high
    // Need to adjust these for vertical orientation on mobile
    let goalWidth, goalHeight, goalDepth;
    
    if (isMobile) {
      // For mobile vertical field:
      goalWidth = fieldWidth * 0.108;   // 7.32/68 ≈ 0.108 (now the width since field is rotated)
      goalHeight = fieldHeight * 0.023;  // 2.44/105 ≈ 0.023 (now the height since field is rotated)
      goalDepth = 5; // Visual depth
    } else {
      // For desktop horizontal field:
      goalWidth = fieldHeight * 0.108;   // 7.32/68 ≈ 0.108
      goalHeight = fieldWidth * 0.023;   // 2.44/105 ≈ 0.023
      goalDepth = 5; // Visual depth
    }

    // Reset shadow for goals
    ctx.shadowBlur = 0

    // Set goal styling
    ctx.lineWidth = isMobile ? 1.5 : 2
    ctx.strokeStyle = "#FFFFFF"
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"

    if (isMobile) {
      // For mobile vertical field - top and bottom goals
      // Top goal (was left)
      // Top goal - background
      ctx.fillRect(centerX - goalWidth / 2, topY - goalDepth, goalWidth, goalDepth)
      
      // Top goal - posts
      drawLine(centerX - goalWidth / 2, topY, centerX - goalWidth / 2, topY - goalDepth)
      drawLine(centerX + goalWidth / 2, topY, centerX + goalWidth / 2, topY - goalDepth)
      
      // Top goal - crossbar
      drawLine(centerX - goalWidth / 2, topY - goalDepth, centerX + goalWidth / 2, topY - goalDepth)
      
      // Bottom goal (was right)
      // Bottom goal - background
      ctx.fillRect(centerX - goalWidth / 2, topY + fieldHeight, goalWidth, goalDepth)
      
      // Bottom goal - posts
      drawLine(centerX - goalWidth / 2, topY + fieldHeight, centerX - goalWidth / 2, topY + fieldHeight + goalDepth)
      drawLine(centerX + goalWidth / 2, topY + fieldHeight, centerX + goalWidth / 2, topY + fieldHeight + goalDepth)
      
      // Bottom goal - crossbar
      drawLine(centerX - goalWidth / 2, topY + fieldHeight + goalDepth, centerX + goalWidth / 2, topY + fieldHeight + goalDepth)
    } else {
      // For desktop horizontal field - left and right goals
      // Left goal
      // Left goal - background
      ctx.fillRect(padding - goalDepth, centerY - goalWidth / 2, goalDepth, goalWidth)
      
      // Left goal - posts
      drawLine(padding, centerY - goalWidth / 2, padding - goalDepth, centerY - goalWidth / 2)
      drawLine(padding, centerY + goalWidth / 2, padding - goalDepth, centerY + goalWidth / 2)
      
      // Left goal - crossbar
      drawLine(padding - goalDepth, centerY - goalWidth / 2, padding - goalDepth, centerY + goalWidth / 2)
      
      // Right goal
      // Right goal - background
      ctx.fillRect(canvas.width - padding, centerY - goalWidth / 2, goalDepth, goalWidth)
      
      // Right goal - posts
      drawLine(
        canvas.width - padding,
        centerY - goalWidth / 2,
        canvas.width - padding + goalDepth,
        centerY - goalWidth / 2
      )
      drawLine(
        canvas.width - padding,
        centerY + goalWidth / 2,
        canvas.width - padding + goalDepth,
        centerY + goalWidth / 2
      )
      
      // Right goal - crossbar
      drawLine(
        canvas.width - padding + goalDepth,
        centerY - goalWidth / 2,
        canvas.width - padding + goalDepth,
        centerY + goalWidth / 2
      )
    }

    // Add a subtle vignette effect
    try {
      const vignette = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(canvas.width, canvas.height),
      )
      vignette.addColorStop(0, "rgba(0,0,0,0)")
      vignette.addColorStop(0.7, "rgba(0,0,0,0)")
      vignette.addColorStop(1, "rgba(0,0,0,0.4)")

      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } catch (err) {
      console.warn("Error creating vignette effect:", err)
    }

    // Add a subtle grid pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
    ctx.lineWidth = 1
    ctx.setLineDash([1, 5])

    // Vertical grid lines
    const gridSpacing = isMobile ? 15 : 20 // Tighter grid on mobile
    for (let x = padding; x <= canvas.width - padding; x += gridSpacing) {
      drawLine(x, topY, x, topY + fieldHeight)
    }

    // Horizontal grid lines
    for (let y = topY; y <= topY + fieldHeight; y += gridSpacing) {
      drawLine(padding, y, canvas.width - padding, y)
    }

    ctx.setLineDash([])
  }, [canvasWidth, canvasHeight, isMobile])

  // Handle resize with precise dimensions
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement
        if (container) {
          // Get the container dimensions
          const containerWidth = container.clientWidth
          
          // Standard soccer field has ratio of 105:68 (length:width)
          // On mobile, we'll flip it to be vertical (68:105)
          const fieldRatio = isMobile ? 68 / 105 : 105 / 68

          let width, height;

          if (isMobile) {
            // For mobile, make the field tall and narrow
            // We'll set the width to the container width
            width = containerWidth;
            
            // And calculate height to maintain our vertical aspect ratio
            // This will make the field longer in the vertical direction
            height = containerWidth / fieldRatio + 60; // Add padding
          } else {
            // For desktop, keep the traditional horizontal field
            width = containerWidth;
            height = containerWidth / fieldRatio + 60; // Add padding
          }

          // Update the canvas and store dimensions
          setCanvasDimensions(width, height)
          canvasRef.current.width = width
          canvasRef.current.height = height
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [setCanvasDimensions, isMobile])

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    // Handle touch start for dragging players
    // ... existing code
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    // Handle touch move for dragging players
    // ... existing code
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    // Handle touch end for dragging players
    // ... existing code
  };

  return <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="rounded-md shadow-lg" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} />
}

