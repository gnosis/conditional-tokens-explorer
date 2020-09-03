import { ethers } from 'ethers'
import { Provider } from 'ethers/providers'
import { BigNumber, formatUnits } from 'ethers/utils'
import moment from 'moment-timezone'

import { BYTES_REGEX } from '../config/constants'
import {
  GetCondition_condition,
  GetMultiPositions_positions,
  GetPosition_position,
} from '../types/generatedGQL'

import { ConditionErrors, PositionErrors, Token } from './types'

export const isAddress = (address: string) => {
  try {
    ethers.utils.getAddress(address)
  } catch (e) {
    return false
  }
  return true
}

export const isContract = async (provider: Provider, address: string): Promise<boolean> => {
  const code = await provider.getCode(address)
  return !!code && code !== '0x'
}

export const range = (max: number): number[] => {
  return Array.from(new Array(max), (_, i) => i)
}

// Generate array of length size with values from 2^0 to 2^(size-1)
export const trivialPartition = (size: number) => {
  return range(size).reduce((acc: BigNumber[], _, index: number) => {
    const two = new BigNumber(2)
    acc.push(two.pow(index))
    return acc
  }, [])
}

export const formatBigNumber = (value: BigNumber, decimals: number, precision = 2): string =>
  Number(formatUnits(value, decimals)).toFixed(precision)

export const isBytes32String = (s: string): boolean => BYTES_REGEX.test(s)

export const isConditionIdValid = (conditionId: string): boolean => isBytes32String(conditionId)

export const isPositionIdValid = (positionId: string): boolean => isBytes32String(positionId)

export const truncateStringInTheMiddle = (
  str: string,
  strPositionStart: number,
  strPositionEnd: number
) => {
  const minTruncatedLength = strPositionStart + strPositionEnd
  if (minTruncatedLength < str.length) {
    return `${str.substr(0, strPositionStart)}...${str.substr(
      str.length - strPositionEnd,
      str.length
    )}`
  }
  return str
}

export const getConditionTypeTitle = (templateId: Maybe<number>) => {
  if (templateId === 5 || templateId === 6) {
    return 'Nuanced Binary'
  } else if (templateId === 2) {
    return 'Categorical'
  } else {
    return 'Binary'
  }
}

export const formatDate = (date: Date): string => {
  return moment(date).tz('UTC').format('YYYY-MM-DD - HH:mm [UTC]')
}

export const formatTS = (timestamp: number): string => {
  return moment.unix(timestamp).utc().format('YYYY-MM-DD - HH:mm [UTC]')
}

export const isConditionErrorInvalid = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.INVALID_ERROR) > -1

export const isConditionErrorFetching = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.FETCHING_ERROR) > -1

export const isConditionErrorNotFound = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.NOT_FOUND_ERROR) > -1

export const isConditionErrorNotResolved = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.NOT_RESOLVED_ERROR) > -1

export const isPositionErrorInvalid = (errors: PositionErrors[]): boolean =>
  errors.indexOf(PositionErrors.INVALID_ERROR) > -1

export const isPositionErrorFetching = (errors: PositionErrors[]): boolean =>
  errors.indexOf(PositionErrors.FETCHING_ERROR) > -1

export const isPositionErrorNotFound = (errors: PositionErrors[]): boolean =>
  errors.indexOf(PositionErrors.NOT_FOUND_ERROR) > -1

export const isPositionErrorEmptyBalance = (errors: PositionErrors[]): boolean =>
  errors.indexOf(PositionErrors.EMPTY_BALANCE_ERROR) > -1

export const divBN = (a: BigNumber, b: BigNumber, scale = 10000): number => {
  return a.mul(scale).div(b).toNumber() / scale
}

export const mulBN = (a: BigNumber, b: number, scale = 10000): BigNumber => {
  return a.mul(Math.round(b * scale)).div(scale)
}

export const getIndexSets = (outcomesCount: number) => {
  const range = (length: number) => [...Array(length)].map((x, i) => i)
  return range(outcomesCount).map((x) => 1 << x)
}

export const positionString = (
  conditionIds: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  indexSets: any[],
  balance: BigNumber,
  token: Token
) => {
  return `[${token.symbol.toUpperCase()} ${conditionIds
    .map((conditionId, i) => {
      return `C:${truncateStringInTheMiddle(conditionId, 8, 6)} O:${outcomeString(
        parseInt(indexSets[i], 10)
      )}`
    })
    .join(' & ')}] x${formatBigNumber(balance, token.decimals, 2)}`
}

const outcomeString = (indexSet: number) =>
  indexSet
    .toString(2)
    .split('')
    .reverse()
    .reduce((acc, e, i) => (e !== '0' ? [...acc, i] : acc), new Array<number>())
    .join('|')

export const getRedeemedBalance = (
  position: GetPosition_position,
  resolvedCondition: GetCondition_condition,
  balance: BigNumber
) => {
  const conditionIndex = position.conditions.findIndex(({ id }) => id === resolvedCondition.id)
  const indexSet = position.indexSets[conditionIndex]

  const { payouts } = resolvedCondition
  const positionOutcomes = parseInt(indexSet, 10).toString(2).split('').reverse()

  return positionOutcomes.reduce((acc, posOutcome, i) => {
    const payout = payouts?.[i] as Maybe<string>
    if (posOutcome === '1' && payout) {
      return acc.add(mulBN(balance, Number(payout)))
    }

    return acc
  }, new BigNumber(0))
}

export const getRedeemedPreview = (
  position: GetPosition_position,
  resolvedCondition: GetCondition_condition,
  redeemedBalance: BigNumber,
  token: Token
) => {
  if (position.conditions.length > 1) {
    const conditionIndex = position.conditions.findIndex(({ id }) => id === resolvedCondition.id)
    const filteredConditionIds = position.conditionIds.filter((_, i) => i !== conditionIndex)
    const filteredIndexSets = position.indexSets.filter((_, i) => i !== conditionIndex)

    return positionString(filteredConditionIds, filteredIndexSets, redeemedBalance, token)
  }

  return `${formatBigNumber(redeemedBalance, token.decimals)} ${token.symbol}`
}

export const positionsSameConditionsSet = (positions: GetMultiPositions_positions[]) => {
  // all postions include same conditions set and collateral token
  const conditionIdsSet = positions.map((position) => [...position.conditionIds].sort().join(''))
  return conditionIdsSet.every((set) => set === conditionIdsSet[0])
}

// more than 1 position
// same collateral
// same conditions set
export const arePositionMergeables = (positions: GetMultiPositions_positions[]) => {
  return (
    positions.length > 1 &&
    positions.every(
      (position) => position.collateralToken.id === positions[0].collateralToken.id
    ) &&
    positionsSameConditionsSet(positions)
  )
}

// disjoint partition
export const arePositionMergeablesByCondition = (
  positions: GetMultiPositions_positions[],
  condition: GetCondition_condition
) => {
  return arePositionMergeables(positions) && isConditionDisjoint(positions, condition)
}

export const isConditionFullIndexSet = (
  positions: GetMultiPositions_positions[],
  condition: GetCondition_condition
) => {
  const partition = positions.reduce((acc, position) => {
    const conditionIndex = position.conditionIds.findIndex((id) => condition.id === id)
    return [...acc, Number(position.indexSets[conditionIndex])]
  }, [] as number[])

  return isFullIndexSetPartition(partition, condition.outcomeSlotCount)
}

export const isConditionDisjoint = (
  positions: GetMultiPositions_positions[],
  condition: GetCondition_condition
) => {
  const partition = positions.reduce((acc, position) => {
    const conditionIndex = position.conditionIds.findIndex((id) => condition.id === id)
    return [...acc, Number(position.indexSets[conditionIndex])]
  }, [] as number[])

  return isDisjointPartition(partition, condition.outcomeSlotCount)
}

export const isDisjointPartition = (partition: number[], outcomeSlotCount: number) => {
  if (partition.length <= 1 || outcomeSlotCount === 0) {
    return false
  }

  let isDisjoint = true
  const fullIndexSet = (1 << outcomeSlotCount) - 1
  let freeIndexSet = fullIndexSet

  for (let i = 0; i < partition.length; i++) {
    const indexSet = partition[i]
    if (indexSet === 0) {
      isDisjoint = false
      break
    }

    if (indexSet > fullIndexSet) {
      isDisjoint = false
      break
    }

    if ((indexSet & freeIndexSet) !== indexSet) {
      isDisjoint = false
      break
    }
    freeIndexSet ^= indexSet
  }
  return isDisjoint
}

export const isFullIndexSetPartition = (partition: number[], outcomeSlotCount: number) => {
  if (!isDisjointPartition(partition, outcomeSlotCount)) {
    return false
  }

  const fullIndexSet = (1 << outcomeSlotCount) - 1
  const partitionSum = partition.reduce((acc, indexSet) => acc + indexSet, 0)

  return partitionSum === fullIndexSet
}

export const minBigNumber = (values: BigNumber[]) =>
  values.reduce((min, value) => (min.lte(value) ? min : value), values[0])

export const getMergePreview = (
  positions: GetPosition_position[],
  condition: GetCondition_condition,
  amount: BigNumber,
  token: Token
) => {
  if (isConditionFullIndexSet(positions, condition)) {
    return getRedeemedPreview(positions[0], condition, amount, token)
  } else {
    // this assumes all positions have same conditions set order
    const newIndexSets = Array.from(new Array(positions[0].indexSets.length), (_, i) =>
      Number(positions[0].indexSets[i])
    )
    for (let i = 1; i < positions.length; i++) {
      const position = positions[i]
      position.conditionIds.reduce((acc, id, i) => {
        if (id === condition.id) {
          acc[i] += Number(position.indexSets[i])
        }

        return acc
      }, newIndexSets)
    }
    return positionString(positions[0].conditionIds, newIndexSets, amount, token)
  }
}
