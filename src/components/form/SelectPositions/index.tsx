import { BigNumber } from 'ethers/utils'
import React, { useEffect } from 'react'

import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { TextfieldFetchableData } from 'components/form/TextfieldFetchableData'
import { SelectPositionModal } from 'components/modals/SelectPositionsModal'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TitleValue } from 'components/text/TitleValue'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position } from 'hooks'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { useWithToken } from 'hooks/useWithToken'
import { GetMultiPositions_positions } from 'types/generatedGQL'
import { positionString } from 'util/tools'
import { Errors } from 'util/types'

interface Props {
  title: string
  singlePosition?: boolean
  showOnlyPositionsWithBalance?: boolean
  callbackToBeExecutedOnRemoveAction?: () => void
}

const isDataInSync = (
  positionsLoading: boolean,
  balancesLoading: boolean,
  positions: GetMultiPositions_positions[],
  balances: BigNumber[]
) => {
  return (
    !positionsLoading &&
    !balancesLoading &&
    positions.length &&
    balances.length &&
    balances.length === positions.length
  )
}

export const SelectPositions = ({
  callbackToBeExecutedOnRemoveAction,
  showOnlyPositionsWithBalance,
  singlePosition,
  title,
}: Props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const {
    errors: positionsErrors,
    loading: positionsLoading,
    positionIds,
    positions,
    updatePositionIds,
  } = useMultiPositionsContext()
  const positionsWithToken = useWithToken(positions)

  const {
    balances,
    errors: balancesErrors,
    loading: balancesLoading,
    updateBalances,
  } = useBatchBalanceContext()

  const { getValue } = useLocalStorage('positionid')

  useEffect(() => {
    const localStoragePosition = getValue()
    if (localStoragePosition) {
      updatePositionIds([localStoragePosition])
      updateBalances([localStoragePosition])
    }
  }, [getValue, updatePositionIds, updateBalances])

  const [positionsToDisplay, setPositionsToDisplay] = React.useState<Array<string>>([])

  const closeModal = React.useCallback(() => setIsModalOpen(false), [])
  const openModal = React.useCallback(() => setIsModalOpen(true), [])

  const onModalConfirm = React.useCallback(
    (positions: Array<Position>) => {
      const ids = positions.map((position) => position.id)
      updatePositionIds(ids)
      updateBalances(ids)
      closeModal()
    },
    [closeModal, updateBalances, updatePositionIds]
  )

  const onRemovePosition = React.useCallback(
    (positionId: string) => {
      if (
        callbackToBeExecutedOnRemoveAction &&
        typeof callbackToBeExecutedOnRemoveAction === 'function'
      ) {
        callbackToBeExecutedOnRemoveAction()
      }
      const ids = positionIds.filter((id) => id !== positionId)
      updatePositionIds(ids)
      updateBalances(ids)
    },
    [positionIds, updateBalances, updatePositionIds, callbackToBeExecutedOnRemoveAction]
  )

  React.useEffect(() => {
    if (positionIds.length > 0) {
      if (isDataInSync(positionsLoading, balancesLoading, positions, balances)) {
        setPositionsToDisplay(
          positionsWithToken.map((position) => {
            const i = positionIds.findIndex((id) => id === position.id)

            return positionString(
              position.conditionIds,
              position.indexSets,
              balances[i],
              position.token
            )
          })
        )
      }
    } else {
      setPositionsToDisplay([])
    }
  }, [
    balances,
    networkConfig,
    positions,
    positionsLoading,
    balancesLoading,
    positionIds,
    positionsWithToken,
  ])

  const isLoading = React.useMemo(() => {
    return (
      positionsLoading ||
      balancesLoading ||
      (positionsToDisplay.length === 0 && positionIds.length !== 0)
    )
  }, [positionsLoading, balancesLoading, positionsToDisplay, positionIds])

  const errors = React.useMemo(() => [...positionsErrors, ...balancesErrors], [
    positionsErrors,
    balancesErrors,
  ])

  return (
    <>
      <TitleValue
        title={title}
        titleControl={
          <TitleControl onClick={openModal}>
            {singlePosition ? 'Select Position' : 'Select Positions'}
          </TitleControl>
        }
        value={
          <>
            {singlePosition ? (
              <TextfieldFetchableData
                disabled={true}
                error={!!errors.length}
                isFetching={isLoading || balancesLoading}
                placeholder={'Please select a position...'}
                type="text"
                value={positionsToDisplay.length ? positionsToDisplay[0] : ''}
              />
            ) : (
              <StripedList maxHeight="300px" minHeight="90px">
                {positionsToDisplay.length ? (
                  positionsToDisplay.map((position: string, index: number) => (
                    <StripedListItem key={index}>
                      <span>{position}</span>
                      <ButtonControl
                        buttonType={ButtonControlType.delete}
                        onClick={() => onRemovePosition(positions[index].id)}
                      />
                    </StripedListItem>
                  ))
                ) : (
                  <StripedListEmpty>
                    {isLoading && errors.length === 0 ? (
                      <InlineLoading height="30px" width="30px" />
                    ) : (
                      'No positions.'
                    )}
                  </StripedListEmpty>
                )}
              </StripedList>
            )}
            {!!errors && (
              <ErrorContainer>
                {errors.map((error: Errors, index: number) => (
                  <Error key={index}>{error}</Error>
                ))}
              </ErrorContainer>
            )}
          </>
        }
      />
      {isModalOpen && (
        <SelectPositionModal
          isOpen={isModalOpen}
          onConfirm={onModalConfirm}
          onRequestClose={closeModal}
          preSelectedPositions={positionIds}
          showOnlyPositionsWithBalance={showOnlyPositionsWithBalance}
          singlePosition={singlePosition}
        />
      )}
    </>
  )
}
