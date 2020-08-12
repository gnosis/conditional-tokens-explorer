import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import React from 'react'

import { Wrapper } from './Wrapper'

export const MergePositions = () => {
  return (
    <MultiPositionsProvider checkForEmptyBalance={true}>
      <ConditionProvider checkForConditionNotResolved={true}>
        <Wrapper />
      </ConditionProvider>
    </MultiPositionsProvider>
  )
}
