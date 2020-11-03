import React from 'react'

import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { BatchBalanceProvider } from 'contexts/BatchBalanceContext'
import { ConditionProvider } from 'contexts/ConditionContext'
import { MultiPositionsProvider } from 'contexts/MultiPositionsContext'
import { Contents } from 'pages/MergePositions/ContentsNew'

export const MergePositions = () => {
  return (
    <>
      <PageTitle>Merge Positions</PageTitle>
      <Contents />
    </>
  )
}
