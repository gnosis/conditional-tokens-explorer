import React from 'react'

import { GetPosition } from '../../types/generatedGQL'
import { GetPositionQuery } from '../../queries/positions'
import { useQuery } from '@apollo/react-hooks'
import { PositionDetailItem } from './PositionDetailItem'

interface PositionDetailWrapperProps {
  positionId: string
}

export const PositionDetailWrapper = (props: PositionDetailWrapperProps) => {
  const { positionId } = props

  const { data, error, loading } = useQuery<GetPosition>(GetPositionQuery, {
    variables: { id: positionId },
  })

  if (data && data.position) {
    return <PositionDetailItem position={data.position} />
  } else {
    return loading ? <div>Loading...</div> : error ? <div>Error...</div> : <div>Not found ...</div>
  }
}
