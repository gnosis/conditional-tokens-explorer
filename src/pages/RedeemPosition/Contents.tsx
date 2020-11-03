import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Prompt } from 'react-router'

import { Button } from 'components/buttons'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { ConditionsDropdown } from 'components/form/ConditionsDropdown'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { PositionPreview } from 'components/redeemPosition/PositionPreview'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { SelectablePositionTable } from 'components/table/SelectablePositionTable'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { PositionWithUserBalanceWithDecimals } from 'hooks'
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

  const [conditionIds, setConditionIds] = useState<Array<string> | undefined>()
  const [isLoadingConditionIds, setIsLoadingConditionIds] = useState<boolean>(false)
  const [selectedConditionId, setSelectedConditionId] = useState<string | undefined>()
  const onConditionIdSelect = useCallback((conditionId: string) => {
    setSelectedConditionId(conditionId)
  }, [])

  const [selectedPositionId, setSelectedPositionId] = useState<string | undefined>()
  const onRowClicked = useCallback((row: PositionWithUserBalanceWithDecimals) => {
    setSelectedPositionId(row.id)
    setConditionIds([])
    setIsLoadingConditionIds(true)

    setTimeout(() => {
      setIsLoadingConditionIds(false)
      setConditionIds([
        '0xc857ba826f1503552ed33578cd90c66029cc81b7d56bb06dcc8fbac21757f8ce',
        '0x463623d0b1399ce72cfb02f5d616b7664c0aaf8e488a6bdd980c19c0542f3c53',
        '0xac302a138fa8668be8038e4b1556a2cf1040a42353145fdd0ffb4fa19bea23f7',
        '0x7e73fa4e7c1e2b443084c242c0c49207e36985a27a58a3d934209cc9665ad5c0',
        '0x87602f63bb274009a02cbbe4f7567a9727e4be8c0a1127a98ecc7a17d83e0a13',
        '0xd3a743bbc6816895593ce25f77e7b59fe6afeeff40933db8a0ef180d4e6e49c5',
      ])
    }, 1500)
  }, [])

  return (
    <CenteredCard>
      <SelectablePositionTable
        onRowClicked={onRowClicked}
        selectedPositionId={selectedPositionId}
      />
      <Row cols="1fr">
        <ConditionsDropdown
          conditions={conditionIds}
          isLoading={isLoadingConditionIds}
          onClick={onConditionIdSelect}
          value={selectedConditionId}
        />
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
        message={(params) =>
          params.pathname === '/redeem'
            ? true
            : 'Are you sure you want to leave this page? The changes you made will be lost?'
        }
        when={!!condition || positions.length > 0}
      />
    </CenteredCard>
  )
}
