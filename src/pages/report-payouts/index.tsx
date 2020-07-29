import React from 'react'

import { ConditionProvider } from './Condition.context'
import { ReportPayouts } from './ReportPayouts'

export const ReportPayoutsContainer: React.FC = () => {
  return (
    <ConditionProvider>
      <ReportPayouts />
    </ConditionProvider>
  )
}
