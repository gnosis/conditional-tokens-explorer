import { SelectPositionModal } from 'components/modals/SelectPositionsModal'
import React from 'react'

import { useMultiPositionsContext } from '../../../contexts/MultiPositionsContext'
import { useWeb3ConnectedOrInfura } from '../../../contexts/Web3Context'
import { positionString } from '../../../util/tools'
import { Errors } from '../../../util/types'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { Error, ErrorContainer } from '../../pureStyledComponents/Error'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from '../../pureStyledComponents/StripedList'
import { TitleControl } from '../../pureStyledComponents/TitleControl'
import { InlineLoading } from '../../statusInfo/InlineLoading'
import { TitleValue } from '../../text/TitleValue'

export const SelectPosition = () => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const {
    addPositionId,
    balances,
    errors,
    loading,
    positionIds,
    positions,
    removePositionId,
  } = useMultiPositionsContext()

  const [positionsToDisplay, setPositionsToDisplay] = React.useState<Array<string>>([])

  const selectPosition = () => {
    const positionIdFromPrompt = window.prompt(`Enter the position: `)
    if (positionIdFromPrompt) {
      addPositionId(positionIdFromPrompt)
    }
  }

  const closeModal = React.useCallback(() => setIsModalOpen(false), [])
  const openModal = React.useCallback(() => setIsModalOpen(true), [])

  React.useEffect(() => {
    if (!loading && positions.length && balances.length && positionIds.length > 0) {
      setPositionsToDisplay(
        positions.map((position) => {
          const i = positionIds.findIndex((id) => id === position.id)

          const token = networkConfig.getTokenFromAddress(position.collateralToken.id)

          return positionString(position.conditionIds, position.indexSets, balances[i], token)
        })
      )
    } else {
      setPositionsToDisplay([])
    }
  }, [balances, networkConfig, positions, loading, positionIds])

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
                      onClick={() => removePositionId(positions[index].id)}
                    />
                  </StripedListItem>
                ))
              ) : (
                <StripedListEmpty>
                  {loading && errors.length === 0 ? <InlineLoading /> : 'No positions.'}
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
      <SelectPositionModal
        isOpen={isModalOpen}
        onConfirm={closeModal}
        onRequestClose={closeModal}
      />
    </>
  )
}
