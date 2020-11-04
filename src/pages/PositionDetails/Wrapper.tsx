import React from 'react'

import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { usePositionContext } from 'contexts/PositionContext'
import { Contents } from 'pages/PositionDetails/Contents'
import { PositionData_conditions } from 'types/generatedGQLForCTE'
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

  const {
    balanceERC20,
    balanceERC1155,
    collateralTokenAddress,
    errors,
    loading,
    position,
    refetchBalances,
    setPositionId,
    wrappedTokenAddress,
  } = usePositionContext()

  React.useEffect(() => {
    setPositionId(positionId)
  }, [positionId, setPositionId])

  const conditions = position?.conditions.map((condition: PositionData_conditions) => {
    return {
      hash: condition.id,
    }
  })

  const DisplayErrors = React.useCallback(() => {
    const isNotLoadingAndThereIsNoPosition: boolean = !loading && !position
    if (isNotLoadingAndThereIsNoPosition && isPositionErrorInvalid(errors)) {
      return <InfoCard message="Position not valid..." title="Error" />
    } else if (isNotLoadingAndThereIsNoPosition && isPositionErrorFetching(errors)) {
      return <InfoCard message="We couldn't fetch the data for this position..." title="Error" />
    } else if (
      isNotLoadingAndThereIsNoPosition ||
      (isNotLoadingAndThereIsNoPosition && isPositionErrorNotFound(errors))
    ) {
      return <InfoCard message="We couldn't find this position..." title="Not Found" />
    } else {
      return null
    }
  }, [errors, loading, position])

  return (
    <>
      <PageTitle>Position Details</PageTitle>
      {loading && errors.length === 0 && <InlineLoading />}
      {<DisplayErrors />}
      {!loading && position && (
        <Contents
          balanceERC1155={balanceERC1155}
          balanceERC20={balanceERC20}
          collateralTokenAddress={collateralTokenAddress}
          conditions={conditions || []}
          position={position}
          refetchBalances={refetchBalances}
          wrappedTokenAddress={wrappedTokenAddress}
        />
      )}
    </>
  )
}
