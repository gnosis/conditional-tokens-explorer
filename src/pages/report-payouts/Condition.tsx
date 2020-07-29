import React from 'react'

import { ConditionErrors } from '../../util/types'

interface Props {
  conditionId: string
  loading: boolean
  errors: ConditionErrors[]
}

export const Condition = (props: Props) => {
  const { conditionId, loading, errors } = props

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <p>{conditionId}</p>
      {errors.map((error: ConditionErrors, index: number) => (
        <p key={index}>{error}</p>
      ))}
    </>
  )
}
