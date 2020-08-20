import React from 'react'

import { Button } from '../../components/buttons/Button'
import { CenteredCard } from '../../components/common/CenteredCard'
import { ButtonContainer } from '../../components/pureStyledComponents/ButtonContainer'
import { Row } from '../../components/pureStyledComponents/Row'
import { useConditionContext } from '../../contexts/ConditionContext'

import { ConditionResolved } from './ConditionResolved'
import { InputCondition } from './InputCondition'
import { OutcomeSlotsToReport } from './OutcomeSlotsToReport'

export const Contents: React.FC = () => {
  const { condition, conditionId, errors, loading, setConditionId } = useConditionContext()

  const selectCondition = () => {
    const conditionIdFromPrompt = window.prompt(`Enter the condition: `)
    if (conditionIdFromPrompt) {
      setConditionId(conditionIdFromPrompt)
    }
  }

  return (
    <CenteredCard>
      <Row cols="1fr">
        <InputCondition
          conditionId={conditionId}
          errors={errors}
          loading={loading}
          onClick={selectCondition}
        />
      </Row>

      {condition && !condition.resolved && <OutcomeSlotsToReport condition={condition} />}
      {condition && condition.resolved && <ConditionResolved />}
      {!condition && <div>Please load a condition to report</div>}
      <ButtonContainer>
        <Button>Report</Button>
      </ButtonContainer>
    </CenteredCard>
  )
}
