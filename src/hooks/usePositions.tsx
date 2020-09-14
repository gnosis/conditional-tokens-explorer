import { useQuery } from '@apollo/react-hooks'
import lodashUniqBy from 'lodash.uniqby'
import React from 'react'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, marshalPositionListData } from 'hooks/utils'
import { PositionsListType, buildQueryPositions } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import { Positions, UserWithPositions } from 'types/generatedGQL'
import { getLogger } from 'util/logger'
import { formatBigNumber, getTokenSummary } from 'util/tools'
import { CollateralFilterOptions } from 'util/types'

export type UserBalanceWithDecimals = {
  userBalanceWithDecimals: string
}

export type PositionWithUserBalanceWithDecimals = Position & UserBalanceWithDecimals

interface OptionsToSearch {
  positionId?: string
  collateralValue?: string
  collateralFilter?: string
}

const logger = getLogger('UsePositions')

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositions = (options: OptionsToSearch) => {
  const {
    _type: status,
    address: addressFromWallet,
    networkConfig,
    provider,
  } = useWeb3ConnectedOrInfura()
  const { collateralFilter, collateralValue, positionId } = options

  const [data, setData] = React.useState<Maybe<PositionWithUserBalanceWithDecimals[]>>(null)
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
      const positionListData = marshalPositionListData(positionsData.positions, userData?.user)

      const fetchUserBalanceWithDecimals = async () => {
        const uniqueCollateralTokens = lodashUniqBy(positionListData, 'collateralToken')

        const collateralTokensPromises = uniqueCollateralTokens.map(async (position: Position) => {
          const { collateralToken } = position
          return await getTokenSummary(networkConfig, provider, collateralToken, logger)
        })
        const collateralTokensResolved = await Promise.all(collateralTokensPromises)

        const positionListDataEnhanced = positionListData.map((position: Position) => {
          const { collateralToken, userBalance } = position

          const collateralTokenFound = collateralTokensResolved.filter(
            (collateralTokenInformation) => {
              return (
                collateralTokenInformation.address.toLowerCase() === collateralToken.toLowerCase()
              )
            }
          )

          const userBalanceWithDecimals =
            collateralTokenFound.length && collateralTokenFound[0].decimals
              ? formatBigNumber(userBalance, collateralTokenFound[0].decimals)
              : userBalance.toString()

          return {
            ...position,
            userBalanceWithDecimals,
          } as PositionWithUserBalanceWithDecimals
        })

        setData(positionListDataEnhanced)
      }

      fetchUserBalanceWithDecimals()
    }
  }, [positionsData, userData, networkConfig, provider])

  return {
    data,
    error: positionsError || userError,
    loading: positionsLoading || userLoading,
  }
}
