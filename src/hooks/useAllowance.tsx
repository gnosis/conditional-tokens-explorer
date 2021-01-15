import { BigNumber } from 'ethers/utils'
import React from 'react'

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
    address: walletAddress,
    connect,
    cpkAddress,
    isUsingTheCPKAddress,
    networkConfig,
    provider,
    signer,
  } = useWeb3ConnectedOrInfura()

  const refresh = React.useCallback(async () => {
    if (
      status === Web3ContextStatus.Connected &&
      tokenAddress &&
      cpkAddress &&
      walletAddress &&
      signer
    ) {
      if (isUsingTheCPKAddress()) {
        const erc20Service = new ERC20Service(provider, tokenAddress, signer)
        const allowance = await erc20Service.allowance(walletAddress, cpkAddress)
        return allowance
      } else {
        const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
        const erc20Service = new ERC20Service(provider, tokenAddress, signer)
        const allowance = await erc20Service.allowance(walletAddress, conditionalTokensAddress)
        return allowance
      }
    } else {
      return new BigNumber(0)
    }
  }, [
    tokenAddress,
    status,
    provider,
    cpkAddress,
    signer,
    isUsingTheCPKAddress,
    networkConfig,
    walletAddress,
  ])

  const unlock = React.useCallback(async () => {
    if (
      status === Web3ContextStatus.Connected &&
      tokenAddress &&
      cpkAddress &&
      walletAddress &&
      signer
    ) {
      if (isUsingTheCPKAddress()) {
        const erc20Service = new ERC20Service(provider, tokenAddress, signer)
        const tx = await erc20Service.approveUnlimited(cpkAddress)
        return tx.wait()
      } else {
        const conditionalTokensAddress = networkConfig.getConditionalTokensAddress()
        const provider = signer.provider

        const erc20Service = new ERC20Service(provider, tokenAddress, signer)
        const tx = await erc20Service.approveUnlimited(conditionalTokensAddress)
        return tx.wait()
      }
    } else {
      connect()
    }
  }, [
    tokenAddress,
    status,
    walletAddress,
    cpkAddress,
    connect,
    provider,
    signer,
    isUsingTheCPKAddress,
    networkConfig,
  ])

  return {
    refresh,
    unlock,
  }
}
