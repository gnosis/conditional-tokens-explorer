import React from 'react'
import { useParams } from 'react-router-dom'

import { PositionProvider } from 'contexts/PositionContext'
import { Wrapper } from 'pages/PositionDetails/Wrapper'

export const PositionDetails = () => {
  const { positionId } = useParams()

  return (
    <PositionProvider>
      <Wrapper positionId={positionId} />
    </PositionProvider>
  )
}
