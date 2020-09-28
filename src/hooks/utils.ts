import { BigNumber } from 'ethers/utils'

import { ZERO_BN } from 'config/constants'
import { Positions_positions, UserWithPositions_user } from 'types/generatedGQL'

export interface Position {
  id: string
  createTimestamp: number
  collateralToken: string
  wrappedToken: Maybe<string>
  userBalanceERC1155: BigNumber
  userBalanceERC20: BigNumber
}

export const marshalPositionListData = (
  positions: Positions_positions[],
  userData?: Maybe<UserWithPositions_user>
): Position[] => {
  return positions.map((position) => {
    const userPosition = userData
      ? userData.userPositions?.find((userPosition) => position.id === userPosition.position.id)
      : 0
    return {
      id: position.id,
      collateralToken: position.collateralToken.id,
      wrappedToken: position?.wrappedToken?.id,
      createTimestamp: position.createTimestamp,
      userBalanceERC1155: userPosition ? new BigNumber(userPosition.balance) : ZERO_BN,
      userBalanceERC20: userPosition ? new BigNumber(userPosition.wrappedBalance) : ZERO_BN,
    } as Position
  })
}
