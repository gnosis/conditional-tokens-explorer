import React from 'react'

import { useWeb3ConnectedOrInfura } from '../contexts/Web3Context'
import { Question } from '../util/types'

// We check if the owner is a contract, if is a contract is from Safe, and Omen use safe, we can say the origin is from omen, maybe we can improve this in the future
export const useIsConditionFromOmen = (
  conditionCreatorAddress: string,
  oracleAddress: string,
  question: Maybe<Question>
): boolean => {
  const { networkConfig } = useWeb3ConnectedOrInfura()

  // This apparently should also check if condition creator is a contract but it seems it doesn't work - TODO: Confirm this idea
  const isConditionFromOmen = React.useMemo(() => {
    const defaultValue = false
    try {
      if (question) {
        const oracle = networkConfig.getOracleFromAddress(oracleAddress)
        return oracle.name === ('realitio' as KnownOracle)
      } else {
        return defaultValue
      }
    } catch (err) {
      return defaultValue
    }
  }, [question, networkConfig, oracleAddress])

  return isConditionFromOmen
}
