import React from 'react'

import { useWeb3Connected } from '../contexts/Web3Context'
import { Question } from '../util/types'
import { Provider } from 'ethers/providers'
import { isContract } from '../util/tools'
import { getKnowOracleFromAddress } from '../config/networkConfig'

// We check if the owner is a contract, if is a contract is from Safe, and Omen use safe, we can say the origin is from omen, maybe we can improve this in the future
export const useIsConditionFromOmen = (
  conditionCreatorAddress: string,
  oracle: string,
  question: Maybe<Question>
) => {
  const { RtioService, provider, networkConfig } = useWeb3Connected()

  const [isConditionCreatorAContract, setIsConditionCreatorAContract] = React.useState(false)
  const [error, setError] = React.useState(undefined)
  const [loading, setLoading] = React.useState<boolean>(true)

  React.useEffect(() => {
    let cancelled = false
    if (!cancelled) setLoading(true)

    const checkIfConditionCreatorIsAContract = async (provider: Provider, address: string) => {
      try {
        const isCreatorAContract = await isContract(provider, address)
        if (!cancelled) setIsConditionCreatorAContract(isCreatorAContract)
      } catch (err) {
        setError(err)
      }
    }

    checkIfConditionCreatorIsAContract(provider, conditionCreatorAddress)

    if (!cancelled) setLoading(false)

    return () => {
      cancelled = true
    }
  }, [RtioService, provider, conditionCreatorAddress])

  const isConditionFromOmen =
    isConditionCreatorAContract ||
    !!question ||
    (networkConfig.networkId &&
      getKnowOracleFromAddress(networkConfig.networkId, oracle) === ('realitio' as KnownOracle))

  return {
    isConditionFromOmen,
    error,
    loading,
  }
}
