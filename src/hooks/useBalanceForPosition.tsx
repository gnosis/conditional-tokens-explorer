import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { UserPositionBalancesQuery } from 'queries/users'
import { UserPositionBalances } from 'types/generatedGQL'

export const useBalanceForPosition = (positionId: string) => {
  const { address } = useWeb3ConnectedOrInfura()

  const { data, error, loading, refetch } = useQuery<UserPositionBalances>(
    UserPositionBalancesQuery,
    {
      skip: !address || !positionId,
      variables: {
        account: address && address.toLowerCase(),
        positionId: positionId,
      },
    }
  )

  const balance = {
    balanceERC1155: new BigNumber(0),
    balanceERC20: new BigNumber(0),
    error,
    loading,
    refetch,
  }

  if (data && data?.userPositions.length > 0) {
    const userPosition = data.userPositions[0]
    const { balance: balanceERC1155, wrappedBalance: balanceERC20 } = userPosition
    balance.balanceERC1155 = new BigNumber(balanceERC1155)
    balance.balanceERC20 = new BigNumber(balanceERC20)
  }

  return balance
}
