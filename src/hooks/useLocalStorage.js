import { useCallback, useState } from 'react'
import { safeRead, safeWrite } from '../utils/storageUtils'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const fallback = typeof initialValue === 'function' ? initialValue() : initialValue
    return safeRead(key, fallback)
  })

  const updateValue = useCallback(
    (nextValue) => {
      setValue((current) => {
        const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
        safeWrite(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, updateValue]
}
