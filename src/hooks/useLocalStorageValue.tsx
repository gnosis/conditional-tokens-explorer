import { useCallback } from 'react'

export const useLocalStorage = <T extends string>(key: T) => {
  const getValue = useCallback(
    (removeValue = true) => {
      const t = window.localStorage.getItem(key) || null
      if (removeValue) window.localStorage.removeItem(key)

      if (t) {
        return JSON.parse(t)
      } else {
        return ''
      }
    },
    [key]
  )

  const setValue = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    },
    [key]
  )

  return { getValue, setValue }
}
