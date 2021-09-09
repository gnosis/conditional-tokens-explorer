import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import { Prompt } from 'react-router'

import { Button } from 'components/buttons'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import { ConditionsDropdown } from 'components/form/ConditionsDropdown'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { PositionPreview } from 'components/redeemPosition/PositionPreview'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { StatusInfoInline, StatusInfoType } from 'components/statusInfo/StatusInfoInline'
import { IconTypes } from 'components/statusInfo/common'
import { SelectablePositionTable } from 'components/table/SelectablePositionTable'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useCollateral } from 'hooks/useCollateral'
import { useCondition } from 'hooks/useCondition'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { formatBigNumber, getParentCollectionId, getRedeemedBalance } from 'util/tools'

const logger = getLogger('RedeemPosition')

export const Contents = () => {
  const {
    _type: status,
    CPKService,
    CTService,
    address: walletAddress,
    connect,
    isUsingTheCPKAddress,
    networkConfig,
  } = useWeb3ConnectedOrInfura()

  const [transactionStatus, setTransactionStatus] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )
  const [position, setPosition] = useState<Maybe<PositionWithUserBalanceWithDecimals>>(null)
  const [conditionIds, setConditionIds] = useState<Array<string>>([])
  const [conditionId, setConditionId] = useState<string>('')

  const [isLoadingConditionIds, setIsLoadingConditionIds] = useState<boolean>(false)
  const onConditionIdSelect = useCallback((conditionId: string) => {
    setConditionId(conditionId)
  }, [])

  const { condition, loading: loadingCondition } = useCondition(conditionId)

  const clearComponent = useCallback(() => {
    setPosition(null)
    setConditionIds([])
    setConditionId('')
  }, [])

  const redeemedBalance = useMemo(
    () =>
      position && condition
        ? getRedeemedBalance(position, condition, position.userBalanceERC1155)
        : new BigNumber(0),
    [condition, position]
  )

  logger.log(`Balance to redeem`, redeemedBalance.toString())

  const { collateral: token } = useCollateral(position ? position.collateralToken : '')

  const getBalanceRedemeed = useCallback(() => {
    return redeemedBalance && token
      ? `${formatBigNumber(redeemedBalance, token.decimals)} ${token.symbol}`
      : ''
  }, [redeemedBalance, token])

  const onRedeem = useCallback(async () => {
    try {
      if (
        position &&
        conditionId &&
        status === Web3ContextStatus.Connected &&
        CPKService &&
        walletAddress
      ) {
        setTransactionStatus(Remote.loading())

        const { collateralToken, conditionIds, indexSets } = position

        const parentCollectionId = getParentCollectionId(indexSets, conditionIds, conditionId)
        // This UI only allows to redeem 1 position although it's possible to redeem multiple position when you the user owns different positions with the same set of conditions and several indexSets for the resolved condition.
        // i.e.
        // - DAI C:0x123 0:0b01 && C:0x345 O:0b01
        // - DAI C:0x123 0:0b01 && C:0x345 O:0b10
        // 0x345 is the resolved condition
        // a could call redeeemPositions(DAI, parentCollectionId, 0x345, [1,2])

        // It shouldn't be able to call onRedeem if resolved condition id were not included in conditionsIds, so no -1 for findIndex.
        const redeemedIndexSet = [
          indexSets[conditionIds.findIndex((condId) => condId === conditionId)],
        ]

        if (isUsingTheCPKAddress()) {
          await CPKService.redeemPosition({
            CTService,
            collateralToken,
            parentCollectionId,
            conditionId,
            indexSets: redeemedIndexSet,
            account: walletAddress,
            earnedCollateral: redeemedBalance,
          })
        } else {
          await CTService.redeemPositions(
            collateralToken,
            parentCollectionId,
            conditionId,
            redeemedIndexSet
          )
        }
        setTransactionStatus(Remote.success(getBalanceRedemeed()))
        clearComponent()
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setTransactionStatus(Remote.failure(err))
      logger.error(err)
    }
  }, [
    status,
    CPKService,
    CTService,
    walletAddress,
    connect,
    redeemedBalance,
    isUsingTheCPKAddress,
    getBalanceRedemeed,
    clearComponent,
    conditionId,
    position,
  ])

  const disabled =
    transactionStatus.isLoading() || !conditionIds.length || !position || !conditionId

  const fullLoadingActionButton = useMemo(
    () =>
      transactionStatus.isFailure()
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
        : undefined,
    [transactionStatus]
  )

  const fullLoadingMessage = useMemo(
    () =>
      transactionStatus.isFailure()
        ? transactionStatus.getFailure()
        : transactionStatus.isLoading()
        ? 'Working...'
        : `Redeeming of ${transactionStatus.get()} finished!`,
    [transactionStatus]
  )

  const fullLoadingTitle = useMemo(
    () => (transactionStatus.isFailure() ? 'Error' : 'Redeem Positions'),
    [transactionStatus]
  )

  const fullLoadingIcon = useMemo(
    () =>
      transactionStatus.isFailure()
        ? IconTypes.error
        : transactionStatus.isLoading()
        ? IconTypes.spinner
        : IconTypes.ok,
    [transactionStatus]
  )

  const isWorking = useMemo(
    () =>
      transactionStatus.isLoading() ||
      transactionStatus.isFailure() ||
      transactionStatus.isSuccess(),
    [transactionStatus]
  )

  const onRowClicked = useCallback((position: PositionWithUserBalanceWithDecimals) => {
    const resolvedConditionsIds = position.conditions
      .filter((c) => c.resolved)
      .map((c) => c.conditionId)
    setIsLoadingConditionIds(true)
    setPosition(position)
    setConditionIds(resolvedConditionsIds)
    setConditionId(resolvedConditionsIds[0])
    setIsLoadingConditionIds(false)
  }, [])

  const onFilterCallback = (positions: PositionWithUserBalanceWithDecimals[]) => {
    return positions.filter(
      (position: PositionWithUserBalanceWithDecimals) =>
        position.conditions.some((condition) => condition.resolved) &&
        !position.userBalanceERC1155.isZero()
    )
  }

  return (
    <CenteredCard>
      <SelectablePositionTable
        onClearCallback={clearComponent}
        onFilterCallback={onFilterCallback}
        onRowClicked={onRowClicked}
        refetch={transactionStatus.isSuccess()}
        selectedPosition={position}
      />
      <Row>
        <ConditionsDropdown
          conditions={conditionIds}
          isLoading={isLoadingConditionIds}
          onClick={onConditionIdSelect}
          value={conditionId}
        />
      </Row>
      <Row>
        <PositionPreview
          condition={condition}
          isLoading={loadingCondition}
          networkConfig={networkConfig}
          position={position}
        />
      </Row>
      {redeemedBalance &&
        redeemedBalance.isZero() &&
        conditionId &&
        !loadingCondition &&
        position &&
        position.conditionIds.length < 2 && (
          <Row>
            <StatusInfoInline status={StatusInfoType.warning}>
              The redeemed balance is 0.00. You will not receive any {token && token.symbol} to your
              wallet.
            </StatusInfoInline>
          </Row>
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
        when={!!(position || conditionId || conditionIds.length > 0)}
      />
    </CenteredCard>
  )
}
