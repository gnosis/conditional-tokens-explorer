import { getLogger } from 'util/logger'

import { Button, ButtonLink } from 'components/buttons'
import { CenteredCard } from 'components/common/CenteredCard'
import { StripedList, StripedListItem } from 'components/common/StripedList'
import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { GridTwoColumns } from 'components/pureStyledComponents/GridTwoColumns'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { SelectCondition } from './SelectCondition'
import { SelectPosition } from './SelectPosition'

const logger = getLogger('MergePosition')

export const Contents = () => {
  const { positions } = useMultiPositionsContext()
  const arePositionMergeables = useMemo(() => {
    // all postions include same conditions set
    const conditionIdsSet = positions.map((position) => [...position.conditionIds].sort().join(''))
    return positions.length > 1 && conditionIdsSet.every((set) => set === conditionIdsSet[0])

    // once condition is set, check in indexSets for condition on each position sum condition outcomeSlotCont full indexSet
  }, [positions])

  const { clearCondition, condition, errors: conditionErrors } = useConditionContext()
  const isFullIndexSet = useMemo(() => {
    if (condition && arePositionMergeables) {
      // once condition is set, check in indexSets for condition on each position sum condition outcomeSlotCont full indexSet
      const fullIndexSet = condition
        ? parseInt(Array.from(new Array(condition.outcomeSlotCount), (_) => 1).join(''), 2)
        : 0
      const partitionIndexSet = positions.reduce((acc, position) => {
        const conditionIndex = position.conditionIds.findIndex((id) => condition.id)
        return acc + Number(position.indexSets[conditionIndex])
      }, 0)

      console.log('isFullIndexSet', fullIndexSet, partitionIndexSet)
      return fullIndexSet === partitionIndexSet
    }

    return false
  }, [positions, condition, arePositionMergeables])

  console.log('isFullIndexSet', isFullIndexSet)

  const disabled = useMemo(() => !isFullIndexSet, [isFullIndexSet])

  const [positionsToMerge, setPositions] = useState<Array<any>>([
    '[DAI C:0x123 O:0|1, C:0x345 O:0] x10',
    '[DAI C:0x123 O:0|1, C:0x345 O:1] x10',
  ])
  const [conditionId, setConditionId] = useState('0x345')
  const [mergedPosition, setMergedPosition] = useState('[DAI C:0x123 O:0|1] x10')

  return (
    <CenteredCard>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <SelectPosition />
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <SelectCondition />
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title={
            <TitleWrapper>
              <span>Amount</span>
              <ButtonLink>Use Wallet Balance</ButtonLink>
            </TitleWrapper>
          }
          value={<BigNumberInputWrapper />}
        />
      </GridTwoColumns>
      <GridTwoColumns forceOneColumn marginBottomXL>
        <TitleValue
          title="Merged position preview"
          value={
            <StripedList>
              <StripedListItem>{mergedPosition}</StripedListItem>
            </StripedList>
          }
        />
      </GridTwoColumns>
      <ButtonWrapper>
        <Button disabled={disabled}>Merge</Button>
      </ButtonWrapper>
    </CenteredCard>
  )
}

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 80px;
`
