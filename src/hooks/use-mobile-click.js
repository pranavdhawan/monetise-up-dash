import { useRef, useCallback, useEffect } from 'react'

/**
 * Custom hook to prevent double-click/double-tap issues on mobile
 * Handles both touch and click events properly
 */
export function useMobileClick(handler, delay = 200) {
  const lastClickTime = useRef(0)
  const isProcessing = useRef(false)
  const touchHandled = useRef(false)
  const elementRef = useRef(null)

  const handleEvent = useCallback((e) => {
    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime.current

    // If clicked too soon or already processing, ignore
    if (timeSinceLastClick < delay || isProcessing.current) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
      return
    }

    // Mark as processing
    isProcessing.current = true
    lastClickTime.current = now

    // Prevent default and stop propagation
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Execute handler immediately
    if (handler) {
      handler(e)
    }

    // Reset processing flag after delay
    setTimeout(() => {
      isProcessing.current = false
      touchHandled.current = false
    }, delay)
  }, [handler, delay])

  // Return handler that works for both touch and click
  return useCallback((e) => {
    // For touch events, handle immediately
    if (e.type === 'touchstart' || e.type === 'touchend') {
      touchHandled.current = true
      handleEvent(e)
      return
    }
    
    // For click events, only handle if touch didn't already handle it
    if (e.type === 'click') {
      // Small delay to check if touch was handled
      setTimeout(() => {
        if (!touchHandled.current) {
          handleEvent(e)
        }
        touchHandled.current = false
      }, 50)
    } else {
      handleEvent(e)
    }
  }, [handleEvent])
}

