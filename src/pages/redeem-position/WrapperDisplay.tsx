import React from 'react'

import { Errors } from '../../util/types'

interface Props {
  dataToDisplay: string
  loading: boolean
  errors: Errors[]
}

export const WrapperDisplay = (props: Props) => {
  const { dataToDisplay, errors, loading } = props

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <p>{dataToDisplay}</p>
      {errors.map((error: Errors, index: number) => (
        <p key={index}>{error}</p>
      ))}
    </>
  )
}
