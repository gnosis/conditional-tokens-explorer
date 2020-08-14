import React from 'react'

import { InfoCard } from '../../components/common/InfoCard'
import { InlineLoading } from '../../components/loading/InlineLoading'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { usePositionContext } from '../../contexts/PositionContext'
import {
  isPositionErrorFetching,
  isPositionErrorInvalid,
  isPositionErrorNotFound,
} from '../../util/tools'

import { Contents } from './Contents'

interface WrapperProps {
  positionId: string
}

export const Wrapper = (props: WrapperProps) => {
  const { positionId } = props

  const { errors, loading, position, setPositionId } = usePositionContext()

  React.useEffect(() => {
    setPositionId(positionId)
  }, [positionId, setPositionId])

  return (
    <>
      <PageTitle>Position Details</PageTitle>
      {loading && <InlineLoading />}
      {!loading && !position && isPositionErrorNotFound(errors) && (
        <InfoCard message="We couldn't find this position..." title="Not Found" />
      )}
      {!loading && !position && isPositionErrorInvalid(errors) && (
        <InfoCard message="Position not valid..." title="Error" />
      )}

      {!loading && !position && isPositionErrorFetching(errors) && (
        <InfoCard message="We couldn't fetch the data for this position..." title="Error" />
      )}
      {position && <Contents position={position} />}
    </>
  )
}
