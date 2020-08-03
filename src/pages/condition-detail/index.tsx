import React from 'react'
import { useParams } from 'react-router-dom'

import { isConditionIdValid } from '../../util/tools'

import { ConditionDetailNotFound } from './ConditionDetailNotFound'
import { ConditionDetailWrapper } from './ConditionDetailWrapper'

export const ConditionsDetailContainer = () => {
  const { conditionId } = useParams()

  const ConditionDetail = isConditionIdValid(conditionId) ? (
    <ConditionDetailWrapper conditionId={conditionId} />
  ) : (
    <ConditionDetailNotFound />
  )

  return ConditionDetail
}
