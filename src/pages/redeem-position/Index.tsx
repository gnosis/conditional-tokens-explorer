import React, { useState } from 'react'

import { getLogger } from '../../util/logger'

import { Condition } from './Condition'
import { Position } from './Position'
import { RedeemedPosition } from './RedeemedPosition'

const logger = getLogger('RedeemPosition')

export const RedeemPosition = () => {
  const [position, setPosition] = useState<string>('')
  const [condition, setCondition] = useState<string>('')

  const onRedeem = () => logger.log('On redeem')

  const selectPosition = () => {
    const positionFromPrompt = window.prompt(`Enter the position: `)
    if (positionFromPrompt) {
      setPosition(positionFromPrompt)
    }
  }

  const selectCondition = () => {
    const conditionFromPrompt = window.prompt(`Enter the condition: `)
    if (conditionFromPrompt) {
      setCondition(conditionFromPrompt)
    }
  }

  return (
    <>
      <div className="row">
        <label htmlFor="position">Position: </label>
        <Position position={position} />
        <button onClick={selectPosition}>Select Position</button>
      </div>

      <div className="row">
        <label htmlFor="condition">Resolved condition ID: </label>
        <Condition condition={condition} />
        <button onClick={selectCondition}>Select Condition</button>
      </div>

      <div className="row">
        <RedeemedPosition condition={condition} position={position} />
      </div>

      <button onClick={onRedeem}>Redeem</button>
    </>
  )
}
