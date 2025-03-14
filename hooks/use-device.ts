"use client"

import { useState, useEffect } from "react"

// Constants for device classification
const MOBILE_WIDTH_THRESHOLD = 768
const TABLET_WIDTH_THRESHOLD = 1024

type Orientation = "portrait" | "landscape"
type DeviceType = "mobile" | "tablet" | "desktop"

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType
  orientation: Orientation
  touchSupported: boolean
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: "desktop",
    orientation: "landscape",
    touchSupported: false
  })

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") return

    // Function to detect touch support
    const isTouchSupported = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      )
    }

    // Function to check device type and orientation
    const checkDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const touchSupported = isTouchSupported()

      // Determine orientation based on dimensions
      const orientation: Orientation = width < height ? "portrait" : "landscape"

      // Check for mobile and tablet based on width and user agent
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i
      const tabletRegex = /ipad|tablet/i
      
      // iPad detection (newer iPads report as Macintosh)
      const isIpad = 
        tabletRegex.test(userAgent) || 
        (userAgent.includes('macintosh') && touchSupported) ||
        navigator.maxTouchPoints > 1

      // Determine device type - both by user agent and dimensions
      const isMobileByRegex = mobileRegex.test(userAgent) && !isIpad
      const isMobileBySize = width < MOBILE_WIDTH_THRESHOLD && !isIpad
      const isMobile = isMobileByRegex || isMobileBySize
      
      const isTablet = isIpad || 
        (width >= MOBILE_WIDTH_THRESHOLD && width < TABLET_WIDTH_THRESHOLD && touchSupported)
      
      const isDesktop = !isMobile && !isTablet

      let deviceType: DeviceType = "desktop"
      if (isMobile) deviceType = "mobile"
      else if (isTablet) deviceType = "tablet"

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        orientation,
        touchSupported
      })
      
      // Add CSS classes to the document root based on device and orientation
      document.documentElement.classList.toggle("is-mobile", isMobile)
      document.documentElement.classList.toggle("is-tablet", isTablet)
      document.documentElement.classList.toggle("is-desktop", isDesktop)
      document.documentElement.classList.toggle("is-portrait", orientation === "portrait")
      document.documentElement.classList.toggle("is-landscape", orientation === "landscape")
      document.documentElement.classList.toggle("touch-support", touchSupported)
    }

    // Initial check
    checkDevice()

    // Add resize and orientation change listeners
    window.addEventListener("resize", checkDevice)
    window.addEventListener("orientationchange", checkDevice)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkDevice)
      window.removeEventListener("orientationchange", checkDevice)
    }
  }, [])

  return deviceInfo
} 