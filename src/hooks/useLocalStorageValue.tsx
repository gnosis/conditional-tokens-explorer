import { useCallback } from 'react'

export const useLocalStorage = <T,>(key: string) => {
  const getValue = useCallback(() => {
    const t = window.localStorage.getItem(key) || null
    window.localStorage.removeItem(key)

    return t ? JSON.parse(t) : ''
  }, [key])

  const setValue = useCallback(
    (value: T) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    },
    [key]
  )

  return { getValue, setValue }
}
