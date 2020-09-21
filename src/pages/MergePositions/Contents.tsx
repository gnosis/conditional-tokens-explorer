import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from 'components/buttons/Button'
import { CenteredCard } from 'components/common/CenteredCard'
import { Modal } from 'components/common/Modal'
import { TokenIcon } from 'components/common/TokenIcon'
import { Amount } from 'components/form/Amount'
import { SelectCondition } from 'components/form/SelectCondition'
import { SelectPositions } from 'components/form/SelectPositions'
import { MergePreview } from 'components/mergePositions/MergePreview'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
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
  getTokenSummary,
  isPositionIdValid,
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
  const [mergeResult, setMergeResult] = useState<Maybe<string>>(null)

  const canMergePositions = useMemo(() => {
    return condition && arePositionMergeablesByCondition(positions, condition)
  }, [positions, condition])

  const mergeablePositions = useMemo(() => {
    return arePositionMergeables(positions)
  }, [positions])

  useEffect(() => {
    let cancelled = false
    if (positions.length && mergeablePositions) {
      getTokenSummary(networkConfig, provider, positions[0].collateralToken.id).then((token) => {
        if (!cancelled) {
          setCollateralToken(token)
        }
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

        //if freeindexset == 0, everything is merged
        if (parentCollectionId === NULL_PARENT_ID) {
          setMergeResult(collateralToken.id)
        } else {
          setMergeResult(
            ConditionalTokensService.getPositionId(collateralToken.id, parentCollectionId)
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
    setMergeResult(null)
  }, [clearPositions, clearCondition, updateBalances])

  return (
    <CenteredCard>
      <Row cols="1fr" marginBottomXL>
        <SelectPositions
          callbackToBeExecutedOnRemoveAction={() => {
            setAmount(ZERO_BN)
          }}
          showOnlyPositionsWithBalance
          title="Positions"
        />
      </Row>
      <Row cols="1fr">
        <SelectCondition />
      </Row>
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
      {(status === Status.Loading || status === Status.Error) && (
        <FullLoading
          actionButton={
            status === Status.Error ? { text: 'OK', onClick: () => setStatus(null) } : undefined
          }
          icon={status === Status.Error ? IconTypes.error : IconTypes.spinner}
          message={status === Status.Error ? error?.message : 'Waiting...'}
          title={status === Status.Error ? 'Error' : 'Merge Positions'}
        />
      )}
      {status === Status.Ready && mergeResult && (
        <Modal
          isOpen={status === Status.Ready}
          onRequestClose={clearComponent}
          subTitle={
            isPositionIdValid(mergeResult) ? (
              `Positions were successfully merged into position ${mergeResult}`
            ) : collateralToken ? (
              <>
                Positions were merged into collateral token{' '}
                <TokenIcon symbol={collateralToken.symbol}></TokenIcon>
              </>
            ) : (
              `Positions were merged into collateral token ${mergeResult}`
            )
          }
          title={'Merge Positions'}
        ></Modal>
      )}
      <ButtonContainer>
        <Button disabled={disabled} onClick={onMerge}>
          Merge
        </Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
