import { useCallback } from 'react'

import { getLogger } from 'util/logger'

const logger = getLogger('useLocalStorage')

export const useLocalStorage = <T,>(key: string) => {
  const getValue = useCallback(() => {
    const t = window.localStorage.getItem(key) || null
    window.localStorage.removeItem(key)

    if (t) {
      logger.log(t)
      return JSON.parse(t)
    } else {
      return ''
    }
  }, [key])

  const setValue = useCallback(
    (value: T) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    },
    [key]
  )

  return { getValue, setValue }
}
