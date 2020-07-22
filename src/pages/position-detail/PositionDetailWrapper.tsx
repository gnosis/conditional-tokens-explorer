import React from 'react'

import { fetchPosition_position } from '../../types/generatedGQL'
import { fetchPosition } from '../../queries/positions'
import { useQuery } from '@apollo/react-hooks'
import { PositionDetailItem } from './PositionDetailItem'

interface PositionDetailWrapperProps {
  positionId: string
}

export const PositionDetailWrapper = (props: PositionDetailWrapperProps) => {
  const { positionId } = props

  const { data: position, error, loading } = useQuery<fetchPosition_position>(fetchPosition, {
    variables: { id: positionId },
  })

  if (position) {
    return <PositionDetailItem data={position} />
  } else {
    return loading ? <div>Loading...</div> : error ? <div>Error...</div> : <div>Not found ...</div>
  }
}
