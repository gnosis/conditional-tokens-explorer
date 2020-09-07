import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, marshalPositionListData } from 'hooks/utils'
import { PositionsListType, buildQueryPositions } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import { Positions, UserWithPositions } from 'types/generatedGQL'
import { CollateralFilterOptions } from 'util/types'

interface OptionsToSearch {
  positionId?: string
  collateralValue?: string
  collateralFilter?: string
}

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositions = (options: OptionsToSearch) => {
  const { _type: status, address: addressFromWallet } = useWeb3ConnectedOrInfura()
  const { collateralFilter, collateralValue, positionId } = options

  const [data, setData] = React.useState<Maybe<Position[]>>(null)
  const [address, setAddress] = React.useState<Maybe<string>>(null)

  const queryOptions: PositionsListType = {}

  if (positionId) {
    queryOptions.positionId = positionId
  }

  if (collateralValue !== CollateralFilterOptions.All) {
    queryOptions.collateral = collateralFilter
  }

  const query = buildQueryPositions(queryOptions)

  const { data: positionsData, error: positionsError, loading: positionsLoading } = useQuery<
    Positions
  >(query, { variables: queryOptions })

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
