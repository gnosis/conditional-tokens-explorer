import React from 'react'

import { usePositionContext } from '../../contexts/PositionContext'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'

import { WrapperDisplay } from './WrapperDisplay'

export const SelectPosition = () => {
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
      setPositionToDisplay(position.id)
    } else {
      setPositionToDisplay('')
    }
  }, [balance, position])

  return (
    <>
      <label>Position</label>
      <WrapperDisplay dataToDisplay={positionToDisplay} errors={errors} loading={loading} />
      <button onClick={selectPosition}>Select Position</button>
    </>
  )
}
