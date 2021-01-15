import { useQuery } from '@apollo/react-hooks'
import { BigNumber } from 'ethers/utils'

import { useActiveAddress } from 'hooks/useActiveAddress'
import { UserPositionBalancesQuery } from 'queries/CTEUsers'
import { UserPositionBalances } from 'types/generatedGQLForCTE'

export const useBalanceForPosition = (positionId: string) => {
  const activeAddress = useActiveAddress()

  const { data, error, loading, refetch } = useQuery<UserPositionBalances>(
    UserPositionBalancesQuery,
    {
      skip: !activeAddress || !positionId,
      variables: {
        account: activeAddress && activeAddress.toLowerCase(),
        positionId: positionId,
      },
    }
  )

  const balanceData = {
    balanceERC1155: new BigNumber(0),
    balanceERC20: new BigNumber(0),
    error,
    loading,
    refetch,
  }

  if (data && data?.userPositions.length > 0) {
    const userPosition = data.userPositions[0]
    const { balance: balanceERC1155, wrappedBalance: balanceERC20 } = userPosition
    balanceData.balanceERC1155 = new BigNumber(balanceERC1155)
    balanceData.balanceERC20 = new BigNumber(balanceERC20)
  }

  return balanceData
}
