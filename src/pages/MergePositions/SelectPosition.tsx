import { positionString } from 'util/tools'

import { ButtonLink } from 'components/buttons'
import { StripedList, StripedListItem } from 'components/common/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { WrapperDisplay } from 'components/text/WrapperDisplay'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3Connected } from 'contexts/Web3Context'
import React from 'react'
import styled from 'styled-components'

export const SelectPosition = () => {
  const { networkConfig } = useWeb3Connected()
  const {
    addPositionId,
    balances,
    clearPositions,
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
    if (!loading && positions.length && balances.length) {
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
      title={
        <TitleWrapper>
          <span>Positions</span>
          <ButtonLink onClick={selectPosition}>Select Positions</ButtonLink>
        </TitleWrapper>
      }
      value={
        <WrapperDisplay errors={errors} loading={loading}>
          <StripedList>
            {positionsToDisplay.map((position: string, index: number) => (
              <StripedListItem key={index}>{position}</StripedListItem>
            ))}
          </StripedList>
        </WrapperDisplay>
      }
    />
  )
}

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`
