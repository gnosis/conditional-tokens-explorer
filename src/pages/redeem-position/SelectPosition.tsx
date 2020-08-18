import { positionString } from 'util/tools'

import React from 'react'

import { usePositionContext } from '../../contexts/PositionContext'
import { Web3ContextStatus, useWeb3Context } from '../../contexts/Web3Context'
import { useBalanceForPosition } from '../../hooks/useBalanceForPosition'

import { WrapperDisplay } from './WrapperDisplay'

interface Props {
  networkId: Maybe<number>
}

export const SelectPosition = (props: Props) => {
  const { connect, status } = useWeb3Context()

  const { networkId } = props
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
    if (position && networkId) {
      setPositionToDisplay(
        positionString(
          position.collateralToken.id,
          position.conditionIds,
          position.indexSets,
          balance,
          networkId
        )
      )
    } else {
      setPositionToDisplay('')
    }
  }, [balance, networkId, position])

  return (
    <>
      <label>Position</label>
      <WrapperDisplay dataToDisplay={positionToDisplay} errors={errors} loading={loading} />
      <button onClick={selectPosition}>Select Position</button>
    </>
  )
}
