import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { NetworkConfig } from 'config/networkConfig'

const isOracleFromRealitio = (oracleAddress: string, networkConfig: NetworkConfig) => {
    const oracle = networkConfig.getOracleFromAddress(oracleAddress)
    return oracle.name === ('reality' as KnownOracle)
}

// We check if the owner is a contract, if is a contract is from Safe, and omen use safe, we can say the origin is from omen, maybe we can improve this in the future
export const useIsConditionFromOmen = (oracleAddress: string): boolean => {
  const { networkConfig } = useWeb3ConnectedOrInfura()

  const isConditionFromOmen = React.useMemo(() =>  isOracleFromRealitio(oracleAddress, networkConfig)
    , [networkConfig, oracleAddress])

  return isConditionFromOmen
}

export const useIsConditionFromOmenAsCallback = (oracleAddress: string, networkConfig: NetworkConfig) => {
  return React.useCallback(() => isOracleFromRealitio(oracleAddress, networkConfig), [networkConfig, oracleAddress])
}
