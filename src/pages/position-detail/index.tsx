import React from 'react'
import { useParams } from 'react-router-dom'

import { isBytes32String } from '../../util/tools'

import { PositionDetailNotFound } from './PositionDetailNotFound'
import { PositionDetailWrapper } from './PositionDetailWrapper'

export const PositionDetailContainer = () => {
  const { positionId } = useParams()

  return isBytes32String(positionId) ? (
    <PositionDetailWrapper positionId={positionId} />
  ) : (
    <PositionDetailNotFound />
  )
}
