import React from 'react'

import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { BatchBalanceProvider } from 'contexts/BatchBalanceContext'
import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import { Contents } from 'pages/RedeemPosition/Contents'

export const RedeemPosition = () => {
  return (
    <MultiPositionsProvider>
      <BatchBalanceProvider checkForEmptyBalance={true}>
        <ConditionProvider checkForConditionNotResolved={true}>
          <PageTitle>Redeem Positions</PageTitle>
          <Contents />
        </ConditionProvider>
      </BatchBalanceProvider>
    </MultiPositionsProvider>
  )
}
