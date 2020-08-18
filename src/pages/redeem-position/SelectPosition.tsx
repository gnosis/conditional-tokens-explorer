import { positionString } from 'util/tools'

import { WrapperDisplay } from 'components/text/WrapperDisplay'
import React from 'react'

import { usePositionContext } from '../../contexts/PositionContext'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'

export const SelectPosition = () => {
  const { networkConfig } = useWeb3Connected()
  const { errors, loading, position, positionId, setPositionId } = usePositionContext()
  const { balance } = useBalanceForPosition(positionId)

  const [positionToDisplay, setPositionToDisplay] = React.useState<string>('')

  const selectPosition = () => {
    const positionIdFromPrompt = window.prompt(`Enter the position: `)
    if (positionIdFromPrompt) {
      setPositionId(positionIdFromPrompt)
    }
  }

  React.useEffect(() => {
    if (position) {
      setPositionToDisplay(
        positionString(
          position.collateralToken.id,
          position.conditionIds,
          position.indexSets,
          balance,
          networkConfig.networkId
        )
      )
    } else {
      setPositionToDisplay('')
    }
  }, [balance, networkConfig.networkId, position])

  return (
    <>
      <label>Position</label>
      <WrapperDisplay errors={errors} loading={loading}>
        <p>{positionToDisplay}</p>
      </WrapperDisplay>
      <button onClick={selectPosition}>Select Position</button>
    </>
  )
}
