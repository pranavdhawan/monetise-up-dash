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
    // Desktop won't trigger this, so desktop clicks work normally
    const now = Date.now()
    
    // Prevent rapid double-taps
    if (now - lastTouchTime.current < 100) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    lastTouchTime.current = now
    
    // Mark that touch was handled IMMEDIATELY
    touchHandled.current = true
    
    // Aggressively prevent all default behaviors
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    
    // Execute handler IMMEDIATELY - no delay
    if (handlerRef.current) {
      handlerRef.current(e)
    }
    
    // Reset after delay
    setTimeout(() => {
      touchHandled.current = false
    }, 500)
  }, [])

  const handleClick = useCallback((e) => {
    // On mobile: if touch already handled it, ignore click
    // On desktop: touchHandled is always false, so click works normally
    if (touchHandled.current) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      return false
    }
    
    // Desktop: normal click behavior with hover effects
    // Mobile: this won't fire if touchStart already handled it
    if (handlerRef.current) {
      handlerRef.current(e)
    }
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onClick: handleClick
  }
}
