import { BigNumber } from 'ethers/utils'
import { useCallback } from 'react'

import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../contexts/Web3Context'
import { ERC20Service } from '../services/erc20'

/**
 * Return the allowance of the given `signer` for the conditional tokens contract.
 *
 * It also returns two helper functions:
 * `updateAllowance` can be used to reload the value of the allowance
 * `unlock` can be used to set unlimited allowance
 */
export const useAllowance = (tokenAddress: Maybe<string>) => {
  const { _type: status, connect, networkConfig, signer } = useWeb3ConnectedOrInfura()

  const refresh = useCallback(async () => {
    if (status === Web3ContextStatus.Connected && tokenAddress && signer) {
      const account = await signer.getAddress()
      const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
      const provider = signer.provider

      const erc20Service = new ERC20Service(provider, tokenAddress, signer)
      const allowance = await erc20Service.allowance(account, conditionalTokensAddress)
      return allowance
    } else {
      return new BigNumber(0)
    }
  }, [tokenAddress, networkConfig, status, signer])

  const unlock = useCallback(async () => {
    if (status === Web3ContextStatus.Connected && tokenAddress && signer) {
      const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
      const provider = signer.provider

      const erc20Service = new ERC20Service(provider, tokenAddress, signer)
      const tx = await erc20Service.approveUnlimited(conditionalTokensAddress)
      return tx.wait()
    } else {
      connect()
    }
  }, [tokenAddress, status, connect, networkConfig, signer])

  return {
    refresh,
    unlock,
  }
}
