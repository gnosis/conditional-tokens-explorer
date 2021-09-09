import React from 'react'

import { PageTitle } from 'components/text/PageTitle'
import { Contents } from 'pages/ReportPayouts/Contents'

export const ReportPayoutsContainer: React.FC = () => {
  return (
    <>
      <PageTitle>Report Payouts</PageTitle>
      <Contents />
    </>
  )
}
