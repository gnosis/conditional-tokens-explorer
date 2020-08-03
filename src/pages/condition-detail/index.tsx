import React from 'react'
import { useParams } from 'react-router-dom'

import { ConditionProvider } from '../../contexts/ConditionContext'

import { ConditionDetail } from './ConditionDetail'

export const ConditionsDetailContainer = () => {
  const { conditionId } = useParams()

  return (
    <ConditionProvider>
      <ConditionDetail conditionId={conditionId} />
    </ConditionProvider>
  )
}
