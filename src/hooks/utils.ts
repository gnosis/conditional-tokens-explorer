import { ZERO_BN } from 'config/constants'
import { BigNumber } from 'ethers/utils'
import { Positions_positions, UserWithPositions_user } from 'types/generatedGQL'

export interface Position {
  id: string
  collateralToken: string
  userBalance: BigNumber
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
      userBalance: userPosition ? new BigNumber(userPosition.balance) : ZERO_BN,
    } as Position
  })
}
