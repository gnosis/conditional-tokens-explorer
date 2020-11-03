import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Prompt } from 'react-router'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { Amount } from 'components/form/Amount'
import { ConditionsDropdown } from 'components/form/ConditionsDropdown'
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
import { PositionWithUserBalanceWithDecimals } from 'hooks'
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
  xorIndexSets,
} from 'util/tools'
import { Status, Token } from 'util/types'
import { Remote } from 'util/remoteData'
import { useQuery } from '@apollo/react-hooks'
import { Positions } from '../../types/generatedGQLForCTE'
import { GetPositionsQuery } from 'queries/CTEPositions'

const logger = getLogger('MergePosition')

export const Contents = () => {
  const {
    _type: statusContext,
    CTService,
    connect,
    networkConfig,
    provider,
  } = useWeb3ConnectedOrInfura()


  const [transactionStatus, setTransactionStatus] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )

  const [condition, setCondition] = useState<Maybe<any>>(null)
  const [position, setPosition] = useState<Maybe<PositionWithUserBalanceWithDecimals>>(null)

  const [conditions, setConditions] = useState<Array<string>>([])
  const [isLoadingConditions, setIsLoadingConditions] = useState<boolean>(false)

  const [mergeablePositions, setMergeablePositions] = useState<Array<any>>([])
  const [isLoadingMergeablePositions, setIsLoadingMergeablePositions] = useState<boolean>(false)

  const [mergeResult, setMergeResult] = useState<string>('')

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const [maxBalance, setMaxBalance] = useState<BigNumber>(ZERO_BN)
  const [collateralToken, setCollateralToken] = useState<Maybe<Token>>(null)

  const decimals = useMemo(() => (collateralToken ? collateralToken.decimals : 0), [
    collateralToken,
  ])

  const clearComponent = useCallback(() => {
    setConditions([])
    setIsLoadingConditions(false)
    setMergeablePositions([])
    setIsLoadingMergeablePositions(false)
    setMergeResult('')
    setAmount(ZERO_BN)
    setMaxBalance(ZERO_BN)
    setMergeResult('')
    setCollateralToken(null)
    setTransactionStatus(Remote.notAsked<Maybe<string>>())
  }, [])

  const onConditionSelect = useCallback((condition: any) => {
    setCondition(condition)
    logger.log(condition)
  }, [])

  const onMergeableItemClick = useCallback((item: any, index: number) => {
    logger.log(item.position, index)
  }, [])

  const onAmountChange = useCallback(() => null, [])
  const onUseWalletBalance = useCallback(() => null, [])
  const onMerge = useCallback(() => null, [])

  const onRowClicked = useCallback((position: PositionWithUserBalanceWithDecimals) => {
    setPosition(position)

    setMergeablePositions([])
    setConditions([])
    setIsLoadingConditions(true)
    setIsLoadingMergeablePositions(true)

    setTimeout(() => {
      setIsLoadingConditions(false)
      setIsLoadingMergeablePositions(false)

      setMergeablePositions([
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
      ])
      setConditions([
        '0xc857ba826f1503552ed33578cd90c66029cc81b7d56bb06dcc8fbac21757f8ce',
        '0x463623d0b1399ce72cfb02f5d616b7664c0aaf8e488a6bdd980c19c0542f3c53',
        '0xac302a138fa8668be8038e4b1556a2cf1040a42353145fdd0ffb4fa19bea23f7',
        '0x7e73fa4e7c1e2b443084c242c0c49207e36985a27a58a3d934209cc9665ad5c0',
        '0x87602f63bb274009a02cbbe4f7567a9727e4be8c0a1127a98ecc7a17d83e0a13',
        '0xd3a743bbc6816895593ce25f77e7b59fe6afeeff40933db8a0ef180d4e6e49c5',
      ])
    }, 1500)
  }, [])

  const {
    data: positions,
    error: positionsError,
    loading: loadingPositions,
    refetch: refetchPositions,
  } = useQuery<Positions>(GetPositionsQuery, { fetchPolicy: 'no-cache' })

  const fullLoadingActionButton = useMemo( () => transactionStatus.isFailure()
    ? {
      buttonType: ButtonType.danger,
      onClick: () => setTransactionStatus(Remote.notAsked<Maybe<string>>()),
      text: 'Close',
    }
    : transactionStatus.isSuccess()
      ? {
        buttonType: ButtonType.primary,
        onClick: () => setTransactionStatus(Remote.notAsked<Maybe<string>>()),
        text: 'OK',
      }
      : undefined, [transactionStatus] )

  const fullLoadingMessage = useMemo( () => transactionStatus.isFailure()
    ? transactionStatus.getFailure()
    : transactionStatus.isLoading()
      ? 'Working...'
      : 'Merge positions finished!', [transactionStatus])

  const fullLoadingTitle = useMemo( () => transactionStatus.isFailure() ? 'Error' : 'Merge Positions', [transactionStatus])

  const fullLoadingIcon = useMemo( () => transactionStatus.isFailure()
    ? IconTypes.error
    : transactionStatus.isLoading()
      ? IconTypes.spinner
      : IconTypes.ok, [ transactionStatus ] )

  const isWorking = useMemo(() => transactionStatus.isLoading() || transactionStatus.isFailure() || transactionStatus.isSuccess(), [transactionStatus])

  return (
    <CenteredCard>
      <SelectablePositionTable
        onRowClicked={onRowClicked}
        selectedPosition={position}
      />
      <Row cols="1fr" marginBottomXL>
        <MergeWith
          isLoading={isLoadingMergeablePositions}
          mergeablePositions={mergeablePositions}
          onClick={onMergeableItemClick}
        />
      </Row>
      <Row cols="1fr">
        <ConditionsDropdown
          conditions={conditions}
          isLoading={isLoadingConditions}
          onClick={onConditionSelect}
          value={condition}
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
          max={maxBalance.toString()}
          onAmountChange={onAmountChange}
          onUseWalletBalance={onUseWalletBalance}
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
      {transactionStatus.isSuccess() && collateralToken && (
        <MergeResultModal
          amount={amount}
          closeAction={clearComponent}
          collateralToken={collateralToken}
          isOpen={transactionStatus.isSuccess()}
          mergeResult={mergeResult}
        ></MergeResultModal>
      )}
      <ButtonContainer>
        <Button onClick={onMerge}>
          Merge
        </Button>
      </ButtonContainer>
      <Prompt
        message={(params) =>
          params.pathname === '/merge'
            ? true
            : 'Are you sure you want to leave this page? The changes you made will be lost?'
        }
        when={true}
      />
    </CenteredCard>
  )
}
