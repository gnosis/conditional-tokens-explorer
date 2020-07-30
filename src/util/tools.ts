import { ethers } from 'ethers'
import { Provider } from 'ethers/providers'
import { BigNumber, formatUnits } from 'ethers/utils'
import moment from 'moment-timezone'

import { BYTES_REGEX } from '../config/constants'
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

export const isConditionIdValid = (conditionId: string): boolean => BYTES_REGEX.test(conditionId)

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
