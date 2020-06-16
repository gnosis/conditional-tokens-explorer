import { useCallback } from 'react'
import { ERC20Service } from '../services/erc20'
import { Token } from '../config/networkConfig'
import { useWeb3Connected } from '../contexts/Web3Context'

/**
 * Return the allowance of the given `signer` for the conditional tokens contract.
 *
 * It also returns two helper functions:
 * `updateAllowance` can be used to reload the value of the allowance
 * `unlock` can be used to set unlimited allowance
 */
export const useAllowance = (token: Token) => {
  const { networkConfig, signer } = useWeb3Connected()
  const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
  const provider = signer.provider

  const refresh = useCallback(async () => {
    const account = await signer.getAddress()
    const erc20Service = new ERC20Service(provider, signer, token)
    const allowance = await erc20Service.allowance(account, conditionalTokensAddress)
    return allowance
  }, [conditionalTokensAddress, provider, signer, token])

  const unlock = useCallback(async () => {
    const erc20Service = new ERC20Service(provider, signer, token)
    const tx = await erc20Service.approveUnlimited(conditionalTokensAddress)

    return tx
  }, [provider, conditionalTokensAddress, signer, token])

  return {
    refresh,
    unlock,
  }
}
