import React from 'react'

import { useMultiPositionsContext } from '../../../contexts/MultiPositionsContext'
import { useWeb3Connected } from '../../../contexts/Web3Context'
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
  const { networkConfig } = useWeb3Connected()
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

  React.useEffect(() => {
    if (!loading && positions.length && balances.length && positionIds.length) {
      setPositionsToDisplay(
        positions.map((position) => {
          const i = positionIds.findIndex((id) => id === position.id)

          return positionString(
            position.collateralToken.id,
            position.conditionIds,
            position.indexSets,
            balances[i],
            networkConfig.networkId
          )
        })
      )
    } else {
      setPositionsToDisplay([])
    }
  }, [balances, networkConfig.networkId, positions, loading, positionIds])

  return (
    <TitleValue
      title="Positions"
      titleControl={<TitleControl onClick={selectPosition}>Select Positions</TitleControl>}
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
  )
}
