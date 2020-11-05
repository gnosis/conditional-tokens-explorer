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
import { ZERO_BN } from 'config/constants'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useIsConditionResolved } from 'hooks/useIsConditionResolved'
import { PositionWithUserBalanceWithDecimals, usePositionsList } from 'hooks/usePositionsList'
import { ConditionInformation } from 'hooks/utils'
import { ERC20Service } from 'services/erc20'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { getTokenSummary, isDisjointPartition, minBigNumber, positionString } from 'util/tools'
import {
  AdvancedFilterPosition,
  PositionSearchOptions,
  Token,
  WrappedCollateralOptions,
} from 'util/types'

const logger = getLogger('MergePosition')

interface MergeablePosition {
  position: PositionWithUserBalanceWithDecimals
  positionPreview: string
}

export const Contents = () => {
  const { CTService, networkConfig, provider } = useWeb3ConnectedOrInfura()

  const [transactionStatus, setTransactionStatus] = useState<Remote<Maybe<string>>>(
    Remote.notAsked<Maybe<string>>()
  )

  const [conditionId, setConditionId] = useState<Maybe<string>>(null)
  const [position, setPosition] = useState<Maybe<PositionWithUserBalanceWithDecimals>>(null)

  const [conditionIds, setConditionIds] = useState<Array<string>>([])
  const [isLoadingConditions, setIsLoadingConditions] = useState<boolean>(false)

  const [mergeablePositions, setMergeablePositions] = useState<Array<MergeablePosition>>([])
  const [isLoadingMergeablePositions, setIsLoadingMergeablePositions] = useState<boolean>(false)

  const [selectedPositions, setSelectedPositions] = useState<
    Array<PositionWithUserBalanceWithDecimals>
  >([])
  const [selectedBalancePositions, setSelectedBalancePositions] = useState<Array<BigNumber>>([])

  const [mergeResult, setMergeResult] = useState<string>('')

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const [collateralToken, setCollateralToken] = useState<Maybe<Token>>(null)

  const isConditionResolved = useIsConditionResolved(conditionId)

  useEffect(() => {
    const getCollateral = async () => {
      try {
        if (position) {
          const token = await getTokenSummary(networkConfig, provider, position.collateralToken)
          setCollateralToken(token)
        }
      } catch (err) {
        logger.error(err)
      }
      return null
    }

    getCollateral()
  }, [networkConfig, provider, position])

  const decimals = useMemo(() => (collateralToken ? collateralToken.decimals : 0), [
    collateralToken,
  ])

  const clearComponent = useCallback(() => {
    setConditionId(null)
    setPosition(null)
    setConditionIds([])
    setIsLoadingConditions(false)
    setMergeablePositions([])
    setIsLoadingMergeablePositions(false)
    setSelectedPositions([])
    setSelectedBalancePositions([])
    setMergeResult('')
    setAmount(ZERO_BN)
    setMergeResult('')
    // TODO check this collateral
    // setCollateralToken(null)
    setTransactionStatus(Remote.notAsked<Maybe<string>>())
  }, [])

  const onConditionSelect = useCallback((conditionId: string) => {
    setConditionId(conditionId)
    logger.log(conditionId)
  }, [])

  const onMergeableItemClick = useCallback(
    (item: MergeablePosition, index: number) => {
      logger.log(item, index)
      const { position } = item
      const existPosition = selectedPositions.find(
        (selectedPosition) => selectedPosition.id === position.id
      )
      if (!existPosition) {
        setSelectedPositions([...selectedPositions, position])
        setConditionId(position.conditions[0].conditionId)
      }
    },
    [selectedPositions]
  )

  const onAmountChange = useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])

  const onMerge = useCallback(() => null, [])

  const advancedFilters: AdvancedFilterPosition = useMemo(() => {
    return {
      CollateralValue: {
        type: null,
        value: null,
      },
      ToCreationDate: null,
      FromCreationDate: null,
      TextToSearch: {
        type: PositionSearchOptions.All,
        value: null,
      },
      WrappedCollateral: WrappedCollateralOptions.All,
    }
  }, [])

  const { data: positions, error: errorPositions } = usePositionsList(advancedFilters)

  const onRowClicked = useCallback(
    async (position: PositionWithUserBalanceWithDecimals) => {
      setPosition(position)

      setMergeablePositions([])
      setConditionIds([])

      if (positions && positions.length > 0 && !!position) {
        setIsLoadingConditions(true)
        setIsLoadingMergeablePositions(true)

        const possibleMergeablePositions = []

        const positionsFiltered = positions.filter(
          (positionWithBalance: PositionWithUserBalanceWithDecimals) =>
            //#1 Filter, only positions with balance
            !positionWithBalance.userBalanceERC1155.isZero() &&
            //#2 Filter, remove original selected position
            positionWithBalance.id.toLowerCase() !== position.id.toLowerCase() &&
            //#3 Filter, positions with the same condition set
            positionWithBalance.conditionIds.sort().join('') ===
              position.conditionIds.sort().join('') &&
            //#4 Filter, positions with the same collateral
            positionWithBalance.collateralToken.toLowerCase() ===
              position.collateralToken.toLowerCase() &&
            //#5 Filter, allow only disjoint positions
            positionWithBalance.conditions.filter((condition: ConditionInformation) =>
              isDisjointPartition(positionWithBalance.indexSets, condition.outcomeSlotCount)
            ).length > 0
        )

        // TODO promise all
        for (const positionFiltered of positionsFiltered) {
          const { collateralToken, conditionIds, indexSets } = positionFiltered
          const balanceOfPositionId = await CTService.balanceOf(positionFiltered.id)
          const erc20Service = new ERC20Service(provider, collateralToken)
          const tokenPosition = await erc20Service.getProfileSummary()

          const positionObject = {
            position: positionFiltered,
            positionPreview: positionString(
              conditionIds,
              indexSets,
              balanceOfPositionId,
              tokenPosition
            ),
          }
          possibleMergeablePositions.push(positionObject)
        }

        // Calculate condition Ids to fulfill the dropdown
        const conditionIds: string[] = possibleMergeablePositions.reduce(
          (
            acc: string[],
            cur: { position: PositionWithUserBalanceWithDecimals; positionPreview: string }
          ) => acc.concat([...cur.position.conditionIds]),
          []
        )

        // Remove duplicates
        const possibleConditions = conditionIds.filter(
          (item, pos) => conditionIds.indexOf(item) === pos
        )

        setConditionIds(possibleConditions)
        setMergeablePositions(possibleMergeablePositions)
        setIsLoadingConditions(false)
        setIsLoadingMergeablePositions(false)
      }
    },
    [positions, CTService, provider]
  )

  const maxBalance = useMemo(
    () => (selectedBalancePositions.length > 0 ? minBigNumber(selectedBalancePositions) : ZERO_BN),
    [selectedBalancePositions]
  )

  const onUsePositionBalance = useCallback(() => {
    if (selectedPositions && maxBalance.gt(ZERO_BN)) {
      setAmount(maxBalance)
    }
  }, [maxBalance, selectedPositions])

  useEffect(() => {
    const getBalance = async (positionIds: Array<string>) => {
      try {
        if (positionIds.length > 0 && position) {
          const balancePositions = await CTService.balanceOfBatch(positionIds)
          setSelectedBalancePositions(balancePositions)
        } else {
          setSelectedBalancePositions([])
        }
      } catch (err) {
        logger.error(err)
        setSelectedBalancePositions([])
      }
    }

    const selectedPositionsIds = selectedPositions.map(
      (selectedPosition: PositionWithUserBalanceWithDecimals) => selectedPosition.id
    )
    if (position) {
      // We add the first selected position that we search
      selectedPositionsIds.push(position.id)
    }
    getBalance(selectedPositionsIds)
  }, [CTService, selectedPositions, position])

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
        : 'Merge positions finished!',
    [transactionStatus]
  )

  const fullLoadingTitle = useMemo(
    () => (transactionStatus.isFailure() ? 'Error' : 'Merge Positions'),
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

  const disabled = useMemo(
    () =>
      transactionStatus.isLoading() ||
      !selectedPositions.length ||
      !conditionId ||
      !position ||
      amount.isZero(),
    [transactionStatus, amount, selectedPositions, conditionId, position]
  )

  return (
    <CenteredCard>
      <SelectablePositionTable
        onClearCallback={clearComponent}
        onRowClicked={onRowClicked}
        selectedPosition={position}
      />
      <Row cols="1fr" marginBottomXL>
        <MergeWith
          errorFetching={errorPositions}
          isLoading={isLoadingMergeablePositions}
          mergeablePositions={mergeablePositions}
          onClick={onMergeableItemClick}
        />
      </Row>
      <Row cols="1fr">
        <ConditionsDropdown
          conditions={conditionIds}
          isLoading={isLoadingConditions}
          onClick={onConditionSelect}
          value={conditionId}
        />
      </Row>
      {isConditionResolved && (
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
          isFromAPosition={true}
          max={maxBalance.toString()}
          onAmountChange={onAmountChange}
          onUseWalletBalance={onUsePositionBalance}
        />
      </Row>
      <Row cols="1fr">
        <MergePreview
          amount={amount}
          conditionId={conditionId}
          positions={selectedPositions}
          token={collateralToken}
        />
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
        <Button  disabled={disabled} onClick={onMerge}>Merge</Button>
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
