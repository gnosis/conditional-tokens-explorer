import { getLogger } from 'util/logger'

import { Button } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { StripedList, StripedListItem } from 'components/common/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { getTokenFromAddress } from 'config/networkConfig'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3Connected } from 'contexts/Web3Context'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { Row } from '../../components/pureStyledComponents/Row'

import { Amount } from './Amount'
import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'

const logger = getLogger('MergePosition')

export const Contents = () => {
  const {
    networkConfig: { networkId },
  } = useWeb3Connected()

  const { balances, positions } = useMultiPositionsContext()
  const arePositionMergeables = useMemo(() => {
    // all postions include same conditions set and collateral token
    const conditionIdsSet = positions.map((position) => [...position.conditionIds].sort().join(''))
    return (
      positions.length > 1 &&
      conditionIdsSet.every((set) => set === conditionIdsSet[0]) &&
      positions.every((position) => position.collateralToken.id === positions[0].collateralToken.id)
    )
  }, [positions])

  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()

  const isFullIndexSet = useMemo(() => {
    if (condition && arePositionMergeables) {
      // once condition is set, check that indexSets for condition on each position sum condition outcomeSlotCont full indexSet
      const fullIndexSet = condition
        ? parseInt(Array.from(new Array(condition.outcomeSlotCount), (_) => 1).join(''), 2)
        : 0
      const partitionIndexSet = positions.reduce((acc, position) => {
        const conditionIndex = position.conditionIds.findIndex((id) => condition.id)
        return acc + Number(position.indexSets[conditionIndex])
      }, 0)

      return fullIndexSet === partitionIndexSet
    }

    return false
  }, [positions, condition, arePositionMergeables])

  const collateralToken = useMemo(() => {
    if (positions.length && arePositionMergeables) {
      return getTokenFromAddress(networkId, positions[0].collateralToken.id)
    }
    return null
  }, [positions, networkId, arePositionMergeables])

  const disabled = useMemo(() => !isFullIndexSet, [isFullIndexSet])

  const [positionsToMerge, setPositions] = useState<Array<any>>([
    '[DAI C:0x123 O:0|1, C:0x345 O:0] x10',
    '[DAI C:0x123 O:0|1, C:0x345 O:1] x10',
  ])
  const [conditionId, setConditionId] = useState('0x345')
  const [mergedPosition, setMergedPosition] = useState('[DAI C:0x123 O:0|1] x10')

  return (
    <CenteredCard>
      <SelectPosition />
      <SelectCondition />
      <Amount balances={balances} collateralToken={collateralToken} isMergeable={isFullIndexSet} />
      <Row cols={'1fr'} marginBottomXL>
        <TitleValue
          title="Merged position preview"
          value={
            <StripedList>
              <StripedListItem>{mergedPosition}</StripedListItem>
            </StripedList>
          }
        />
      </Row>
      <ButtonWrapper>
        <Button disabled={disabled}>Merge</Button>
      </ButtonWrapper>
    </CenteredCard>
  )
}

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 80px;
`
