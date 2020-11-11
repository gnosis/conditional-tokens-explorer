import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import lodashUniqBy from 'lodash.uniqby'
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
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useCondition } from 'hooks/useCondition'
import { useIsConditionResolved } from 'hooks/useIsConditionResolved'
import { PositionWithUserBalanceWithDecimals, usePositionsList } from 'hooks/usePositionsList'
import lodashUniq from 'lodash.uniq'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { ERC20Service } from 'services/erc20'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import {
  arePositionMergeablesByCondition,
  getFreeIndexSet,
  getFullIndexSet,
  getTokenSummary,
  isPartitionFullIndexSet,
  minBigNumber,
  positionString,
  xorIndexSets,
} from 'util/tools'
import {
  AdvancedFilterPosition,
  MergeablePosition,
  PositionSearchOptions,
  Token,
  WrappedCollateralOptions,
} from 'util/types'

const logger = getLogger('MergePosition')

export const Contents = () => {
  const { _type: status, CTService, connect, networkConfig, provider } = useWeb3ConnectedOrInfura()

  const [transactionStatus, setTransactionStatus] = useState<Remote<Maybe<boolean>>>(
    Remote.notAsked<Maybe<boolean>>()
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
  const [clearFilters, setClearFilters] = useState(false)

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
    setTransactionStatus(Remote.notAsked<Maybe<boolean>>())
  }, [])

  const onConditionSelect = useCallback((conditionId: string) => {
    setConditionId(conditionId)
    logger.log(conditionId)
  }, [])

  const onMergeableItemClick = useCallback(
    (item: MergeablePosition, index: number, selected: boolean) => {
      logger.log(item, index, selected)
      const { position } = item
      if (selected) {
        // Add element
        const positions = [...selectedPositions, position]
        const positionsUnique = lodashUniqBy(positions, 'id')
        setSelectedPositions(positionsUnique)
      } else {
        // Remove element
        const positions = [...selectedPositions]
        const newIndex = selectedPositions.indexOf(item.position)
        if (newIndex > -1) {
          positions.splice(newIndex, 1)
          setSelectedPositions(positions)
        }
      }
      setConditionId(position?.conditions[0]?.conditionId)
    },
    [selectedPositions]
  )

  const onAmountChange = useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])

  const condition = useCondition(conditionId)

  const onMerge = useCallback(async () => {
    try {
      if (
        position &&
        conditionId &&
        selectedPositions.length > 0 &&
        condition &&
        status === Web3ContextStatus.Connected
      ) {
        setTransactionStatus(Remote.loading())

        const { collateralToken, conditionIds, indexSets } = selectedPositions[0]
        const newCollectionsSet = conditionIds.reduce(
          (acc, id, i) =>
            id !== conditionId
              ? [...acc, { conditionId: id, indexSet: new BigNumber(indexSets[i]) }]
              : acc,
          new Array<{ conditionId: string; indexSet: BigNumber }>()
        )
        const parentCollectionId = newCollectionsSet.length
          ? ConditionalTokensService.getCombinedCollectionId(newCollectionsSet)
          : ethers.constants.HashZero

        // It shouldn't be able to call onMerge if positions were not mergeables, so no -1 for findIndex.
        const partition = selectedPositions.map(
          ({ conditionIds, indexSets }) =>
            indexSets[conditionIds.findIndex((id) => conditionId === id)]
        )

        await CTService.mergePositions(
          collateralToken,
          parentCollectionId,
          conditionId,
          partition,
          amount
        )

        // if freeindexset == 0, everything was merged to...
        if (isPartitionFullIndexSet(condition.outcomeSlotCount, partition)) {
          if (parentCollectionId === NULL_PARENT_ID) {
            // original collateral,
            setMergeResult(collateralToken)
          } else {
            // or a position
            setMergeResult(
              ConditionalTokensService.getPositionId(collateralToken, parentCollectionId)
            )
          }
        } else {
          const indexSetOfMergedPosition = new BigNumber(
            xorIndexSets(
              getFreeIndexSet(condition.outcomeSlotCount, partition),
              getFullIndexSet(condition.outcomeSlotCount)
            )
          )
          setMergeResult(
            ConditionalTokensService.getPositionId(
              collateralToken,
              ConditionalTokensService.getCollectionId(
                parentCollectionId,
                conditionId,
                indexSetOfMergedPosition
              )
            )
          )
        }

        setTransactionStatus(Remote.success(true))
      } else {
        connect()
      }
    } catch (err) {
      setTransactionStatus(Remote.failure(err))
      logger.error(err)
    }
  }, [selectedPositions, position, conditionId, condition, status, CTService, amount, connect])

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
      setSelectedPositions([])

      if (positions && positions.length > 0 && !!position) {
        setIsLoadingConditions(true)
        setIsLoadingMergeablePositions(true)

        const positionsWithBalance = positions.filter(
          (positionWithBalance: PositionWithUserBalanceWithDecimals) =>
            //#1 Filter, only positions with balance
            !positionWithBalance.userBalanceERC1155.isZero()
        )

        const conditionsOfSelectedPosition = position.conditions

        //#2 Filter, allow only mergeable positions
        const positionsMergeables = positionsWithBalance.filter((p) =>
          conditionsOfSelectedPosition.some((condition) =>
            arePositionMergeablesByCondition(
              [position, p],
              condition.conditionId,
              condition.outcomeSlotCount
            )
          )
        )

        const positionsFiltered = positionsMergeables.filter(
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
              position.collateralToken.toLowerCase()
        )

        const positionsPromises = positionsFiltered.map(async (positionFiltered) => {
          const { collateralToken, conditionIds, indexSets } = positionFiltered
          const balanceOfPositionId = await CTService.balanceOf(positionFiltered.id)
          const erc20Service = new ERC20Service(provider, collateralToken)
          const tokenPosition = await erc20Service.getProfileSummary()

          return {
            position: positionFiltered,
            positionPreview: positionString(
              conditionIds,
              indexSets,
              balanceOfPositionId,
              tokenPosition
            ),
          }
        })

        const possibleMergeablePositions: MergeablePosition[] = await Promise.all(positionsPromises)

        // Calculate condition Ids to fulfill the dropdown
        const conditionIds: string[] = possibleMergeablePositions.reduce(
          (acc: string[], cur: MergeablePosition) => acc.concat([...cur.position.conditionIds]),
          []
        )

        // Remove duplicates
        const possibleConditions = lodashUniq(conditionIds)

        setConditionIds(possibleConditions)
        setMergeablePositions(possibleMergeablePositions)
        setIsLoadingConditions(false)
        setIsLoadingMergeablePositions(false)
        setSelectedPositions([position])
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
            onClick: () => setTransactionStatus(Remote.notAsked<Maybe<boolean>>()),
            text: 'Close',
          }
        : transactionStatus.isSuccess()
        ? {
            buttonType: ButtonType.primary,
            onClick: () => setTransactionStatus(Remote.notAsked<Maybe<boolean>>()),
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
        clearFilters={clearFilters}
        onClearCallback={clearComponent}
        onRowClicked={onRowClicked}
        refetch={transactionStatus.isSuccess()}
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
          condition={condition}
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
          closeAction={() => {
            clearComponent()
            setClearFilters(!clearFilters)
          }}
          collateralToken={collateralToken}
          isOpen={transactionStatus.isSuccess()}
          mergeResult={mergeResult}
        ></MergeResultModal>
      )}
      <ButtonContainer>
        <Button disabled={disabled} onClick={onMerge}>
          Merge
        </Button>
      </ButtonContainer>
      <Prompt
        message={(params) =>
          params.pathname === '/merge'
            ? true
            : 'Are you sure you want to leave this page? The changes you made will be lost?'
        }
        when={selectedPositions.length > 0 || !amount.isZero() || !!conditionId}
      />
    </CenteredCard>
  )
}
