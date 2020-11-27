import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { isOracleRealitio } from 'util/tools'

// We check if the owner is a contract, if is a contract is from Safe, and omen use safe, we can say the origin is from omen, maybe we can improve this in the future
export const useIsConditionFromOmen = (oraclesAddress: string[]): boolean => {
  const { networkConfig } = useWeb3ConnectedOrInfura()

  const isConditionFromOmen = React.useMemo(
    () =>
      oraclesAddress.some((oracleAddress: string) =>
        isOracleRealitio(oracleAddress, networkConfig)
      ),
    [networkConfig, oraclesAddress]
  )

  return isConditionFromOmen
}
