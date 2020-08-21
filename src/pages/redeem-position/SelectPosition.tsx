import { positionString } from 'util/tools'

import { WrapperDisplay } from 'components/text/WrapperDisplay'
import React from 'react'

import { usePositionContext } from '../../contexts/PositionContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'

export const SelectPosition = () => {
  const { _type: status, connect, networkConfig } = useWeb3ConnectedOrInfura()

  const { errors, loading, position, positionId, setPositionId } = usePositionContext()
  const { balance } = useBalanceForPosition(positionId)

  const [positionToDisplay, setPositionToDisplay] = React.useState<string>('')

  const selectPosition = () => {
    if (status === Web3ContextStatus.Connected) {
      const positionIdFromPrompt = window.prompt(`Enter the position: `)
      if (positionIdFromPrompt) {
        setPositionId(positionIdFromPrompt)
      }
    } else if (status === Web3ContextStatus.Infura) {
      connect()
    }
  }

  React.useEffect(() => {
    if (position) {
      const token = networkConfig.getTokenFromAddress(position.collateralToken.id)

      setPositionToDisplay(
        positionString(
          position.collateralToken.id,
          position.conditionIds,
          position.indexSets,
          balance,
          token
        )
      )
    } else {
      setPositionToDisplay('')
    }
  }, [balance, position, status, networkConfig])

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
