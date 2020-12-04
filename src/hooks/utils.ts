import { BigNumber } from 'ethers/utils'

import { ZERO_BN } from 'config/constants'
import {
  Positions_positions,
  Positions_positions_collection,
  UserWithPositions_user,
} from 'types/generatedGQLForCTE'

export interface ConditionInformation {
  oracle: string
  questionId: string
  conditionId: string
  outcomeSlotCount: number
  resolved: boolean
}

export interface Position {
  id: string
  indexSets: string[]
  conditionIds: string[]
  createTimestamp: number
  collateralToken: string
  wrappedToken: Maybe<string>
  userBalanceERC1155: BigNumber
  userBalanceERC20: BigNumber
  conditions: ConditionInformation[]
  collection: Positions_positions_collection
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
      indexSets: position.indexSets,
      conditionIds: position.conditionIds,
      collateralToken: position.collateralToken.id,
      wrappedToken: position?.wrappedToken?.id,
      collection: position?.collection,
      createTimestamp: position.createTimestamp,
      userBalanceERC1155: userPosition ? new BigNumber(userPosition.balance) : ZERO_BN,
      userBalanceERC20: userPosition ? new BigNumber(userPosition.wrappedBalance) : ZERO_BN,
      conditions:
        position?.conditions.map((condition) => {
          return {
            oracle: condition.oracle,
            questionId: condition.questionId,
            conditionId: condition.id,
            outcomeSlotCount: condition.outcomeSlotCount,
            resolved: condition.resolved,
          }
        }) ?? [],
    } as Position
  })
}
