import React from 'react'

import { usePositionContext } from '../../contexts/PositionContext'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'
import { getLogger } from '../../util/logger'
import { displayPositions } from '../../util/tools'

import { WrapperDisplay } from './WrapperDisplay'

const logger = getLogger('SelectPosition')

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
      setPositionToDisplay(displayPositions(position, balance, networkConfig.networkId))
      logger.log(position)
    }
  }, [balance, networkConfig.networkId, position])

  return (
    <>
      <label>Position ID</label>
      <WrapperDisplay dataToDisplay={positionToDisplay} errors={errors} loading={loading} />
      <button onClick={selectPosition}>Select Position</button>
    </>
  )
}
