import React, { useState } from 'react'

import { Errors } from 'util/types'

export const useErrors = () => {
  const [errors, setErrors] = useState<Array<Errors>>([])
  const clearErrors = React.useCallback((): void => {
    setErrors([])
  }, [])

  const removeError = React.useCallback((error): void => {
    setErrors((errors) => (errors ? errors.filter((e) => e !== error) : []))
  }, [])

  const pushError = React.useCallback((newError): void => {
    setErrors((errors) => Array.from(new Set(errors).add(newError)))
  }, [])

  return {
    errors,
    clearErrors,
    removeError,
    pushError,
  }
}
