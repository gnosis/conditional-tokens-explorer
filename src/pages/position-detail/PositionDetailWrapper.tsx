import { getLogger } from 'util/logger'

import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { GetPositionQuery } from '../../queries/positions'
import { GetPosition } from '../../types/generatedGQL'

import { PositionDetailItem } from './PositionDetailItem'

interface PositionDetailWrapperProps {
  positionId: string
}

export const PositionDetailWrapper = (props: PositionDetailWrapperProps) => {
  const { positionId } = props
  const logger = getLogger('PositionDetail')

  const { data, error, loading } = useQuery<GetPosition>(GetPositionQuery, {
    variables: { id: positionId },
  })

  if (error) {
    logger.error(error)
  }

  if (data && data.position) {
    return <PositionDetailItem position={data.position} />
  } else {
    return loading ? <div>Loading...</div> : <div>Not found...</div>
  }
}
