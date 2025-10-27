import { onMounted, onUnmounted, type Ref } from 'vue'

export interface ShortcutHandlers {
  onSpace?: () => void
  onEscape?: () => void
  onPlusOrEqual?: () => void
  onMinus?: () => void
  onBracketLeft?: () => void
  onBracketRight?: () => void
}

export function useKeyboardShortcuts(
  handlers: ShortcutHandlers,
  options?: {
    enabled?: Ref<boolean> | (() => boolean)
  }
) {
  const isEnabled = () => {
    if (!options?.enabled) return true
    return typeof options.enabled === 'function'
      ? options.enabled()
      : options.enabled.value
  }

  const handleKeydown = (event: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement) {
      return
    }

    if (!isEnabled()) {
      return
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault()
        handlers.onSpace?.()
        break
      case 'Escape':
        event.preventDefault()
        handlers.onEscape?.()
        break
      case 'Equal':
      case 'NumpadAdd':
        if (event.shiftKey || event.code === 'NumpadAdd') {
          event.preventDefault()
          handlers.onPlusOrEqual?.()
        }
        break
      case 'Minus':
      case 'NumpadSubtract':
        event.preventDefault()
        handlers.onMinus?.()
        break
      case 'BracketLeft':
        event.preventDefault()
        handlers.onBracketLeft?.()
        break
      case 'BracketRight':
        event.preventDefault()
        handlers.onBracketRight?.()
        break
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
