import React from 'react'
import { ethers } from 'ethers'

import { useConditionContext } from '../../contexts/ConditionContext'
import { usePositionContext } from '../../contexts/PositionContext'
import { getLogger } from '../../util/logger'

import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'
import { BigNumber, formatUnits } from 'ethers/utils'
import { Status } from '../../util/types'
import { useWeb3Connected } from '../../contexts/Web3Context'

const logger = getLogger('RedeemPosition')

export const RedeemPositionWrapper = () => {
  const { CTService, address } = useWeb3Connected()

  const { condition, errors: conditionErrors, clearCondition } = useConditionContext()
  const { position, errors: positionErrors, clearPosition } = usePositionContext()
  const [status, setStatus] = React.useState<Maybe<Status>>(null)

  const onRedeem = async () => {
    try {
      if(position && condition ) {
        setStatus(Status.Loading)

        const { collateralToken } = position

        await CTService.redeemPositions(collateralToken.id, ethers.constants.HashZero, condition.id, condition.outcomeSlotCount)

        clearCondition()
        clearPosition()

        setStatus(Status.Ready)
      }
    } catch (err) {
      setStatus(Status.Error)
      logger.error(err)
    }
  }

  const disabled = status === Status.Loading ||
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
