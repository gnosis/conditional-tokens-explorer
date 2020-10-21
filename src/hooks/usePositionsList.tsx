import { useQuery } from '@apollo/react-hooks'
import { ethers } from 'ethers'
import lodashUniqBy from 'lodash.uniqby'
import React, { useState } from 'react'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, marshalPositionListData } from 'hooks/utils'
import { buildQueryPositionsList } from 'queries/CTEPositions'
import { UserWithPositionsQuery } from 'queries/CTEUsers'
import { Positions, UserWithPositions } from 'types/generatedGQLForCTE'
import { formatBigNumber, getTokenSummary } from 'util/tools'
import { AdvancedFilterPosition, PositionSearchOptions, Token } from 'util/types'
import { Remote } from 'util/remoteData'

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

/**
 * Return a array of positions, and the user balance if it's connected.
 */
export const usePositionsList = (advancedFilter: AdvancedFilterPosition) => {
  const {
    _type: status,
    address: addressFromWallet,
    networkConfig,
    provider,
  } = useWeb3ConnectedOrInfura()

  const [data, setData] = useState<Remote<Maybe<PositionWithUserBalanceWithDecimals[]>>>(
    Remote.notAsked<Maybe<PositionWithUserBalanceWithDecimals[]>>()
  )
  const [address, setAddress] = React.useState<Maybe<string>>(null)

  const { CollateralValue, FromCreationDate, TextToSearch, ToCreationDate } = advancedFilter

  const query = buildQueryPositionsList(advancedFilter)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variables: { [k: string]: any } = {}
  if (FromCreationDate) variables['fromCreationDate'] = FromCreationDate
  if (ToCreationDate) variables['toCreationDate'] = ToCreationDate
  if (TextToSearch.type === PositionSearchOptions.ConditionId && TextToSearch.value) {
    variables['textToSearch'] = [TextToSearch?.value.toLowerCase()]
  }
  if (
    (TextToSearch.type === PositionSearchOptions.PositionId ||
      TextToSearch.type === PositionSearchOptions.CollateralAddress) &&
    TextToSearch.value
  ) {
    variables['textToSearch'] = TextToSearch?.value.toLowerCase()
  }
  if (TextToSearch.type === PositionSearchOptions.CollateralSymbol && TextToSearch.value) {
    const token = networkConfig.getTokenFromName(TextToSearch.value)
    variables['textToSearch'] = token?.address.toLowerCase()
  }
  if (CollateralValue.value) {
    variables['collateralSearch'] = CollateralValue?.value.toLowerCase()
  }

  const { data: positionsData, error: positionsError, refetch: refetchPositions } = useQuery<
    Positions
  >(query, { fetchPolicy: 'no-cache', variables })

  const { data: userData, error: userError, refetch: refetchUserPositions } = useQuery<
    UserWithPositions
  >(UserWithPositionsQuery, {
    skip: !address,
    fetchPolicy: 'no-cache',
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
    setData(Remote.loading())
    if (positionsData && userData) {
      const positionListData = marshalPositionListData(positionsData.positions, userData?.user)

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
  }, [positionsData, userData, networkConfig, provider])

  const error = React.useMemo(() => positionsError || userError, [positionsError, userError])

  return {
    data: data.isSuccess() && data.get(),
    error,
    loading: !data.isSuccess(),
    refetchPositions,
    refetchUserPositions,
  }
}
