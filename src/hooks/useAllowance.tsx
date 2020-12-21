import { BigNumber } from 'ethers/utils'
import { useCallback } from 'react'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ERC20Service } from 'services/erc20'

/**
 * Return the allowance of the given `signer` for the conditional tokens contract.
 *
 * It also returns two helper functions:
 * `updateAllowance` can be used to reload the value of the allowance
 * `unlock` can be used to set unlimited allowance
 */
export const useAllowance = (tokenAddress: Maybe<string>) => {
  const {
    _type: status,
    address,
    connect,
    cpkAddress,
    provider,
    signer,
  } = useWeb3ConnectedOrInfura()

  const refresh = useCallback(async () => {
    if (status === Web3ContextStatus.Connected && tokenAddress && cpkAddress && address && signer) {
      const erc20Service = new ERC20Service(provider, tokenAddress, signer)
      const allowance = await erc20Service.allowance(address, cpkAddress)
      return allowance
    } else {
      return new BigNumber(0)
    }
  }, [tokenAddress, address, status, provider, cpkAddress, signer])

  const unlock = useCallback(async () => {
    if (status === Web3ContextStatus.Connected && tokenAddress && cpkAddress && address && signer) {
      const erc20Service = new ERC20Service(provider, tokenAddress, signer)
      const tx = await erc20Service.approveUnlimited(cpkAddress)
      return tx.wait()
    } else {
      connect()
    }
  }, [tokenAddress, status, address, cpkAddress, connect, provider, signer])

  return {
    refresh,
    unlock,
  }
}
