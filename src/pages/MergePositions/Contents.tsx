import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Prompt } from 'react-router'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { Amount } from 'components/form/Amount'
import { ConditionsDropdown } from 'components/form/ConditionsDropdown'
import { SelectCondition } from 'components/form/SelectCondition'
import { MergePreview } from 'components/mergePositions/MergePreview'
import { MergeResultModal } from 'components/mergePositions/MergeResultModal'
import { MergeWith } from 'components/mergePositions/MergeWith'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { StatusInfoInline, StatusInfoType } from 'components/statusInfo/StatusInfoInline'
import { IconTypes } from 'components/statusInfo/common'
import { SelectablePositionTable } from 'components/table/SelectablePositionTable'
import { NULL_PARENT_ID, ZERO_BN } from 'config/constants'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from 'util/logger'
import {
  arePositionMergeables,
  arePositionMergeablesByCondition,
  getFreeIndexSet,
  getFullIndexSet,
  getTokenSummary,
  isPartitionFullIndexSet,
  minBigNumber,
} from 'util/tools'
import { Status, Token } from 'util/types'

const logger = getLogger('MergePosition')

export const Contents = () => {
  const {
    _type: statusContext,
    CTService,
    connect,
    networkConfig,
    provider,
  } = useWeb3ConnectedOrInfura()

  const { clearPositions, errors: positionsErrors, positions } = useMultiPositionsContext()
  const { balances, errors: balancesErrors, updateBalances } = useBatchBalanceContext()
  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()
  const [status, setStatus] = useState<Maybe<Status>>(null)
  const [error, setError] = useState<Maybe<Error>>(null)
  const [collateralToken, setCollateralToken] = useState<Maybe<Token>>(null)
  const [mergeResult, setMergeResult] = useState<string>('')

  const canMergePositions = useMemo(() => {
    return condition && arePositionMergeablesByCondition(positions, condition)
  }, [positions, condition])

  const mergeablePositions = useMemo(() => {
    return arePositionMergeables(positions)
  }, [positions])

  useEffect(() => {
    let cancelled = false
    if (positions.length && mergeablePositions) {
      getTokenSummary(networkConfig, provider, positions[0].collateralToken.id)
        .then((token) => {
          if (!cancelled) {
            setCollateralToken(token)
          }
        })
        .catch((err) => {
          logger.error(err)
        })
    }
    return () => {
      cancelled = true
    }
  }, [positions, networkConfig, provider, mergeablePositions])

  const maxBalance = useMemo(
    () => (mergeablePositions && balances.length ? minBigNumber(balances) : ZERO_BN),
    [balances, mergeablePositions]
  )

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const amountChangeHandler = useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])

  const useWalletHandler = useCallback(() => {
    if (mergeablePositions && maxBalance.gt(ZERO_BN)) {
      setAmount(maxBalance)
    }
  }, [maxBalance, mergeablePositions])

  const decimals = useMemo(() => (collateralToken ? collateralToken.decimals : 0), [
    collateralToken,
  ])

  const disabled = useMemo(
    () =>
      status === Status.Loading ||
      positionsErrors.length > 0 ||
      conditionErrors.length > 0 ||
      balancesErrors.length > 0 ||
      !canMergePositions ||
      amount.isZero(),
    [canMergePositions, amount, status, positionsErrors, conditionErrors, balancesErrors]
  )

  const onMerge = useCallback(async () => {
    try {
      if (positions && condition && statusContext === Web3ContextStatus.Connected) {
        setStatus(Status.Loading)

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

        // It shouldn't be able to call onMerge if positions were not mergeables, so no -1 for findIndex.
        const partition = positions.map(
          ({ conditionIds, indexSets }) =>
            indexSets[conditionIds.findIndex((conditionId) => conditionId === condition.id)]
        )

        await CTService.mergePositions(
          collateralToken.id,
          parentCollectionId,
          condition.id,
          partition,
          amount
        )

        // if freeindexset == 0, everything was merged to...
        if (isPartitionFullIndexSet(condition.outcomeSlotCount, partition)) {
          if (parentCollectionId === NULL_PARENT_ID) {
            // original collateral,
            setMergeResult(collateralToken.id)
          } else {
            // or a position
            setMergeResult(
              ConditionalTokensService.getPositionId(collateralToken.id, parentCollectionId)
            )
          }
        } else {
          const indexSetOfMergedPosition = new BigNumber(
            getFreeIndexSet(condition.outcomeSlotCount, partition) ^
              getFullIndexSet(condition.outcomeSlotCount)
          )
          setMergeResult(
            ConditionalTokensService.getPositionId(
              collateralToken.id,
              ConditionalTokensService.getCollectionId(
                parentCollectionId,
                condition.id,
                indexSetOfMergedPosition
              )
            )
          )
        }

        setStatus(Status.Ready)
      } else {
        connect()
      }
    } catch (err) {
      setStatus(Status.Error)
      setError(err)
      logger.error(err)
    }
  }, [positions, condition, statusContext, CTService, amount, connect])

  const clearComponent = useCallback(() => {
    setAmount(ZERO_BN)
    clearPositions()
    clearCondition()
    updateBalances([])
    setMergeResult('')
    setStatus(null)
  }, [clearPositions, clearCondition, updateBalances])

  const fullLoadingActionButton =
    status === Status.Error
      ? {
          buttonType: ButtonType.danger,
          onClick: () => setStatus(null),
          text: 'Close',
        }
      : undefined

  const fullLoadingIcon =
    status === Status.Error
      ? IconTypes.error
      : status === Status.Loading
      ? IconTypes.spinner
      : undefined

  const fullLoadingMessage =
    status === Status.Error ? error?.message : status === Status.Loading ? 'Working...' : undefined

  const mergeablePositionsArray: Array<any> = [
    {
      position: '[DAI C: 0xb67f….ffa7 O: 0|1] x 10',
    },
    {
      position: '[DAI C: 0xb67f….ffa7 O: 6|7|10] x 10',
    },
    {
      position: '[DAI C: 0xb67f….ffa7 O: 2|4] x 10',
    },
    {
      position: '[DAI C: 0xb67f….ffa7 O: 3|5|9|8] x 10',
    },
  ]

  const [selectedConditionId, setSelectedConditionId] = useState<string | undefined>()
  const [conditionIds, setConditionIds] = useState<Array<string> | undefined>()
  const [isLoadingConditionIds, setIsLoadingConditionIds] = useState<boolean>(false)
  const onConditionIdSelect = (conditionId: string) => {
    setSelectedConditionId(conditionId)
    console.log(conditionId)
  }

  const onMergeableItemClick = (item: any, index: number) => {
    setConditionIds([
      '0xc857ba826f1503552ed33578cd90c66029cc81b7d56bb06dcc8fbac21757f8ce',
      '0x463623d0b1399ce72cfb02f5d616b7664c0aaf8e488a6bdd980c19c0542f3c53',
      '0xac302a138fa8668be8038e4b1556a2cf1040a42353145fdd0ffb4fa19bea23f7',
      '0x7e73fa4e7c1e2b443084c242c0c49207e36985a27a58a3d934209cc9665ad5c0',
      '0x87602f63bb274009a02cbbe4f7567a9727e4be8c0a1127a98ecc7a17d83e0a13',
      '0xd3a743bbc6816895593ce25f77e7b59fe6afeeff40933db8a0ef180d4e6e49c5',
    ])
    console.log(item.position, index)
  }

  const fullLoadingTitle = status === Status.Error ? 'Error' : 'Merge Positions'
  const isWorking = status === Status.Loading || status === Status.Error
  const isFinished = status === Status.Ready

  return (
    <CenteredCard>
      <SelectablePositionTable />
      <Row cols="1fr" marginBottomXL>
        <MergeWith mergeablePositions={mergeablePositionsArray} onClick={onMergeableItemClick} />
      </Row>
      <Row cols="1fr">
        <ConditionsDropdown
          conditions={conditionIds}
          onClick={onConditionIdSelect}
          value={selectedConditionId}
        />
      </Row>
      {condition && condition.resolved && (
        <Row cols="1fr">
          <StatusInfoInline status={StatusInfoType.warning}>
            This condition is already resolved.
          </StatusInfoInline>
        </Row>
      )}
      <Row cols="1fr">
        <Amount
          amount={amount}
          balance={maxBalance}
          decimals={decimals}
          disabled={!mergeablePositions}
          max={maxBalance.toString()}
          onAmountChange={amountChangeHandler}
          onUseWalletBalance={useWalletHandler}
        />
      </Row>
      <Row cols="1fr">
        <MergePreview amount={amount} />
      </Row>
      {isWorking && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={fullLoadingTitle}
        />
      )}
      {isFinished && collateralToken && (
        <MergeResultModal
          amount={amount}
          closeAction={clearComponent}
          collateralToken={collateralToken}
          isOpen={status === Status.Ready}
          mergeResult={mergeResult}
        ></MergeResultModal>
      )}
      <ButtonContainer>
        <Button disabled={disabled} onClick={onMerge}>
          Merge
        </Button>
      </ButtonContainer>
      <Prompt
        message="Are you sure you want to leave this page? The changes you made will be lost?"
        when={positions.length > 0 || !!condition || !amount.isZero()}
      />
    </CenteredCard>
  )
}
