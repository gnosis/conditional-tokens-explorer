import React from 'react'
import { useParams } from 'react-router-dom'

import { ConditionProvider } from 'contexts/ConditionContext'
import { Wrapper } from 'pages/ConditionDetails/Wrapper'

export const ConditionDetails = () => {
  const { conditionId } = useParams()

  return (
    <ConditionProvider>
      <Wrapper conditionId={conditionId} />
    </ConditionProvider>
  )
}
