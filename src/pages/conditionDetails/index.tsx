import React from 'react'
import { useParams } from 'react-router-dom'

import { InfoCard } from '../../components/common/InfoCard'
import { isConditionIdValid } from '../../util/tools'

import { Wrapper } from './Wrapper'

export const ConditionDetails = () => {
  const { conditionId } = useParams()

  return isConditionIdValid(conditionId) ? (
    <Wrapper conditionId={conditionId} />
  ) : (
    <InfoCard message="We couldn't find this condition..." title="Not Found" />
  )
}
