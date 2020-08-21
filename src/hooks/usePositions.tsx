import { useQuery } from '@apollo/react-hooks'
import { PositionsListQuery, PositionsSearchQuery } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import React from 'react'
import { Positions, UserWithPositions } from 'types/generatedGQL'

import { Web3ContextStatus, useWeb3Context } from '../contexts/Web3Context'

import { Position, marshalPositionListData } from './utils'

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositions = () => {
  const { status } = useWeb3Context()
  const [data, setData] = React.useState<Maybe<Position[]>>(null)
  const [address, setAddress] = React.useState<Maybe<string>>(null)

  const { data: positionsData, error: positionsError, loading: positionsLoading } = useQuery<
    Positions
  >(PositionsSearchQuery, {
    variables: {
      positionId: '0x0015b40bbe11a844d3f5501060b42143d59e1ac701327e9e260478e2657aab57',
    },
  })

  const { data: userData, error: userError, loading: userLoading } = useQuery<UserWithPositions>(
    UserWithPositionsQuery,
    {
      skip: !address,
      variables: {
        account: address,
      },
    }
  )

  React.useEffect(() => {
    if (status._type === Web3ContextStatus.Connected) {
      const { address } = status
      setAddress(address.toLowerCase())
    }
  }, [status])

  React.useEffect(() => {
    if (positionsData) {
      setData(marshalPositionListData(positionsData.positions, userData?.user))
    }
  }, [positionsData, userData])

  return {
    data,
    error: positionsError || userError,
    loading: positionsLoading || userLoading,
  }
}
