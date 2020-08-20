import { Contents } from 'components/MergePositions/Contents'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import React from 'react'

export const MergePositions = () => {
  return (
    <MultiPositionsProvider checkForEmptyBalance={true}>
      <ConditionProvider>
        <PageTitle>Merge Positions</PageTitle>
        {/* {loading && <InlineLoading />} */}
        <Contents />
      </ConditionProvider>
    </MultiPositionsProvider>
  )
}
