import { positionString } from 'util/tools'
import { Errors } from 'util/types'

import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TitleValue } from 'components/text/TitleValue'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import React from 'react'

interface Props {
  callbackToBeExecutedOnRemoveAction: () => void
}

export const SelectPositions = (props: Props) => {
  const { callbackToBeExecutedOnRemoveAction } = props
  const { networkConfig } = useWeb3ConnectedOrInfura()
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
    if (!loading && positions.length === balances.length && balances.length === positionIds.length && positions.length === positionIds.length) {
      setPositionsToDisplay(
        positions.map((position) => {
          const i = positionIds.findIndex((id) => id.toLowerCase() === position.id.toLowerCase())

          const token = networkConfig.getTokenFromAddress(position.collateralToken.id)

          return positionString(position.conditionIds, position.indexSets, balances[i], token)
        })
      )
    } else {
      setPositionsToDisplay([])
    }
  }, [balances, networkConfig, positions, loading, positionIds])

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
                    onClick={() => {
                      callbackToBeExecutedOnRemoveAction()
                      removePositionId(positions[index].id)
                    }}
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
