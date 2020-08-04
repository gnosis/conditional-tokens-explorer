import React from 'react'
import { useParams } from 'react-router-dom'

import { InfoCard } from '../../components/common/InfoCard'
import { isBytes32String } from '../../util/tools'

import { Wrapper } from './Wrapper'

export const PositionDetail = () => {
  const { positionId } = useParams()

  return isBytes32String(positionId) ? (
    <Wrapper positionId={positionId} />
  ) : (
    <InfoCard message="We couldn't find this position..." title="Not Found" />
  )
}
