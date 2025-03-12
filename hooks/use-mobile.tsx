"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") return

    // Function to check if the device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i

      // Also check screen width for tablets and small screens
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth < 768
      setIsMobile(isMobileDevice)
    }

    // Initial check
    checkMobile()

    // Add resize listener to handle orientation changes
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

