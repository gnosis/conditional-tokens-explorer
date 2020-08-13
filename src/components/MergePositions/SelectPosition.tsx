import { positionString } from 'util/tools'

import { StripedList, StripedListItem } from 'components/common/StripedList'
import { Row } from 'components/pureStyledComponents/Row'
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

          console.log('balance', balances[i].toString())

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
            <StripedList>
              {positionsToDisplay.map((position: string, index: number) => (
                <StripedListItem key={index}>{position}</StripedListItem>
              ))}
            </StripedList>
          </WrapperDisplay>
        }
      />
    </Row>
  )
}
