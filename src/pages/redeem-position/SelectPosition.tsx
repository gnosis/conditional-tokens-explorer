import { positionString } from 'util/tools'

import { WrapperDisplay } from 'components/text/WrapperDisplay'
import React from 'react'

import { usePositionContext } from '../../contexts/PositionContext'
import { Web3ContextStatus, useWeb3Context } from '../../contexts/Web3Context'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'

export const SelectPosition = () => {
  const { connect, status } = useWeb3Context()

  const { errors, loading, position, positionId, setPositionId } = usePositionContext()
  const { balance } = useBalanceForPosition(positionId)

  const [positionToDisplay, setPositionToDisplay] = React.useState<string>('')

  const selectPosition = () => {
    if (status._type === Web3ContextStatus.Connected) {
      const positionIdFromPrompt = window.prompt(`Enter the position: `)
      if (positionIdFromPrompt) {
        setPositionId(positionIdFromPrompt)
      }
    } else if (status._type === Web3ContextStatus.Infura) {
      connect()
    }
  }

  React.useEffect(() => {
    if (
      (status._type === Web3ContextStatus.Connected || status._type === Web3ContextStatus.Infura) &&
      position
    ) {
      const { networkConfig } = status
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
  }, [balance, position, status])

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
