import { BatchBalanceProvider } from 'contexts/BatchBalanceContext'
import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import React from 'react'

import { Contents } from './Contents'

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
