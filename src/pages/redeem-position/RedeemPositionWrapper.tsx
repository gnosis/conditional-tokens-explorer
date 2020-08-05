import { ethers } from 'ethers'
import React from 'react'

import { useConditionContext } from '../../contexts/ConditionContext'
import { usePositionContext } from '../../contexts/PositionContext'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { useIsPositionRelatedToCondition } from '../../hooks/useIsPositionRelatedToCondition'
import { getLogger } from '../../util/logger'
import { Status } from '../../util/types'

import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'

const logger = getLogger('RedeemPosition')

export const RedeemPositionWrapper = () => {
  const { CTService } = useWeb3Connected()

  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()
  const { clearPosition, errors: positionErrors, position } = usePositionContext()
  const [status, setStatus] = React.useState<Maybe<Status>>(null)

  const onRedeem = async () => {
    try {
      if (position && condition) {
        setStatus(Status.Loading)

        const { collateralToken } = position

        await CTService.redeemPositions(
          collateralToken.id,
          ethers.constants.HashZero,
          condition.id,
          condition.outcomeSlotCount
        )

        clearCondition()
        clearPosition()

        setStatus(Status.Ready)
      }
    } catch (err) {
      setStatus(Status.Error)
      logger.error(err)
    }
  }

  const { isRelated } = useIsPositionRelatedToCondition(position?.id || '', condition?.id || '')

  const disabled =
    status === Status.Loading ||
    positionErrors.length > 0 ||
    conditionErrors.length > 0 ||
    !position ||
    !condition ||
    !isRelated

  return (
    <>
      <div className="row">
        <SelectPosition />
      </div>

      <div className="row">
        <SelectCondition />
      </div>

      {!isRelated && position && condition && <span>Position is not related to the condition</span>}

      <button disabled={disabled} onClick={onRedeem}>
        Redeem
      </button>
    </>
  )
}
