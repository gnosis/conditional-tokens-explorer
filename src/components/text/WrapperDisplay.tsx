import React from 'react'

import { Errors } from 'util/types'

interface Props {
  children: React.ReactNode
  loading: boolean
  errors: Errors[]
}

export const WrapperDisplay = (props: Props) => {
  const { children, errors, loading, ...restProps } = props

  return (
    <div {...restProps}>
      {loading ? (
        <p>Loading...</p>
      ) : errors.length ? (
        errors.map((error: Errors, index: number) => <p key={index}>{error}</p>)
      ) : (
        children
      )}
    </div>
  )
}
