import React from 'react'

import { ConditionProvider } from '../../contexts/ConditionContext'
import { PositionProvider } from '../../contexts/PositionContext'

import { RedeemPositionWrapper } from './RedeemPositionWrapper'

export const RedeemPositionContainer = () => {
  return (
    <PositionProvider checkForEmptyBalance={true}>
      <ConditionProvider checkForConditionNotResolved={true}>
        <RedeemPositionWrapper />
      </ConditionProvider>
    </PositionProvider>
  )
}
