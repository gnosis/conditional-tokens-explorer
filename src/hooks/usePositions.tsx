import { useQuery } from '@apollo/react-hooks'
import React from 'react'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, marshalPositionListData } from 'hooks/utils'
import { PositionsListType, buildQueryPositions } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import { ERC20Service } from 'services/erc20'
import { Positions, UserWithPositions } from 'types/generatedGQL'
import { CollateralFilterOptions } from 'util/types'
import { formatBigNumber } from 'util/tools'
import { getLogger } from 'util/logger'

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
  const { _type: status, address: addressFromWallet, networkConfig, provider } = useWeb3ConnectedOrInfura()
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
      const positionListData = marshalPositionListData(positionsData.positions, userData?.user)

      const fetchUserBalanceWithDecimals = async () => {
        const positionListDataPromises = positionListData.map(async (position: Position) => {
          const { collateralToken, userBalance } = position

          try {
            const token = networkConfig.getTokenFromAddress(collateralToken)
            return {
              ...position,
              userBalanceWithDecimals: formatBigNumber(userBalance, token.decimals),
            } as PositionWithUserBalanceWithDecimals
          } catch (err) {
            logger.error(err)
          }

          try {
            const erc20Service = new ERC20Service(provider, collateralToken)
            const token = await erc20Service.getProfileSummary()

            return {
              ...position,
              userBalanceWithDecimals: formatBigNumber(userBalance, token.decimals),
            } as PositionWithUserBalanceWithDecimals
          } catch (err) {
            logger.error(err)
          }

          return {
            ...position,
            userBalanceWithDecimals: userBalance.toString(),
          } as PositionWithUserBalanceWithDecimals
        })

        const positionListDataResolved = await Promise.all(positionListDataPromises)
        setData(positionListDataResolved)
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
