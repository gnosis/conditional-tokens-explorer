import { ethers } from 'ethers'
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
import { IconTypes } from 'components/statusInfo/common'
import { SelectablePositionTable } from 'components/table/SelectablePositionTable'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useCondition } from 'hooks/useCondition'
import { PositionWithUserBalanceWithDecimals } from 'hooks/usePositionsList'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { CPKService } from 'services/cpk'

const logger = getLogger('RedeemPosition')

export const Contents = () => {
  const { _type: status, CTService, connect, networkConfig, provider, signer } = useWeb3ConnectedOrInfura()

  const [transactionStatus, setTransactionStatus] = useState<Remote<Maybe<boolean>>>(
    Remote.notAsked<Maybe<boolean>>()
  )
  const [position, setPosition] = useState<Maybe<PositionWithUserBalanceWithDecimals>>(null)
  const [conditionIds, setConditionIds] = useState<Array<string>>([])
  const [conditionId, setConditionId] = useState<string>('')

  const [isLoadingConditionIds, setIsLoadingConditionIds] = useState<boolean>(false)
  const onConditionIdSelect = useCallback((conditionId: string) => {
    setConditionId(conditionId)
  }, [])

  const condition = useCondition(conditionId)

  const clearComponent = useCallback(() => {
    setPosition(null)
    setConditionIds([])
    setConditionId('')
    setTransactionStatus(Remote.notAsked<Maybe<boolean>>())
  }, [])

  const onRedeem = useCallback(async () => {
    try {
      if (position && conditionId && status === Web3ContextStatus.Connected && signer) {
        setTransactionStatus(Remote.loading())

        const { collateralToken, conditionIds, indexSets } = position
        const newCollectionsSet = conditionIds.reduce(
          (acc, condId, i) =>
            condId !== conditionId
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
          indexSets[conditionIds.findIndex((condId) => condId === conditionId)],
        ]

        const cpk = await CPKService.create(networkConfig, provider, signer)

        await cpk.redeemPosition({
          CTService,
          collateralToken,
          parentCollectionId,
          conditionId,
          indexSets: redeemedIndexSet
        })

        setPosition(null)
        setConditionIds([])
        setConditionId('')

        setTransactionStatus(Remote.success(true))
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setTransactionStatus(Remote.failure(err))
      logger.error(err)
    }
  }, [status, CTService, connect, conditionId, position, provider, signer])

  const disabled =
    transactionStatus.isLoading() || !conditionIds.length || !position || !conditionId

  const fullLoadingActionButton = useMemo(
    () =>
      transactionStatus.isFailure()
        ? {
            buttonType: ButtonType.danger,
            onClick: () => setTransactionStatus(Remote.notAsked<Maybe<boolean>>()),
            text: 'Close',
          }
        : transactionStatus.isSuccess()
        ? {
            buttonType: ButtonType.primary,
            onClick: () => {
              clearComponent()
            },
            text: 'OK',
          }
        : undefined,
    [transactionStatus, clearComponent]
  )

  const fullLoadingMessage = useMemo(
    () =>
      transactionStatus.isFailure()
        ? transactionStatus.getFailure()
        : transactionStatus.isLoading()
        ? 'Working...'
        : 'Redeeming finished!',
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
    setIsLoadingConditionIds(true)
    setPosition(position)
    setConditionIds(position.conditionIds)
    setConditionId(position.conditionIds[0])
    setIsLoadingConditionIds(false)
  }, [])

  const onFilterCallback = (positions: PositionWithUserBalanceWithDecimals[]) => {
    return positions.filter(
      (position: PositionWithUserBalanceWithDecimals) =>
        position.conditions.every((condition) => condition.resolved) &&
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
      <Row cols="1fr">
        <ConditionsDropdown
          conditions={conditionIds}
          isLoading={isLoadingConditionIds}
          onClick={onConditionIdSelect}
          value={conditionId}
        />
      </Row>
      <Row cols="1fr">
        {position && condition && (
          <PositionPreview
            condition={condition}
            networkConfig={networkConfig}
            position={position}
          />
        )}
      </Row>
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
