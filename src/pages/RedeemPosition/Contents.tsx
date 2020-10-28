import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Prompt } from 'react-router'

import { Button } from 'components/buttons'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { SelectCondition } from 'components/form/SelectCondition'
import { SelectPositions } from 'components/form/SelectPositions'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { PositionPreview } from 'components/redeemPosition/PositionPreview'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useIsPositionRelatedToCondition } from 'hooks/useIsPositionRelatedToCondition'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from 'util/logger'
import { Status } from 'util/types'

const logger = getLogger('RedeemPosition')

export const Contents = () => {
  const { _type: status, CTService, connect, networkConfig } = useWeb3ConnectedOrInfura()
  const {
    clearPositions,
    errors: positionsErrors,
    loading: loadingPositions,
    positions,
  } = useMultiPositionsContext()
  const {
    errors: balancesErrors,
    loading: loadingBalance,
    updateBalances,
  } = useBatchBalanceContext()

  const {
    clearCondition,
    condition,
    errors: conditionErrors,
    loading: loadingCondition,
  } = useConditionContext()
  const [transactionStatus, setTransactionStatus] = React.useState<Maybe<Status>>(null)
  const [error, setError] = React.useState<Maybe<Error>>(null)

  useEffect(() => {
    if (positions) {
      updateBalances(positions.map((p) => p.id))
    }
  }, [positions, updateBalances])

  const loading = useMemo(
    () =>
      loadingCondition ||
      loadingBalance ||
      loadingPositions ||
      transactionStatus === Status.Loading,
    [loadingCondition, loadingBalance, loadingPositions, transactionStatus]
  )

  const onRedeem = useCallback(async () => {
    try {
      if (positions.length && condition && status === Web3ContextStatus.Connected) {
        setTransactionStatus(Status.Loading)

        const { collateralToken, conditionIds, indexSets } = positions[0]
        const newCollectionsSet = conditionIds.reduce(
          (acc, conditionId, i) =>
            conditionId !== condition.id
              ? [...acc, { conditionId, indexSet: new BigNumber(indexSets[i]) }]
              : acc,
          new Array<{ conditionId: string; indexSet: BigNumber }>()
        )
        const parentCollectionId = newCollectionsSet.length
          ? ConditionalTokensService.getCombinedCollectionId(newCollectionsSet)
          : ethers.constants.HashZero

        // This UI only allows to redeem 1 position although it's possible to redeem multiple position when you the user owns different positions with the same set of conditions and several indexSets for the resolved condition.
        // i.e.
        // - DAI C:0x123 0:0b01 && C:0x345 O:0b01
        // - DAI C:0x123 0:0b01 && C:0x345 O:0b10
        // 0x345 is the resolved condition
        // a could call redeeemPositions(DAI, parentCollectionId, 0x345, [1,2])

        // It shouldn't be able to call onRedeem if resolved condition id were not included in conditionsIds, so no -1 for findIndex.
        const redeemedIndexSet = [
          indexSets[conditionIds.findIndex((conditionId) => conditionId === condition.id)],
        ]

        await CTService.redeemPositions(
          collateralToken.id,
          parentCollectionId,
          condition.id,
          redeemedIndexSet
        )

        clearCondition()
        clearPositions()
        setError(null)

        setTransactionStatus(Status.Ready)
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setTransactionStatus(Status.Error)
      setError(err)
      logger.error(err)
    }
  }, [positions, condition, status, CTService, clearCondition, clearPositions, connect])

  const {
    isRelated,
    loading: loadingCheckPositionRelatedToCondition,
  } = useIsPositionRelatedToCondition(positions.length ? positions[0].id : '', condition?.id || '')

  const disabled =
    loading ||
    positionsErrors.length > 0 ||
    conditionErrors.length > 0 ||
    balancesErrors.length > 0 ||
    !positions.length ||
    !condition ||
    !isRelated

  const nonRelatedPositionAndCondition = React.useMemo(() => {
    return (
      !isRelated && !!(positions.length > 0 && condition) && !loadingCheckPositionRelatedToCondition
    )
  }, [isRelated, positions, condition, loadingCheckPositionRelatedToCondition])

  const fullLoadingActionButton =
    transactionStatus === Status.Error
      ? {
          buttonType: ButtonType.danger,
          onClick: () => setTransactionStatus(null),
          text: 'Close',
        }
      : transactionStatus === Status.Ready
      ? {
          buttonType: ButtonType.primary,
          onClick: () => setTransactionStatus(null),
          text: 'OK',
        }
      : undefined

  const fullLoadingMessage =
    transactionStatus === Status.Error
      ? error?.message
      : transactionStatus === Status.Loading
      ? 'Working...'
      : 'Redeeming finished!'

  const fullLoadingTitle = transactionStatus === Status.Error ? 'Error' : 'Redeem Positions'

  const fullLoadingIcon =
    transactionStatus === Status.Error
      ? IconTypes.error
      : transactionStatus === Status.Loading
      ? IconTypes.spinner
      : IconTypes.ok

  const isWorking =
    transactionStatus === Status.Loading ||
    transactionStatus === Status.Error ||
    transactionStatus === Status.Ready

  return (
    <CenteredCard>
      <Row cols="1fr">
        <SelectPositions showOnlyPositionsWithBalance singlePosition title="Position" />
      </Row>
      <Row cols="1fr">
        <SelectCondition title="Resolved Condition Id" />
      </Row>
      <Row cols="1fr">
        <PositionPreview
          condition={condition}
          networkConfig={networkConfig}
          position={positions.length ? positions[0] : null}
        />
      </Row>
      {nonRelatedPositionAndCondition && (
        <ErrorContainer>
          <Error>Position is not related to the condition.</Error>
        </ErrorContainer>
      )}
      {isWorking && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={fullLoadingTitle}
        />
      )}
      <ButtonContainer>
        <Button disabled={disabled} onClick={onRedeem}>
          Redeem
        </Button>
      </ButtonContainer>
      <Prompt
        message="Are you sure you want to leave this page? The changes you made will be lost?"
        when={!!condition || positions.length > 0}
      />
    </CenteredCard>
  )
}
