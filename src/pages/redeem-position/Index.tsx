import React, { useState } from 'react'

import { Position } from './Position'
import { Condition } from './Condition'
import { RedeemedPosition } from './RedeemedPosition'

export const RedeemPosition = () => {
  const [position, setPosition] = useState<string>('')
  const [condition, setCondition] = useState<string>('')

  const [redeemedPosition, setRedeemedPosition] = useState<Maybe<string>>(null)

  const onRedeem = () => console.log('Redeem')

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
        <Condition condition={condition}/>
        <button onClick={selectCondition}>Select Condition</button>
      </div>

      <div className="row">
        <RedeemedPosition condition={condition} position={position}/>
      </div>

      <button onClick={onRedeem}>Redeem</button>
    </>
  )
}
