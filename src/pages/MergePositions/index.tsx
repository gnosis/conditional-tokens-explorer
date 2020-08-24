import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import { Contents } from 'pages/MergePositions/Contents'
import React from 'react'

export const MergePositions = () => {
  return (
    <MultiPositionsProvider checkForEmptyBalance={true}>
      <ConditionProvider>
        <PageTitle>Merge Positions</PageTitle>
        <Contents />
      </ConditionProvider>
    </MultiPositionsProvider>
  )
}
