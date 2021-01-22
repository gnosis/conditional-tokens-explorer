import { useQuery } from '@apollo/react-hooks'
import { ethers } from 'ethers'
import lodashUniqBy from 'lodash.uniqby'
import React, { useCallback, useMemo, useState } from 'react'

import { ApolloError } from 'apollo-client/errors/ApolloError'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useActiveAddress } from 'hooks/useActiveAddress'
import { useQueryTotalResults } from 'hooks/useQueryTotalResults'
import { Position, marshalPositionListData } from 'hooks/utils'
import { buildQueryPositionsList } from 'queries/CTEPositions'
import { UserWithPositionsQuery } from 'queries/CTEUsers'
import { Positions_positions, UserWithPositions } from 'types/generatedGQLForCTE'
import { Remote } from 'util/remoteData'
import { formatBigNumber, getTokenSummary } from 'util/tools'
import { AdvancedFilterPosition, PositionSearchOptions, Token } from 'util/types'

export type UserBalanceWithDecimals = {
  userBalanceERC1155WithDecimals: string
  userBalanceERC20WithDecimals: string
  userBalanceERC1155Numbered: number
  userBalanceERC20Numbered: number
  collateralTokenERC1155: Token
  collateralTokenSymbol: string
  collateralTokenERC20: Token
}

export type PositionWithUserBalanceWithDecimals = Position &
  UserBalanceWithDecimals & { token: Token }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Variables = { [k: string]: any }

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositionsList = (
  advancedFilter: AdvancedFilterPosition,
  clientFilter?: (position: PositionWithUserBalanceWithDecimals) => boolean
) => {
  const { networkConfig, provider } = useWeb3ConnectedOrInfura()

  const activeAddress = useActiveAddress()

  const [data, setData] = useState<Remote<Maybe<PositionWithUserBalanceWithDecimals[]>>>(
    Remote.loading()
  )

  const { CollateralValue, FromCreationDate, TextToSearch, ToCreationDate } = advancedFilter

  const query = buildQueryPositionsList(advancedFilter)

  const defaultFilter = useCallback(() => {
    return true
  }, [])

  const currentFilter = useMemo(() => {
    return clientFilter || defaultFilter
  }, [clientFilter, defaultFilter])

  const variables = useMemo(() => {
    const variables: Variables = {}
    if (FromCreationDate) variables['fromCreationDate'] = FromCreationDate
    if (ToCreationDate) variables['toCreationDate'] = ToCreationDate
    if (TextToSearch.type !== PositionSearchOptions.CollateralSymbol && TextToSearch.value) {
      variables['textToSearch'] = TextToSearch.value.toLowerCase()
    }
    if (TextToSearch.type === PositionSearchOptions.CollateralSymbol && TextToSearch.value) {
      const tokens = networkConfig.getMultipleTokenAddressesFromSymbol(TextToSearch.value)
      variables['textToSearch'] = tokens.length > 0 ? tokens : [ethers.constants.HashZero]
    }
    if (CollateralValue.value) {
      variables['collateralSearch'] = CollateralValue?.value
    }
    return variables
  }, [
    CollateralValue,
    FromCreationDate,
    TextToSearch.type,
    TextToSearch.value,
    ToCreationDate,
    networkConfig,
  ])

  React.useEffect(() => {
    if (TextToSearch.value) setData(Remote.loading())
  }, [TextToSearch])

  const {
    data: positionsData,
    error: positionsError,
    loading: loadingPositions,
    refetch: refetchPositions,
  } = useQueryTotalResults<Positions_positions, Variables>({
    query,
    fetchPolicy: 'no-cache',
    variables,
    entityName: 'positions',
  })

  const {
    data: userData,
    error: userError,
    loading: loadingUserData,
    refetch: refetchUserPositions,
  } = useQuery<UserWithPositions>(UserWithPositionsQuery, {
    skip: !activeAddress,
    fetchPolicy: 'no-cache',
    variables: {
      account: activeAddress?.toLowerCase(),
    },
  })

  React.useEffect(() => {
    // The use of loadingPositions act as a blocker when the useQuery is executing again
    if (loadingPositions || loadingUserData) setData(Remote.loading)
    if (positionsData && userData) {
      setData(Remote.loading)

      const positionListData = marshalPositionListData(positionsData, userData?.user)

      const fetchUserBalanceWithDecimals = async () => {
        const uniqueCollateralTokens = lodashUniqBy(positionListData, 'collateralToken')
        const uniqueWrappedTokens = lodashUniqBy(positionListData, 'wrappedToken')

        const collateralTokensPromises = uniqueCollateralTokens.map(
          async ({ collateralToken }: Position) => {
            try {
              return await getTokenSummary(networkConfig, provider, collateralToken)
            } catch (err) {
              return {
                address: collateralToken,
                decimals: 18,
                symbol: '',
              }
            }
          }
        )
        const wrappedTokensPromises = uniqueWrappedTokens.map(
          async ({ wrappedToken }: Position) => {
            try {
              return await getTokenSummary(
                networkConfig,
                provider,
                wrappedToken || ethers.constants.HashZero
              )
            } catch (err) {
              return {
                address: wrappedToken || ethers.constants.HashZero,
                decimals: 18,
                symbol: '',
              }
            }
          }
        )
        const collateralTokensResolved = await Promise.all(collateralTokensPromises)
        const wrappedTokensResolved = await Promise.all(wrappedTokensPromises)

        const positionListDataEnhanced = positionListData.map((position: Position) => {
          const { collateralToken, userBalanceERC20, userBalanceERC1155, wrappedToken } = position

          const collateralTokenFound = collateralTokensResolved.filter(
            (collateralTokenInformation) =>
              collateralTokenInformation &&
              collateralTokenInformation?.address.toLowerCase() === collateralToken.toLowerCase()
          )
          const wrappedTokenFound = wrappedTokensResolved.filter(
            (wrappedTokenInformation) =>
              wrappedTokenInformation &&
              wrappedTokenInformation?.address.toLowerCase() === wrappedToken?.toLowerCase()
          )

          const userBalanceERC1155WithDecimals =
            collateralTokenFound && collateralTokenFound.length && collateralTokenFound[0].decimals
              ? formatBigNumber(userBalanceERC1155, collateralTokenFound[0].decimals)
              : userBalanceERC1155.toString()

          const userBalanceERC20WithDecimals =
            collateralTokenFound && collateralTokenFound.length && collateralTokenFound[0].decimals
              ? formatBigNumber(userBalanceERC20, collateralTokenFound[0].decimals) // Using the collateralToken is OK
              : userBalanceERC20.toString()

          return {
            ...position,
            userBalanceERC1155WithDecimals,
            userBalanceERC20WithDecimals,
            userBalanceERC1155Numbered: Number(userBalanceERC1155WithDecimals),
            userBalanceERC20Numbered: Number(userBalanceERC20WithDecimals),
            collateralTokenERC1155: collateralTokenFound.length && collateralTokenFound[0],
            token: collateralTokenFound.length && collateralTokenFound[0],
            collateralTokenSymbol:
              collateralTokenFound.length && collateralTokenFound[0]
                ? collateralTokenFound[0].symbol
                : '',
            collateralTokenERC20: wrappedTokenFound.length && wrappedTokenFound[0],
          } as PositionWithUserBalanceWithDecimals
        })

        setData(Remote.success(positionListDataEnhanced))
      }
      fetchUserBalanceWithDecimals()
    }
  }, [loadingPositions, loadingUserData, positionsData, userData, networkConfig, provider])

  const error = React.useMemo(() => positionsError || userError, [positionsError, userError])

  const dataFiltered = useMemo(() => {
    const maybeItems = data.isSuccess() && data.get()
    return maybeItems && maybeItems.filter(currentFilter)
  }, [data, currentFilter])

  return {
    data: dataFiltered,
    error: error as ApolloError,
    loading: data.isLoading(),
    refetchPositions,
    refetchUserPositions,
  }
}
