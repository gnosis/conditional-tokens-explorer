import { useCallback } from 'react'

import { useWeb3Connected } from '../contexts/Web3Context'
import { ERC20Service } from '../services/erc20'

/**
 * Return the allowance of the given `signer` for the conditional tokens contract.
 *
 * It also returns two helper functions:
 * `updateAllowance` can be used to reload the value of the allowance
 * `unlock` can be used to set unlimited allowance
 */
export const useAllowance = (tokenAddress: string) => {
  const { networkConfig, signer } = useWeb3Connected()
  const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
  const provider = signer.provider

  const refresh = useCallback(async () => {
    const account = await signer.getAddress()
    const erc20Service = new ERC20Service(provider, signer, tokenAddress)
    const allowance = await erc20Service.allowance(account, conditionalTokensAddress)
    return allowance
  }, [conditionalTokensAddress, provider, signer, tokenAddress])

  const unlock = useCallback(async () => {
    const erc20Service = new ERC20Service(provider, signer, tokenAddress)
    const tx = await erc20Service.approveUnlimited(conditionalTokensAddress)

    return tx
  }, [provider, conditionalTokensAddress, signer, tokenAddress])

  return {
    refresh,
    unlock,
  }
}
