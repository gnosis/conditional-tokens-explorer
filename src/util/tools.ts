import { ethers } from 'ethers'
import { Provider } from 'ethers/providers'
import { BigNumber, formatUnits } from 'ethers/utils'
import moment from 'moment-timezone'

import { BYTES_REGEX } from '../config/constants'
import { getTokenFromAddress } from '../config/networkConfig'
import {
  GetCondition_condition,
  GetPosition_position,
  GetPosition_position_collection_conditions,
  GetPosition_position_conditions,
} from '../types/generatedGQL'

import { ConditionErrors } from './types'

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

export const isConditionErrorNotFound = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.NOT_FOUND_ERROR) > -1

export const isConditionErrorNotResolved = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.NOT_RESOLVED_ERROR) > -1

export const isConditionErrorFetching = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.FETCHING_ERROR) > -1

export const isConditionErrorInvalid = (errors: ConditionErrors[]): boolean =>
  errors.indexOf(ConditionErrors.INVALID_ERROR) > -1

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

export const positionSring = (
  collateralTokenId: string,
  conditionIds: string[],
  indexSets: any[],
  balance: BigNumber,
  networkId: number
) => {
  // Get the token
  const token = getTokenFromAddress(networkId, collateralTokenId)

  return `[${token.symbol.toUpperCase()} ${conditionIds.map((conditionId, i) => {
    return `C:${truncateStringInTheMiddle(conditionId, 8, 6)} O:${outcomeString(
      parseInt(indexSets[i], 10)
    )}`
  })}]  ${formatBigNumber(balance, token.decimals, 2)}`
}

const outcomeString = (indexSet: number) =>
  indexSet
    .toString(2)
    .split('')
    .reverse()
    .reduce((acc, e, i) => (e !== '0' ? [...acc, i] : acc), new Array<number>())
    .join('|')

// FIXME - This won't work for position with indexSet like A|B, only for positions with 1 outcome. We need to find out how to calculate this for that kind on positions
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
      return balance.mul(payout)
    }

    return acc
  }, new BigNumber(0))
}

export const getRedeemedPreview = (
  position: GetPosition_position,
  resolvedCondition: GetCondition_condition,
  redeemedBalance: BigNumber,
  networkId: number
) => {
  if (position.conditions.length > 1) {
    const conditionIndex = position.conditions.findIndex(({ id }) => id === resolvedCondition.id)
    const filteredConditionIds = position.conditionIds.filter((_, i) => i !== conditionIndex)
    const filteredIndexSets = position.indexSets.filter((_, i) => i !== conditionIndex)

    return positionSring(
      position.collateralToken.id,
      filteredConditionIds,
      filteredIndexSets,
      redeemedBalance,
      networkId
    )
  }

  const { decimals, symbol } = getTokenFromAddress(networkId, position.collateralToken.id)
  return `${formatBigNumber(redeemedBalance, decimals)} ${symbol}`
}

export const displayPositions = (
  position: GetPosition_position,
  balance: BigNumber,
  networkId: number
) => {
  const { collateralToken, collection } = position

  // Get the token
  const token = getTokenFromAddress(networkId, collateralToken.id)

  // Get the conditions
  const { conditions } = collection
  const conditionsToDisplay = displayConditions(conditions)

  return `[${token.symbol.toUpperCase()} ${conditionsToDisplay}] x ${formatBigNumber(
    balance,
    token.decimals,
    2
  )}`
}

export const displayConditions = (conditions: GetPosition_position_collection_conditions[]) => {
  return (
    conditions
      .map((condition: GetPosition_position_collection_conditions) => {
        const { id, outcomeSlotCount } = condition
        return buildCondition(id, outcomeSlotCount)
      })
      // TODO what about the OR, when is OR or AND ?
      .join(` & `)
  )
}

export const displayCondition = (condition: GetCondition_condition) => {
  const { id, outcomeSlotCount } = condition

  return buildCondition(id, outcomeSlotCount)
}

const buildCondition = (id: string, outcomeSlotCount: number) => {
  const outcomes = []

  // TODO Check if position condition had a question in realitio, also I think this is not correct (is a first approach) , I think this also needs the indexSets and other type of calculations
  for (let i = 0; i < outcomeSlotCount; i++) {
    outcomes.push(i + '')
  }

  // TODO what about the AND, when is OR or AND ?
  return `C: ${id} O: ${outcomes.join('|')}`
}
