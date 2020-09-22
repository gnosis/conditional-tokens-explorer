import { useQuery } from '@apollo/react-hooks'
import { ethers } from 'ethers'
import lodashUniqBy from 'lodash.uniqby'
import React from 'react'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, marshalPositionListData } from 'hooks/utils'
import { PositionsListType, buildQueryPositions } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import { Positions, UserWithPositions } from 'types/generatedGQL'
import { formatBigNumber, getTokenSummary } from 'util/tools'
import { CollateralFilterOptions, Token } from 'util/types'

export type UserBalanceWithDecimals = {
  userBalanceERC1155WithDecimals: string
  userBalanceERC20WithDecimals: string
  collateralTokenERC1155: Token
  collateralTokenERC20: Token
}

export type PositionWithUserBalanceWithDecimals = Position & UserBalanceWithDecimals
export type PositionWithUserBalanceWithDecimalsWithToken = PositionWithUserBalanceWithDecimals & {
  token: Token
}

interface OptionsToSearch {
  positionId?: string
  collateralValue?: string
  collateralFilter?: string
}

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
  const [loadingUserBalanceWithDecimals, setLoadingUserBalanceWithDecimals] = React.useState(true)

  const queryOptions: PositionsListType = {}

  if (positionId) {
    queryOptions.positionId = positionId
  }

  if (collateralValue !== CollateralFilterOptions.All) {
    queryOptions.collateral = collateralFilter
  }

  const query = buildQueryPositions(queryOptions)

  const {
    data: positionsData,
    error: positionsError,
    loading: positionsLoading,
    refetch: refetchPositions,
  } = useQuery<Positions>(query, { variables: queryOptions })

  const {
    data: userData,
    error: userError,
    loading: userLoading,
    refetch: refetchUserPositions,
  } = useQuery<UserWithPositions>(UserWithPositionsQuery, {
    skip: !address,
    variables: {
      account: address,
    },
  })

  React.useEffect(() => {
    if (status === Web3ContextStatus.Connected && addressFromWallet) {
      setAddress(addressFromWallet.toLowerCase())
    }
  }, [status, addressFromWallet])

  React.useEffect(() => {
    let cancelled = false
    if (positionsData) {
      const positionListData = marshalPositionListData(positionsData.positions, userData?.user)

      setLoadingUserBalanceWithDecimals(true)

      const fetchUserBalanceWithDecimals = async () => {
        const uniqueCollateralTokens = lodashUniqBy(positionListData, 'collateralToken')
        const uniqueWrappedTokens = lodashUniqBy(positionListData, 'wrappedToken')

        const collateralTokensPromises = uniqueCollateralTokens.map(
          async ({ collateralToken }: Position) =>
            await getTokenSummary(networkConfig, provider, collateralToken)
        )
        const wrappedTokensPromises = uniqueWrappedTokens.map(
          async ({ wrappedToken }: Position) =>
            await getTokenSummary(
              networkConfig,
              provider,
              wrappedToken || ethers.constants.HashZero
            )
        )
        const collateralTokensResolved = await Promise.all(collateralTokensPromises)
        const wrappedTokensResolved = await Promise.all(wrappedTokensPromises)

        const positionListDataEnhanced = positionListData.map((position: Position) => {
          const { collateralToken, userBalanceERC20, userBalanceERC1155, wrappedToken } = position

          const collateralTokenFound = collateralTokensResolved.filter(
            (collateralTokenInformation) =>
              collateralTokenInformation?.address.toLowerCase() === collateralToken.toLowerCase()
          )
          const wrappedTokenFound = wrappedTokensResolved.filter(
            (wrappedTokenInformation) =>
              wrappedTokenInformation?.address.toLowerCase() === wrappedToken?.toLowerCase()
          )

          const userBalanceERC1155WithDecimals =
            collateralTokenFound.length && collateralTokenFound[0].decimals
              ? formatBigNumber(userBalanceERC1155, collateralTokenFound[0].decimals)
              : userBalanceERC1155.toString()

          const userBalanceERC20WithDecimals =
            wrappedTokenFound.length && wrappedTokenFound && wrappedTokenFound[0].decimals
              ? formatBigNumber(userBalanceERC20, wrappedTokenFound[0].decimals)
              : userBalanceERC20.toString()

          return {
            ...position,
            userBalanceERC1155WithDecimals,
            userBalanceERC20WithDecimals,
            collateralTokenERC1155: collateralTokenFound.length && collateralTokenFound[0],
            collateralTokenERC20: wrappedTokenFound.length && wrappedTokenFound[0],
          } as PositionWithUserBalanceWithDecimals
        })
        if (!cancelled) {
          setData(positionListDataEnhanced)
          setLoadingUserBalanceWithDecimals(false)
        }
      }

      fetchUserBalanceWithDecimals()
    } else {
      setLoadingUserBalanceWithDecimals(false)
    }
    return () => {
      cancelled = true
    }
  }, [positionsData, userData, networkConfig, provider])

  return {
    data,
    error: positionsError || userError,
    loading: positionsLoading || userLoading || loadingUserBalanceWithDecimals,
    refetchPositions,
    refetchUserPositions,
  }
}
