import { Button } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { SelectCondition } from 'components/form/SelectCondition'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { SelectPosition } from 'components/redeemPosition//SelectPosition'
import { PositionPreview } from 'components/redeemPosition/PositionPreview'
import { useConditionContext } from 'contexts/ConditionContext'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import { ConditionalTokensService } from 'services/conditionalTokens'

import { usePositionContext } from '../../contexts/PositionContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'
import { useIsPositionRelatedToCondition } from '../../hooks/useIsPositionRelatedToCondition'
import { getLogger } from '../../util/logger'
import { Status } from '../../util/types'

const logger = getLogger('RedeemPosition')

export const Contents = () => {
  const { _type: status, CTService, connect, networkConfig } = useWeb3ConnectedOrInfura()

  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()
  const { clearPosition, errors: positionErrors, position } = usePositionContext()
  const [statusTransaction, setStatusTransaction] = React.useState<Maybe<Status>>(null)

  const onRedeem = async () => {
    try {
      if (position && condition && status === Web3ContextStatus.Connected) {
        setStatusTransaction(Status.Loading)

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

        setStatusTransaction(Status.Ready)
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setStatusTransaction(Status.Error)
      logger.error(err)
    }
  }

  const { isRelated } = useIsPositionRelatedToCondition(position?.id || '', condition?.id || '')

  const disabled =
    statusTransaction === Status.Loading ||
    positionErrors.length > 0 ||
    conditionErrors.length > 0 ||
    !position ||
    !condition ||
    !isRelated

  return (
    <CenteredCard>
      <Row cols="1fr" marginBottomXL>
        <SelectPosition />
      </Row>
      <Row cols="1fr">
        <SelectCondition />
      </Row>
      {!isRelated && position && condition && <span>Position is not related to the condition</span>}
      <Row cols="1fr">
        <PositionPreview condition={condition} networkConfig={networkConfig} position={position} />
      </Row>
      <ButtonContainer>
        <Button disabled={disabled} onClick={onRedeem}>
          Redeem
        </Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
