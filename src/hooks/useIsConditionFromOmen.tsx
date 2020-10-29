import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'

// We check if the owner is a contract, if is a contract is from Safe, and omen use safe, we can say the origin is from omen, maybe we can improve this in the future
export const useIsConditionFromOmen = (oracleAddress: string): boolean => {
  const { networkConfig } = useWeb3ConnectedOrInfura()

  const isConditionFromOmen = React.useMemo(() => {
    const defaultValue = false
    try {
      const oracle = networkConfig.getOracleFromAddress(oracleAddress)
      return oracle.name === ('reality' as KnownOracle)
    } catch (err) {
      return defaultValue
    }
  }, [networkConfig, oracleAddress])

  return isConditionFromOmen
}
