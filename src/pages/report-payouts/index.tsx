import React from 'react'

import { ConditionProvider } from '../../contexts/ConditionContext'
import { ReportPayouts } from './ReportPayouts'

export const ReportPayoutsContainer: React.FC = () => {
  return (
    <ConditionProvider>
      <ReportPayouts />
    </ConditionProvider>
  )
}
