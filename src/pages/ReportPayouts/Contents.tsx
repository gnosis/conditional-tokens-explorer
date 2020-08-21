import React from 'react'

import { CenteredCard } from '../../components/common/CenteredCard'
import { Row } from '../../components/pureStyledComponents/Row'
import { StripedList, StripedListEmpty } from '../../components/pureStyledComponents/StripedList'
import { useConditionContext } from '../../contexts/ConditionContext'

import { InputCondition } from './InputCondition'
import { OutcomesTable } from './OutcomesTable'

export const Contents: React.FC = () => {
  const { condition, conditionId, errors, loading, setConditionId } = useConditionContext()
  const isConditionResolved = condition && condition.resolved

  const selectCondition = () => {
    const conditionIdFromPrompt = window.prompt(`Enter the condition: `)
    if (conditionIdFromPrompt) {
      setConditionId(conditionIdFromPrompt)
    }
  }

  return (
    <CenteredCard>
      <Row cols="1fr" marginBottomXL>
        <InputCondition
          conditionId={conditionId}
          errors={errors}
          isConditionResolved={isConditionResolved}
          loading={loading}
          onClick={selectCondition}
        />
      </Row>
      {condition && !isConditionResolved && <OutcomesTable condition={condition} />}
      {(!condition || isConditionResolved) && (
        <StripedList>
          <StripedListEmpty>Please select a condition to report.</StripedListEmpty>
        </StripedList>
      )}
    </CenteredCard>
  )
}
