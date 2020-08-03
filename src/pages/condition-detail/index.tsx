import React from 'react'
import { useParams } from 'react-router-dom'

import { ConditionDetail } from './ConditionDetail'
import { ConditionProvider } from '../../contexts/ConditionContext'

export const ConditionsDetailContainer = () => {
  const { conditionId } = useParams()

  return (
    <ConditionProvider>
      <ConditionDetail conditionId={conditionId} />
    </ConditionProvider>
  )
}
