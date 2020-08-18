import { positionString } from 'util/tools'

import { Row } from 'components/pureStyledComponents/Row'
import { StripedList, StripedListItem } from 'components/pureStyledComponents/StripedList'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { WrapperDisplay } from 'components/text/WrapperDisplay'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3Connected } from 'contexts/Web3Context'
import React from 'react'

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
    <Row cols={'1fr'} marginBottomXL>
      <TitleValue
        title="Positions"
        titleControl={<TitleControl onClick={selectPosition}>Select Positions</TitleControl>}
        value={
          <WrapperDisplay errors={errors} loading={loading}>
            {!!positionsToDisplay.length && (
              <StripedList>
                {positionsToDisplay.map((position: string, index: number) => (
                  <StripedListItem key={index}>
                    {position} <span onClick={() => removePositionId(positions[index].id)}>X</span>
                  </StripedListItem>
                ))}
              </StripedList>
            )}
          </WrapperDisplay>
        }
      />
    </Row>
  )
}
