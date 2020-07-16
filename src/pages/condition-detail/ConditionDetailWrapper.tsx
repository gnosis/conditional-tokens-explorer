import React from 'react'

import { Conditions } from '../../types/generatedGQL'
import { ConditionQuery } from '../../queries/conditions'
import { useQuery } from '@apollo/react-hooks'
import { ConditionDetailItem } from './ConditionDetailItem'

interface ConditionDetailWrapperProps {
  conditionId: string
}

export const ConditionDetailWrapper = (props: ConditionDetailWrapperProps) => {
  const { conditionId } = props

  const { data, error, loading } = useQuery<Conditions>(ConditionQuery(conditionId))

  return (
    <>
      <h3>Condition detail</h3>

      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {data && data?.conditions.length === 0 && <div>Not found...</div>}
      {data && data?.conditions.length > 0 && (
        <ConditionDetailItem
          conditionId={conditionId}
          resolved={data?.conditions[0].resolved}
          oracle={data?.conditions[0].oracle}
          questionId={data?.conditions[0].questionId}
          outcomeSlotCount={data?.conditions[0].outcomeSlotCount}
          creator={data?.conditions[0].creator}
        />
      )}
    </>
  )
}
