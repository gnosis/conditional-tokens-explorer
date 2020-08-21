import React from 'react'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { ConditionProvider } from '../../contexts/ConditionContext'

import { Contents } from './Contents'

export const ReportPayoutsContainer: React.FC = () => {
  return (
    <ConditionProvider>
      <PageTitle>Report Payouts</PageTitle>
      <Contents />
    </ConditionProvider>
  )
}
