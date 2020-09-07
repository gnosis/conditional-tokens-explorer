import React from 'react'

import { BatchBalanceProvider } from 'contexts/BatchBalanceContext'
import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import { Contents } from 'pages/RedeemPosition/Contents'

export const RedeemPosition = () => {
  return (
    <MultiPositionsProvider>
      <BatchBalanceProvider checkForEmptyBalance={true}>
        <ConditionProvider checkForConditionNotResolved={true}>
          <Contents />
        </ConditionProvider>
      </BatchBalanceProvider>
    </MultiPositionsProvider>
  )
}
