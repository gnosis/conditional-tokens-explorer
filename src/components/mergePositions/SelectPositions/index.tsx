import { positionString } from 'util/tools'
import { Errors } from 'util/types'

import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
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
import React from 'react'

export const SelectPositions = () => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const {
    errors: positionsErrors,
    loading: positionsLoading,
    positionIds,
    positions,
    removePositionId,
    updatePositionIds,
  } = useMultiPositionsContext()

  const {
    balances,
    errors: balancesErrors,
    loading: balancesLoading,
    updateBalaces,
  } = useBatchBalanceContext()

  console.log('balances', balances)

  const [positionsToDisplay, setPositionsToDisplay] = React.useState<Array<string>>([])

  // const selectPosition = () => {
  //   const positionIdFromPrompt = window.prompt(`Enter the position: `)
  //   if (positionIdFromPrompt) {
  //     addPositionId(positionIdFromPrompt)
  //   }
  // }

  const closeModal = React.useCallback(() => setIsModalOpen(false), [])
  const openModal = React.useCallback(() => setIsModalOpen(true), [])

  const onModalConfirm = React.useCallback(
    (positions: Array<Position>) => {
      const ids = positions.map((position) => position.id)
      updatePositionIds(ids)
      updateBalaces(ids)
      closeModal()
    },
    [closeModal, updateBalaces, updatePositionIds]
  )

  const onRemovePosition = React.useCallback(
    (positionId: string) => {
      const ids = positionIds.filter((id) => id !== positionId)
      updatePositionIds(ids)
      updateBalaces(ids)
    },
    [positionIds, updateBalaces, updatePositionIds]
  )

  React.useEffect(() => {
    if (positionIds.length > 0) {
      if (
        !positionsLoading &&
        !balancesLoading &&
        positions.length &&
        balances.length &&
        balances.length === positionIds.length &&
        positions.length === positionIds.length
      ) {
        setPositionsToDisplay(
          positions.map((position) => {
            const i = positionIds.findIndex((id) => id === position.id)

            const token = networkConfig.getTokenFromAddress(position.collateralToken.id)

            return positionString(position.conditionIds, position.indexSets, balances[i], token)
          })
        )
      }
    } else {
      setPositionsToDisplay([])
    }
  }, [balances, networkConfig, positions, positionsLoading, balancesLoading, positionIds])

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
        title="Positions"
        titleControl={<TitleControl onClick={openModal}>Select Positions</TitleControl>}
        value={
          <>
            <StripedList maxHeight="150px">
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
                  {isLoading && errors.length === 0 ? <InlineLoading /> : 'No positions.'}
                </StripedListEmpty>
              )}
            </StripedList>
            {errors && (
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
        />
      )}
    </>
  )
}
