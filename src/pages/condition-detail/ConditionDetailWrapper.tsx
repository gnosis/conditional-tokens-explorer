import React from 'react'

import { GetCondition } from '../../types/generatedGQL'
import { GetConditionQuery } from '../../queries/conditions'
import { useQuery } from '@apollo/react-hooks'
import { ConditionDetailItem } from './ConditionDetailItem'

interface ConditionDetailWrapperProps {
  conditionId: string
}

export const ConditionDetailWrapper = (props: ConditionDetailWrapperProps) => {
  const { conditionId } = props

  const { data, error, loading } = useQuery<GetCondition>(GetConditionQuery, {
    variables: { id: conditionId },
  })

  return (
    <>
      <h3>Condition detail</h3>

      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {!data && !loading && !error && <div>Not found...</div>}
      {data && data?.condition && (
        <ConditionDetailItem
          conditionId={conditionId}
          resolved={data.condition?.resolved}
          oracle={data.condition?.oracle}
          questionId={data.condition?.questionId}
          outcomeSlotCount={data.condition?.outcomeSlotCount}
          creator={data.condition?.creator}
        />
      )}
    </>
  )
}
