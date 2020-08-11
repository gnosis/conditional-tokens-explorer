import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'

import { useConditionContext } from '../../contexts/ConditionContext'
import { usePositionContext } from '../../contexts/PositionContext'
import { useWeb3Connected } from '../../contexts/Web3Context'
import { useIsPositionRelatedToCondition } from '../../hooks/useIsPositionRelatedToCondition'
import { getLogger } from '../../util/logger'
import { Status } from '../../util/types'

import { PositionPreview } from './PositionPreview'
import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'

const logger = getLogger('RedeemPosition')

export const RedeemPositionWrapper = () => {
  const { CTService, networkConfig } = useWeb3Connected()

  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()
  const { clearPosition, errors: positionErrors, position } = usePositionContext()
  const [status, setStatus] = React.useState<Maybe<Status>>(null)

  const onRedeem = async () => {
    try {
      if (position && condition) {
        setStatus(Status.Loading)

        const { collateralToken, conditionIds, indexSets } = position
        const newCollectionsSet = conditionIds.reduce(
          (acc, conditionId, i) =>
            conditionId !== condition.id
              ? [...acc, { conditionId, indexSet: new BigNumber(indexSets[i]) }]
              : acc,
          new Array<{ conditionId: string; indexSet: BigNumber }>()
        )
        const parentCollectionId = newCollectionsSet.length
          ? ConditionalTokensService.getConbinedCollectionId(newCollectionsSet)
          : ethers.constants.HashZero

        // This UI only allows to redeem 1 position although it's possible to redeem multiple position when you the user owns different positions with the same set of conditions and several indexSets for the resolved condition.
        // i.e.
        // - DAI C:0x123 0:0b01 && C:0x345 O:0b01
        // - DAI C:0x123 0:0b01 && C:0x345 O:0b10
        // 0x345 is the resolved condition
        // a could call redeeemPositions(DAI, parentCollectionId, 0x345, [1,2])

        // It shouldn't be able to call onRedeem if resolved condition id were not included in conditionsIds, so no -1 for findIndex.
        const redeemedIndexSet = [
          indexSets[conditionIds.findIndex((conditionId) => conditionId === condition.id)],
        ]

        await CTService.redeemPositions(
          collateralToken.id,
          parentCollectionId,
          condition.id,
          redeemedIndexSet
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

      <div className="row">
        <PositionPreview
          condition={condition}
          networkId={networkConfig.networkId}
          position={position}
        />
      </div>
      <button disabled={disabled} onClick={onRedeem}>
        Redeem
      </button>
    </>
  )
}
