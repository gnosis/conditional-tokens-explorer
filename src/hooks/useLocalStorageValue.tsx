export const useLocalStorage = <T,>(key: string) => {
  const getValue = () => {
    const t = window.localStorage.getItem(key) || null
    window.localStorage.removeItem(key)

    return t ? JSON.parse(t) : ''
  }

  const setValue = (value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return { getValue, setValue }
}
