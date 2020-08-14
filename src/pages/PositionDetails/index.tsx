import React from 'react'
import { useParams } from 'react-router-dom'

import { PositionProvider } from '../../contexts/PositionContext'

import { Wrapper } from './Wrapper'

export const PositionDetails = () => {
  const { positionId } = useParams()

  return (
    <PositionProvider>
      <Wrapper positionId={positionId} />
    </PositionProvider>
  )
  {
    /*<InfoCard message="We couldn't find this position..." title="Not Found" />*/
  }
}
