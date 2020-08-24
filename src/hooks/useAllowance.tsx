import { BigNumber } from 'ethers/utils'
import { useCallback } from 'react'

import { Web3ContextStatus, useWeb3Context } from '../contexts/Web3Context'
import { ERC20Service } from '../services/erc20'

/**
 * Return the allowance of the given `signer` for the conditional tokens contract.
 *
 * It also returns two helper functions:
 * `updateAllowance` can be used to reload the value of the allowance
 * `unlock` can be used to set unlimited allowance
 */
export const useAllowance = (tokenAddress: Maybe<string>) => {
  const { connect, status } = useWeb3Context()

  const refresh = useCallback(async () => {
    if (status._type === Web3ContextStatus.Connected && tokenAddress) {
      const { networkConfig, signer } = status
      const account = await signer.getAddress()
      const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
      const provider = signer.provider

      const erc20Service = new ERC20Service(provider, signer, tokenAddress)
      const allowance = await erc20Service.allowance(account, conditionalTokensAddress)
      return allowance
    } else {
      return new BigNumber(0)
    }
  }, [tokenAddress, status])

  const unlock = useCallback(async () => {
    if (status._type === Web3ContextStatus.Connected && tokenAddress) {
      const { networkConfig, signer } = status
      const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
      const provider = signer.provider

      const erc20Service = new ERC20Service(provider, signer, tokenAddress)
      const tx = await erc20Service.approveUnlimited(conditionalTokensAddress)
      return tx.wait()
    } else {
      connect()
    }
  }, [tokenAddress, status, connect])

  return {
    refresh,
    unlock,
  }
}
