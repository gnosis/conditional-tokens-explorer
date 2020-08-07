import { getLogger } from 'util/logger'

import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { InfoCard } from '../../components/common/InfoCard'
import { InlineLoading } from '../../components/loading/InlineLoading'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { GetPositionQuery } from '../../queries/positions'
import { GetPosition } from '../../types/generatedGQL'

import { Contents } from './Contents'

interface WrapperProps {
  positionId: string
}

export const Wrapper = (props: WrapperProps) => {
  const { positionId } = props
  const logger = getLogger('PositionDetail')

  const { data, error, loading } = useQuery<GetPosition>(GetPositionQuery, {
    variables: { id: positionId },
  })

  if (error) {
    logger.error(error)
  }

  return (
    <>
      <PageTitle>Position Details</PageTitle>
      {loading && <InlineLoading />}
      {error && <InfoCard title="Error" />}
      {!data && !loading && !error && (
        <InfoCard message="We couldn't fetch the data for this condition..." title="Error" />
      )}
      {data && data.position && <Contents position={data.position} />}
    </>
  )
}
