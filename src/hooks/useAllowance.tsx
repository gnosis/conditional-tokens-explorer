import { constants } from 'ethers'
import { BigNumber } from 'ethers/utils'
import { useCallback, useEffect, useState } from 'react'
import { ERC20Service } from '../services/erc20'
import { Token } from '../config/networkConfig'
import { useWeb3Connected } from '../contexts/Web3Context'
import { Remote } from '../util/remoteData'

/**
 * Return the allowance of the given `signer` for the conditional tokens contract.
 *
 * It also returns two helper functions:
 * `updateAllowance` can be used to reload the value of the allowance
 * `unlock` can be used to set unlimited allowance
 */
export const useAllowance = (token: Token) => {
  const [allowance, setAllowance] = useState<Remote<BigNumber>>(Remote.notAsked<BigNumber>())
  const { networkConfig, signer } = useWeb3Connected()
  const conditionalTokensAddress = networkConfig.getConditionalTokenContract()
  const provider = signer.provider

  const updateAllowance = useCallback(async () => {
    if (provider && conditionalTokensAddress) {
      const account = await signer.getAddress()
      const erc20Service = new ERC20Service(provider, signer, token)
      const allowance = await erc20Service.allowance(account, conditionalTokensAddress)
      setAllowance(Remote.success(allowance))
    }
  }, [conditionalTokensAddress, provider, signer, token])

  const unlock = useCallback(async () => {
    if (provider && conditionalTokensAddress) {
      setAllowance(Remote.loading())

      const erc20Service = new ERC20Service(provider, signer, token)
      try {
        await erc20Service.approveUnlimited(conditionalTokensAddress)
        setAllowance(Remote.success(constants.MaxUint256))
      } catch (e) {
        setAllowance(Remote.failure(e))
      }
    }
  }, [provider, conditionalTokensAddress, signer, token])

  useEffect(() => {
    updateAllowance()
  }, [updateAllowance])

  return {
    allowance,
    updateAllowance,
    unlock,
  }
}
