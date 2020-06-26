import { useState, useCallback, useRef, useEffect } from 'react'
import { useWeb3Context } from '../contexts/Web3Context'
import { useQuery } from '@apollo/react-hooks'
import { PositionsListQuery } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import { Positions, Positions_positions, UserWithPositions } from 'types/generatedGQL'

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositions = () => {
  const { status } = useWeb3Context()
  const [data, setData] = useState<any[]>([])

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
      account.current = status.address
    }
  }, [status])

  console.log(positionsData, userData)
}
