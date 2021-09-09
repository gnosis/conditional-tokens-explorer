import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'

export const useActiveAddress = () => {
  const {
    address: walletAddress,
    cpkAddress,
    isUsingTheCPKAddress,
    refresh,
  } = useWeb3ConnectedOrInfura()

  const activeAddress = React.useMemo(() => {
    return isUsingTheCPKAddress && isUsingTheCPKAddress() ? cpkAddress : walletAddress
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUsingTheCPKAddress, cpkAddress, walletAddress, refresh])

  return activeAddress
}
