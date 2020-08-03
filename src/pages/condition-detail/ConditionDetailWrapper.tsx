import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { GetConditionQuery } from '../../queries/conditions'
import { GetCondition } from '../../types/generatedGQL'

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
      <PageTitle>Condition detail</PageTitle>

      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {!data && !loading && !error && <div>Not found...</div>}
      {data && data?.condition && (
        <ConditionDetailItem
          conditionId={conditionId}
          creator={data.condition?.creator}
          oracle={data.condition?.oracle}
          outcomeSlotCount={data.condition?.outcomeSlotCount}
          questionId={data.condition?.questionId}
          resolved={data.condition?.resolved}
        />
      )}
    </>
  )
}
