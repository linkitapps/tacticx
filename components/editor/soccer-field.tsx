"use client"

import React, { useEffect, useRef, useState } from "react"
import { useEditorStore } from "@/store/useEditorStore"
import { useDevice } from "@/hooks/use-device"

// Standard dimensions of a soccer field in meters (official FIFA dimensions)
// We'll use these to maintain the correct proportions
const STANDARD_FIELD = {
  // Field
  width: 105, // meters (length)
  height: 68, // meters (width)
  
  // Areas
  centerCircleRadius: 9.15,
  penaltyBoxWidth: 16.5,
  penaltyBoxHeight: 40.3,
  goalBoxWidth: 5.5,
  goalBoxHeight: 18.3,
  
  // Spots and arcs
  penaltySpotDistance: 11,
  penaltyArcRadius: 9.15,
  cornerArcRadius: 1,
  
  // Goals
  goalWidth: 7.32,
  goalDepth: 2.44
}

export function SoccerField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { setCanvasDimensions } = useEditorStore()
  const { isMobile, isTablet, orientation } = useDevice()
  const [forceRedraw, setForceRedraw] = useState(0)

  // Determine if we should use vertical orientation (mobile in portrait only)
  const shouldUseVerticalField = isMobile && orientation === 'portrait'

  // Draw the soccer field
  const drawField = (
    ctx: CanvasRenderingContext2D, 
    canvasWidth: number, 
    canvasHeight: number
  ) => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    
    // Calculate field dimensions based on container size
    const fieldAspectRatio = STANDARD_FIELD.width / STANDARD_FIELD.height
    let fieldWidth, fieldHeight
    
    if (shouldUseVerticalField) {
      // For mobile in portrait, rotate the field (width/height swapped)
      fieldHeight = Math.min(canvasWidth, canvasWidth * fieldAspectRatio)
      fieldWidth = fieldHeight / fieldAspectRatio
    } else {
      // Standard horizontal field
      fieldWidth = Math.min(canvasWidth, canvasHeight * fieldAspectRatio)
      fieldHeight = fieldWidth / fieldAspectRatio
    }
    
    // Center field in the canvas
    const fieldX = (canvasWidth - fieldWidth) / 2
    const fieldY = (canvasHeight - fieldHeight) / 2
    
    // Calculate the scale factor (how many pixels per meter)
    const scaleX = fieldWidth / STANDARD_FIELD.width
    const scaleY = fieldHeight / STANDARD_FIELD.height
    
    // Set the line width proportional to field size, but ensure it's visible
    const lineWidth = Math.max(1, fieldWidth * 0.002)
    
    // Calculate dimensions for all field elements based on the scale
    const dimensions = {
      // Center circle
      centerCircleRadius: STANDARD_FIELD.centerCircleRadius * scaleX,
      
      // Penalty box
      penaltyBoxWidth: STANDARD_FIELD.penaltyBoxWidth * scaleX,
      penaltyBoxHeight: STANDARD_FIELD.penaltyBoxHeight * scaleY,
      
      // Goal box
      goalBoxWidth: STANDARD_FIELD.goalBoxWidth * scaleX,
      goalBoxHeight: STANDARD_FIELD.goalBoxHeight * scaleY,
      
      // Spots and arcs
      penaltySpotDistance: STANDARD_FIELD.penaltySpotDistance * scaleX,
      penaltyArcRadius: STANDARD_FIELD.penaltyArcRadius * scaleX,
      cornerArcRadius: STANDARD_FIELD.cornerArcRadius * scaleX,
      
      // Goals
      goalWidth: STANDARD_FIELD.goalWidth * scaleY,
      goalDepth: STANDARD_FIELD.goalDepth * scaleX
    }
    
    // Create field gradient (darker in the center, lighter at edges)
    const fieldGradient = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, 0,
      canvasWidth / 2, canvasHeight / 2, fieldWidth / 1.5
    )
    fieldGradient.addColorStop(0, '#2d5c30') // Darker green in center
    fieldGradient.addColorStop(1, '#1e3c1f') // Slightly darker green at edges
    
    // Set up drawing styles
    ctx.fillStyle = fieldGradient
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // DRAW THE FIELD ELEMENTS
    
    // Main field background and border
    ctx.fillRect(fieldX, fieldY, fieldWidth, fieldHeight)
    ctx.strokeRect(fieldX, fieldY, fieldWidth, fieldHeight)
    
    // Halfway line
    ctx.beginPath()
    ctx.moveTo(fieldX + fieldWidth / 2, fieldY)
    ctx.lineTo(fieldX + fieldWidth / 2, fieldY + fieldHeight)
    ctx.stroke()
    
    // Center circle
    ctx.beginPath()
    ctx.arc(
      fieldX + fieldWidth / 2, 
      fieldY + fieldHeight / 2, 
      dimensions.centerCircleRadius, 
      0, 
      Math.PI * 2
    )
    ctx.stroke()
    
    // Center spot
    ctx.beginPath()
    ctx.fillStyle = '#ffffff' // Ensure white fill color
    ctx.arc(
      fieldX + fieldWidth / 2, 
      fieldY + fieldHeight / 2, 
      Math.max(3, lineWidth * 3), // Increase spot size
      0, 
      Math.PI * 2
    )
    ctx.fill()
    
    // Left penalty area
    ctx.strokeRect(
      fieldX,
      fieldY + (fieldHeight - dimensions.penaltyBoxHeight) / 2,
      dimensions.penaltyBoxWidth,
      dimensions.penaltyBoxHeight
    )
    
    // Right penalty area
    ctx.strokeRect(
      fieldX + fieldWidth - dimensions.penaltyBoxWidth,
      fieldY + (fieldHeight - dimensions.penaltyBoxHeight) / 2,
      dimensions.penaltyBoxWidth,
      dimensions.penaltyBoxHeight
    )
    
    // Left goal area
    ctx.strokeRect(
      fieldX,
      fieldY + (fieldHeight - dimensions.goalBoxHeight) / 2,
      dimensions.goalBoxWidth,
      dimensions.goalBoxHeight
    )
    
    // Right goal area
    ctx.strokeRect(
      fieldX + fieldWidth - dimensions.goalBoxWidth,
      fieldY + (fieldHeight - dimensions.goalBoxHeight) / 2,
      dimensions.goalBoxWidth,
      dimensions.goalBoxHeight
    )
    
    // Left goal
    ctx.strokeStyle = '#cccccc' // Lighter color for goals
    ctx.strokeRect(
      fieldX - dimensions.goalDepth,
      fieldY + (fieldHeight - dimensions.goalWidth) / 2,
      dimensions.goalDepth,
      dimensions.goalWidth
    )
    
    // Right goal
    ctx.strokeRect(
      fieldX + fieldWidth,
      fieldY + (fieldHeight - dimensions.goalWidth) / 2,
      dimensions.goalDepth,
      dimensions.goalWidth
    )
    
    // Reset stroke style to white for remaining elements
    ctx.strokeStyle = '#ffffff'
    
    // Penalty spots
    // Left penalty spot
    ctx.beginPath()
    ctx.fillStyle = '#ffffff' // Ensure white fill color
    ctx.arc(
      fieldX + dimensions.penaltySpotDistance,
      fieldY + fieldHeight / 2,
      Math.max(3, lineWidth * 3), // Increase spot size
      0,
      Math.PI * 2
    )
    ctx.fill()
    
    // Right penalty spot
    ctx.beginPath()
    ctx.fillStyle = '#ffffff' // Ensure white fill color
    ctx.arc(
      fieldX + fieldWidth - dimensions.penaltySpotDistance,
      fieldY + fieldHeight / 2,
      Math.max(3, lineWidth * 3), // Increase spot size
      0,
      Math.PI * 2
    )
    ctx.fill()
    
    // DRAW PENALTY ARCS
    // We'll use a path-clipping approach to only show the part of the arc
    // that's outside the penalty area
    
    // Calculate the penalty area boundaries for clipping
    const leftPenaltyAreaRight = fieldX + dimensions.penaltyBoxWidth;
    const rightPenaltyAreaLeft = fieldX + fieldWidth - dimensions.penaltyBoxWidth;
    const penaltyAreaTop = fieldY + (fieldHeight - dimensions.penaltyBoxHeight) / 2;
    const penaltyAreaBottom = penaltyAreaTop + dimensions.penaltyBoxHeight;
    
    // Left penalty arc
    ctx.save();
    // Create a clipping region outside the penalty area
    ctx.beginPath();
    
    // Draw a large rectangle covering the whole canvas
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    
    // Draw the penalty area (which will be "subtracted" from the clipping region)
    ctx.rect(fieldX, penaltyAreaTop, dimensions.penaltyBoxWidth, dimensions.penaltyBoxHeight);
    
    // Use "evenodd" rule to create a clipping region that excludes the penalty area
    ctx.clip("evenodd");
    
    // Now draw the arc - it will only be visible outside the penalty area
    ctx.beginPath();
    ctx.arc(
      fieldX + dimensions.penaltySpotDistance,
      fieldY + fieldHeight / 2,
      dimensions.penaltyArcRadius,
      -0.75 * Math.PI,
      0.75 * Math.PI,
      false
    );
    ctx.stroke();
    
    // Restore the canvas state (remove clipping)
    ctx.restore();
    
    // Right penalty arc (same approach)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.rect(rightPenaltyAreaLeft, penaltyAreaTop, dimensions.penaltyBoxWidth, dimensions.penaltyBoxHeight);
    ctx.clip("evenodd");
    
    ctx.beginPath();
    ctx.arc(
      fieldX + fieldWidth - dimensions.penaltySpotDistance,
      fieldY + fieldHeight / 2,
      dimensions.penaltyArcRadius,
      0.25 * Math.PI,
      1.75 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.restore();
    
    // Corner arcs
    // Top-left corner
    ctx.beginPath();
    ctx.arc(
      fieldX,
      fieldY,
      dimensions.cornerArcRadius,
      0,
      Math.PI / 2,
      false
    );
    ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.arc(
      fieldX + fieldWidth,
      fieldY,
      dimensions.cornerArcRadius,
      Math.PI / 2,
      Math.PI,
      false
    );
    ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.arc(
      fieldX,
      fieldY + fieldHeight,
      dimensions.cornerArcRadius,
      3 * Math.PI / 2,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.arc(
      fieldX + fieldWidth,
      fieldY + fieldHeight,
      dimensions.cornerArcRadius,
      Math.PI,
      3 * Math.PI / 2,
      false
    );
    ctx.stroke();
    
    // Add field texture for improved visual appearance (subtle stripes)
    if (!isMobile) { // Skip on mobile for performance
      addFieldTexture(ctx, fieldX, fieldY, fieldWidth, fieldHeight);
    }
    
    // Return the dimensions for potential use by caller
    return { fieldX, fieldY, fieldWidth, fieldHeight };
  }
  
  // Add texture to the field for more realistic appearance
  const addFieldTexture = (
    ctx: CanvasRenderingContext2D,
    fieldX: number,
    fieldY: number,
    fieldWidth: number,
    fieldHeight: number
  ) => {
    // Create a separate canvas for the texture to improve performance
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = fieldWidth;
    textureCanvas.height = fieldHeight;
    const textureCtx = textureCanvas.getContext('2d');
    
    if (!textureCtx) return;
    
    // Draw subtle stripes pattern
    const stripeCount = 20;
    const stripeWidth = fieldWidth / stripeCount;
    
    textureCtx.fillStyle = 'rgba(255, 255, 255, 0.03)'; // Very subtle white
    
    // Horizontal stripes
    for (let i = 0; i < stripeCount; i += 2) {
      textureCtx.fillRect(i * stripeWidth, 0, stripeWidth, fieldHeight);
    }
    
    // Apply noise for grass-like texture
    const imageData = textureCtx.getImageData(0, 0, fieldWidth, fieldHeight);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Random noise with very low opacity
      const noise = Math.random() * 8 - 4; // Value between -4 and 4
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }
    
    textureCtx.putImageData(imageData, 0, 0);
    
    // Apply the texture to the main canvas with low opacity
    ctx.globalAlpha = 0.3;
    ctx.drawImage(textureCanvas, fieldX, fieldY, fieldWidth, fieldHeight);
    ctx.globalAlpha = 1.0;
  }

  // Update the canvas size and redraw the field
  const updateCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;
    
    // Get container dimensions
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width || 800;
    const containerHeight = rect.height || 600;
    
    // Update store with canvas dimensions
    setCanvasDimensions(containerWidth, containerHeight);
    
    // Handle high-DPI displays for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size (CSS)
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    
    // Set actual size in memory (scaled for high-DPI screens)
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    
    // Get the drawing context and scale for high-DPI
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      drawField(ctx, containerWidth, containerHeight);
    }
  }

  // Handle resize events
  const handleResize = () => {
    updateCanvas();
    setForceRedraw(prev => prev + 1); // Force re-render
  }

  // Initialize canvas and set up event listeners
  useEffect(() => {
    updateCanvas();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Update when orientation changes
  useEffect(() => {
    updateCanvas();
  }, [orientation, forceRedraw]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full"
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
} 