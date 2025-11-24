import { useRef, useCallback } from 'react'

/**
 * Hook that handles both touch (mobile) and click (desktop) events
 * - On mobile: touchStart fires immediately, prevents hover/focus, blocks subsequent click
 * - On desktop: touchStart never fires, click works normally with hover effects
 */
export function useMobileClick(handler) {
  const touchHandled = useRef(false)
  const handlerRef = useRef(handler)
  const lastTouchTime = useRef(0)
  
  // Keep handler ref updated
  handlerRef.current = handler

  const handleTouchStart = useCallback((e) => {
    // This only fires on touch devices (mobile/tablet)
    const now = Date.now()
    
    // Prevent rapid double-taps (reduced from 100ms to 50ms for faster response)
    if (now - lastTouchTime.current < 50) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    lastTouchTime.current = now
    
    // Mark that touch was handled
    touchHandled.current = true
    
    // Prevent default to stop hover/focus, but don't stop propagation
    e.preventDefault()
    
    // Execute handler immediately
    if (handlerRef.current) {
      handlerRef.current(e)
    }
    
    // Reset after shorter delay for better responsiveness
    setTimeout(() => {
      touchHandled.current = false
    }, 300)
  }, [])

  const handleClick = useCallback((e) => {
    // On mobile: if touch already handled it, ignore click
    // On desktop: touchHandled is always false, so click works normally
    if (touchHandled.current) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // Desktop: normal click behavior
    if (handlerRef.current) {
      handlerRef.current(e)
    }
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onClick: handleClick
  }
}
