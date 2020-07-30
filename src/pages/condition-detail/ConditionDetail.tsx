import React from 'react'

import { ConditionDetailItem } from './ConditionDetailItem'
import { useConditionContext } from '../../contexts/ConditionContext'
import { isConditionErrorInvalid, isConditionErrorNotFound } from '../../util/tools'
import { ConditionDetailNotFound } from './ConditionDetailNotFound'

interface ConditionDetailWrapperProps {
  conditionId: string
}

export const ConditionDetail = (props: ConditionDetailWrapperProps) => {
  const { conditionId } = props

  const { condition, errors, loading, setConditionId } = useConditionContext()

  React.useEffect(() => {
    setConditionId(conditionId)
  }, [conditionId, setConditionId])

  const error = isConditionErrorNotFound(errors) || isConditionErrorInvalid(errors)

  return (
    <>
      <h3>Condition detail</h3>

      {loading && <div>Loading...</div>}
      {error && !loading && <ConditionDetailNotFound />}
      {condition && (
        <ConditionDetailItem
          conditionId={conditionId}
          resolved={condition.resolved}
          oracle={condition.oracle}
          questionId={condition.questionId}
          outcomeSlotCount={condition.outcomeSlotCount}
          creator={condition.creator}
        />
      )}
    </>
  )
}
