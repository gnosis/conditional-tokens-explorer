import React from 'react'
import { useParams } from 'react-router-dom'

import { PositionDetailWrapper } from './PositionDetailWrapper'
import { isBytes32String } from '../../util/tools'
import { PositionDetailNotFound } from './PositionDetailNotFound'

export const PositionDetailContainer = () => {
  const { positionId } = useParams()

  return isBytes32String(positionId) ? (
    <PositionDetailWrapper positionId={positionId} />
  ) : (
    <PositionDetailNotFound />
  )
}
