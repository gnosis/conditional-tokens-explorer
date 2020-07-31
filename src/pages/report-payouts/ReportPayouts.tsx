import React from 'react'

import { useConditionContext } from '../../contexts/ConditionContext'
import { Condition } from './Condition'
import { OutcomeSlotsToReport } from './OutcomeSlotsToReport'
import { ConditionResolved } from './ConditionResolved'

export const ReportPayouts: React.FC = () => {
  const { condition, conditionId, errors, loading, setConditionId } = useConditionContext()

  const selectCondition = () => {
    const conditionIdFromPrompt = window.prompt(`Enter the condition: `)
    if (conditionIdFromPrompt) {
      setConditionId(conditionIdFromPrompt)
    }
  }

  return (
    <>
      <label htmlFor="position">Condition ID </label>
      <Condition conditionId={conditionId} errors={errors} loading={loading} />
      <button onClick={selectCondition}>Select Condition</button>
      {condition && !condition.resolved && <OutcomeSlotsToReport condition={condition} />}
      {condition && condition.resolved && <ConditionResolved />}
      {!condition && <div>Please load a condition to report</div>}
    </>
  )
}
