import React from 'react'

import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { usePositionContext } from 'contexts/PositionContext'
import { Contents } from 'pages/PositionDetails/Contents'
import {
  isPositionErrorFetching,
  isPositionErrorInvalid,
  isPositionErrorNotFound,
} from 'util/tools'

interface WrapperProps {
  positionId: string
}

export const Wrapper = (props: WrapperProps) => {
  const { positionId } = props

  const { balanceERC1155, balanceERC20, errors, loading, position, setPositionId, refetchBalances } = usePositionContext()

  React.useEffect(() => {
    setPositionId(positionId)
  }, [positionId, setPositionId])

  return (
    <>
      <PageTitle>Position Details</PageTitle>
      {loading && <InlineLoading />}
      {!loading && !position && isPositionErrorNotFound(errors) ? (
        <InfoCard message="We couldn't find this position..." title="Not Found" />
      ) : !loading && !position && isPositionErrorInvalid(errors) ? (
        <InfoCard message="Position not valid..." title="Error" />
      ) : !loading && !position && isPositionErrorFetching(errors) ? (
        <InfoCard message="We couldn't fetch the data for this position..." title="Error" />
      ) : (
        position && <Contents balanceERC1155={balanceERC1155} balanceERC20={balanceERC20} position={position} refetchBalances={refetchBalances} />
      )}
    </>
  )
}
