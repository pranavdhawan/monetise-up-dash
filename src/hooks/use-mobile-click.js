import { useRef, useCallback } from 'react'

/**
 * Custom hook to prevent double-click/double-tap issues on mobile
 * Returns a handler that debounces clicks and prevents double-firing
 */
export function useMobileClick(handler, delay = 300) {
  const lastClickTime = useRef(0)
  const isProcessing = useRef(false)

  return useCallback((e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime.current

    // If clicked too soon or already processing, ignore
    if (timeSinceLastClick < delay || isProcessing.current) {
      return
    }

    // Mark as processing
    isProcessing.current = true
    lastClickTime.current = now

    // Execute handler
    if (handler) {
      handler(e)
    }

    // Reset processing flag after delay
    setTimeout(() => {
      isProcessing.current = false
    }, delay)
  }, [handler, delay])
}

