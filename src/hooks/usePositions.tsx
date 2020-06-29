import { useState, useRef, useEffect } from 'react'
import { useWeb3Context } from '../contexts/Web3Context'
import { useQuery } from '@apollo/react-hooks'
import { PositionsListQuery } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import {
  Positions,
  Positions_positions,
  UserWithPositions,
  UserWithPositions_user,
} from 'types/generatedGQL'
import { ApolloError } from 'apollo-client'
import { ZERO_BN } from 'config/constants'
import { BigNumber } from 'ethers/utils'

export interface Position {
  id: string
  collateralToken: string
  userBalance: BigNumber
}

const marshalData = (
  positions: Positions_positions[],
  userData?: Maybe<UserWithPositions_user>
): Position[] => {
  return positions.map((position) => {
    const userPosition = userData
      ? userData.userPositions?.find((userPosition) => position.id === userPosition.position.id)
      : 0
    return {
      id: position.id,
      collateralToken: position.collateralToken.id,
      userBalance: userPosition ? new BigNumber(userPosition.balance) : ZERO_BN,
    } as Position
  })
}

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
      setData(marshalData(positionsData.positions, userData?.user))
    }
  }, [positionsData, userData])

  return {
    data,
    error,
    loading,
  }
}
