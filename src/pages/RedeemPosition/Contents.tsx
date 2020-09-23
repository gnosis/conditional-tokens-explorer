import { ethers } from 'ethers'
import { BigNumber } from 'ethers/utils'
import React, { useCallback } from 'react'

import { Button } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { SelectCondition } from 'components/form/SelectCondition'
import { SelectPositions } from 'components/form/SelectPositions'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Row } from 'components/pureStyledComponents/Row'
import { PositionPreview } from 'components/redeemPosition/PositionPreview'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useIsPositionRelatedToCondition } from 'hooks/useIsPositionRelatedToCondition'
import { ConditionalTokensService } from 'services/conditionalTokens'
import { getLogger } from 'util/logger'
import { Status } from 'util/types'

const logger = getLogger('RedeemPosition')

export const Contents = () => {
  const { _type: status, CTService, connect, networkConfig } = useWeb3ConnectedOrInfura()
  const { clearPositions, errors: positionsErrors, positions } = useMultiPositionsContext()

  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()
  const [statusTransaction, setStatusTransaction] = React.useState<Maybe<Status>>(null)
  const [error, setError] = React.useState<Maybe<Error>>(null)

  const onRedeem = useCallback(async () => {
    try {
      if (positions.length && condition && status === Web3ContextStatus.Connected) {
        setStatusTransaction(Status.Loading)

        const { collateralToken, conditionIds, indexSets } = positions[0]
        const newCollectionsSet = conditionIds.reduce(
          (acc, conditionId, i) =>
            conditionId !== condition.id
              ? [...acc, { conditionId, indexSet: new BigNumber(indexSets[i]) }]
              : acc,
          new Array<{ conditionId: string; indexSet: BigNumber }>()
        )
        const parentCollectionId = newCollectionsSet.length
          ? ConditionalTokensService.getCombinedCollectionId(newCollectionsSet)
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
        clearPositions()
        setError(null)

        setStatusTransaction(Status.Ready)
      } else if (status === Web3ContextStatus.Infura) {
        connect()
      }
    } catch (err) {
      setStatusTransaction(Status.Error)
      setError(err)
      logger.error(err)
    }
  }, [positions, condition, status, CTService, clearCondition, clearPositions, connect])

  const { isRelated } = useIsPositionRelatedToCondition(
    positions.length ? positions[0].id : '',
    condition?.id || ''
  )

  const disabled =
    statusTransaction === Status.Loading ||
    positionsErrors.length > 0 ||
    conditionErrors.length > 0 ||
    !positions.length ||
    !condition ||
    !isRelated

  const nonRelatedPositionAndCondition = !isRelated && !!positions.length && condition

  return (
    <CenteredCard>
      <Row cols="1fr">
        <SelectPositions showOnlyPositionsWithBalance singlePosition title="Position" />
      </Row>
      <Row cols="1fr">
        <SelectCondition title="Resolved Condition Id" />
      </Row>
      <Row cols="1fr">
        <PositionPreview
          condition={condition}
          networkConfig={networkConfig}
          position={positions.length ? positions[0] : null}
        />
      </Row>
      {nonRelatedPositionAndCondition && (
        <ErrorContainer>
          <Error>Position is not related to the condition.</Error>
        </ErrorContainer>
      )}
      {(statusTransaction === Status.Loading || statusTransaction === Status.Error) && (
        <FullLoading
          actionButton={
            statusTransaction === Status.Error
              ? { text: 'OK', onClick: () => setStatusTransaction(null) }
              : undefined
          }
          icon={statusTransaction === Status.Error ? IconTypes.error : IconTypes.spinner}
          message={statusTransaction === Status.Error ? error?.message : 'Waiting...'}
          title={statusTransaction === Status.Error ? 'Error' : 'Redeem Positions'}
        />
      )}
      {statusTransaction === Status.Ready && (
        <FullLoading
          actionButton={
            statusTransaction === Status.Ready
              ? { text: 'OK', onClick: () => setStatusTransaction(null) }
              : undefined
          }
          icon={IconTypes.ok}
          message={'Redeem Finished'}
          title={'Redeem Position'}
        />
      )}
      <ButtonContainer>
        <Button disabled={disabled} onClick={onRedeem}>
          Redeem
        </Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
