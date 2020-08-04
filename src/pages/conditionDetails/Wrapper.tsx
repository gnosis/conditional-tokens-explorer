import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { InfoCard } from '../../components/common/InfoCard'
import { InlineLoading } from '../../components/loading/InlineLoading'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { GetConditionQuery } from '../../queries/conditions'
import { GetCondition } from '../../types/generatedGQL'

import { Contents } from './Contents'

interface WrapperProps {
  conditionId: string
}

export const Wrapper = (props: WrapperProps) => {
  const { conditionId } = props
  const { data, error, loading } = useQuery<GetCondition>(GetConditionQuery, {
    variables: { id: conditionId },
  })

  return (
    <>
      <PageTitle>Condition Details</PageTitle>
      {loading && <InlineLoading />}
      {error && <InfoCard title="Error" />}
      {!data && !loading && !error && (
        <InfoCard message="We couldn't fetch the data for this condition..." title="Error" />
      )}
      {data && data?.condition && (
        <Contents
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
