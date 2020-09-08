import React, { useMemo } from 'react'

import { CenteredCard } from 'components/common/CenteredCard'
import { SelectCondition } from 'components/form/SelectCondition'
import { Row } from 'components/pureStyledComponents/Row'
import { StripedList, StripedListEmpty } from 'components/pureStyledComponents/StripedList'
import { useConditionContext } from 'contexts/ConditionContext'
import { OutcomesTable } from 'pages/ReportPayouts/OutcomesTable'

export const Contents: React.FC = () => {
  const { condition } = useConditionContext()
  const isConditionResolved = useMemo(() => condition && condition.resolved, [condition])

  return (
    <CenteredCard>
      <Row cols="1fr" marginBottomXL>
        <SelectCondition />
      </Row>
      {condition && !isConditionResolved && <OutcomesTable condition={condition} />}
      {(!condition || isConditionResolved) && (
        <StripedList minHeight="120px">
          <StripedListEmpty>
            {!condition
              ? 'Please select a condition to report.'
              : 'The condition is already resolved.'}
          </StripedListEmpty>
        </StripedList>
      )}
    </CenteredCard>
  )
}
