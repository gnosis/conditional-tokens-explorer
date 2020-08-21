import { useQuery } from '@apollo/react-hooks'
import { PositionsListQuery } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import React from 'react'
import { Positions, UserWithPositions } from 'types/generatedGQL'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../contexts/Web3Context'

import { Position, marshalPositionListData } from './utils'

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositions = () => {
  const { _type: status, address: addressFromWallet } = useWeb3ConnectedOrInfura()

  const [data, setData] = React.useState<Maybe<Position[]>>(null)
  const [address, setAddress] = React.useState<Maybe<string>>(null)

  const { data: positionsData, error: positionsError, loading: positionsLoading } = useQuery<
    Positions
  >(PositionsListQuery)

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
    if (status === Web3ContextStatus.Connected && addressFromWallet) {
      setAddress(addressFromWallet.toLowerCase())
    }
  }, [status, addressFromWallet])

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
