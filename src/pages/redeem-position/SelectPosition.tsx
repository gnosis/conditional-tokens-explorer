import { positionSring } from 'util/tools'

import React from 'react'

import { usePositionContext } from '../../contexts/PositionContext'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'

import { WrapperDisplay } from './WrapperDisplay'

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
      // TODO: improve using the method "displayPositions(position, balance, networkConfig.networkId)"
      setPositionToDisplay(
        positionSring(
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
      <WrapperDisplay dataToDisplay={positionToDisplay} errors={errors} loading={loading} />
      <button onClick={selectPosition}>Select Position</button>
    </>
  )
}
