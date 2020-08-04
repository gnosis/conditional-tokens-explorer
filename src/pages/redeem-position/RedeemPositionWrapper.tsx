import React from 'react'

import { useConditionContext } from '../../contexts/ConditionContext'
import { usePositionContext } from '../../contexts/PositionContext'
import { getLogger } from '../../util/logger'

import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'

const logger = getLogger('RedeemPosition')

export const RedeemPositionWrapper = () => {
  const { condition, errors: conditionErrors } = useConditionContext()
  const { errors: positionErrors, position } = usePositionContext()

  const onRedeem = () => logger.log('On redeem')

  const disabled =
    positionErrors.length > 0 || conditionErrors.length > 0 || !position || !condition

  return (
    <>
      <div className="row">
        <SelectPosition />
      </div>

      <div className="row">
        <SelectCondition />
      </div>

      <button disabled={disabled} onClick={onRedeem}>
        Redeem
      </button>
    </>
  )
}
