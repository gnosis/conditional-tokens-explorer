import { SelectCondition } from 'components/form/SelectCondition'
import React, { useMemo } from 'react'

import { CenteredCard } from '../../components/common/CenteredCard'
import { Row } from '../../components/pureStyledComponents/Row'
import { StripedList, StripedListEmpty } from '../../components/pureStyledComponents/StripedList'
import { useConditionContext } from '../../contexts/ConditionContext'

import { OutcomesTable } from './OutcomesTable'

export const Contents: React.FC = () => {
  const { condition } = useConditionContext()
  const isConditionResolved = useMemo(() => condition && condition.resolved, [condition])

  return (
    <CenteredCard>
      <Row cols="1fr" marginBottomXL>
        <SelectCondition />
      </Row>
      {condition && !isConditionResolved && <OutcomesTable condition={condition} />}
      {!condition && (
        <StripedList>
          <StripedListEmpty>Please select a condition to report.</StripedListEmpty>
        </StripedList>
      )}
      {isConditionResolved && (
        <StripedList>
          <StripedListEmpty>The condition is already resolved.</StripedListEmpty>
        </StripedList>
      )}
    </CenteredCard>
  )
}
