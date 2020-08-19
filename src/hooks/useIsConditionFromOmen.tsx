import React from 'react'

import { Web3ContextStatus, useWeb3Context } from '../contexts/Web3Context'
import { Question } from '../util/types'

// We check if the owner is a contract, if is a contract is from Safe, and Omen use safe, we can say the origin is from omen, maybe we can improve this in the future
export const useIsConditionFromOmen = (
  conditionCreatorAddress: string,
  oracleAddress: string,
  question: Maybe<Question>
): boolean => {
  const { status } = useWeb3Context()

  // This apparently should also check if condition creator is a contract but it seems it doesn't work - TODO: Confirm this idea
  const isConditionFromOmen = React.useMemo(() => {
    const defaultValue = false
    try {
      if (
        (status._type === Web3ContextStatus.Connected ||
          status._type === Web3ContextStatus.Infura) &&
        !!question
      ) {
        const { networkConfig } = status
        const oracle = networkConfig.getOracleFromAddress(oracleAddress)
        return oracle.name === ('realitio' as KnownOracle)
      } else {
        return defaultValue
      }
    } catch (err) {
      return defaultValue
    }
  }, [question, status, oracleAddress])

  return isConditionFromOmen
}
