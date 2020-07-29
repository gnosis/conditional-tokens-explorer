import { useQuery } from '@apollo/react-hooks'
import { ApolloError } from 'apollo-client'
import { PositionsListQuery } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import { useEffect, useRef, useState } from 'react'
import { Positions, UserWithPositions } from 'types/generatedGQL'

import { useWeb3Context } from '../contexts/Web3Context'

import { Position, marshalPositionListData } from './utils'

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositions = () => {
  const { status } = useWeb3Context()
  const [data, setData] = useState<Maybe<Position[]>>(null)
  const [error, setError] = useState<ApolloError | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)

  const account = useRef<Maybe<string>>(null)

  const { data: positionsData, error: positionsError, loading: positionsLoading } = useQuery<
    Positions
  >(PositionsListQuery)

  const { data: userData, error: userError, loading: userLoading } = useQuery<UserWithPositions>(
    UserWithPositionsQuery,
    {
      skip: !account.current,
      variables: {
        account: account.current,
      },
    }
  )

  useEffect(() => {
    if (status._type === 'connected') {
      account.current = status.address.toLowerCase()
    }
  }, [status])

  useEffect(() => {
    if (positionsError || userError) {
      setError(positionsError || userError)
    }
  }, [positionsError, userError])

  useEffect(() => {
    if (!positionsLoading && !userLoading) {
      setLoading(false)
    }
  }, [positionsLoading, userLoading])

  useEffect(() => {
    if (positionsData) {
      setData(marshalPositionListData(positionsData.positions, userData?.user))
    }
  }, [positionsData, userData])

  return {
    data,
    error,
    loading,
  }
}
