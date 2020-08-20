import React from 'react'

import { getKnowOracleFromAddress } from '../config/networkConfig'
import { Web3ContextStatus, useWeb3Context } from '../contexts/Web3Context'
// import { isContract } from '../util/tools'
import { Question } from '../util/types'

// We check if the owner is a contract, if is a contract is from Safe, and Omen use safe, we can say the origin is from omen, maybe we can improve this in the future
export const useIsConditionFromOmen = (
  conditionCreatorAddress: string,
  oracle: string,
  question: Maybe<Question>
) => {
  // const { RtioService, networkConfig, provider } = useWeb3Connected()
  const { status } = useWeb3Context()

  // const [isConditionCreatorAContract, setIsConditionCreatorAContract] = React.useState(false)
  // const [error, setError] = React.useState(undefined)
  // const [loading, setLoading] = React.useState<boolean>(true)
  const error = undefined
  const loading = true

  // React.useEffect(() => {
  //   let cancelled = false
  //   if (status._type === 'connected' || status._type === 'infura') {
  //     if (!cancelled) setLoading(true)
  //     const { provider } = status
  //     const checkIfConditionCreatorIsAContract = async (provider: Provider, address: string) => {
  //       try {
  //         const isCreatorAContract = await isContract(provider, address)
  //         if (!cancelled) setIsConditionCreatorAContract(isCreatorAContract)
  //       } catch (err) {
  //         setError(err)
  //       }
  //     }

  //     checkIfConditionCreatorIsAContract(provider, conditionCreatorAddress)

  //     if (!cancelled) setLoading(false)
  //   }

  //   return () => {
  //     cancelled = true
  //   }
  // }, [status, conditionCreatorAddress])

  const networkId = React.useMemo(
    () =>
      status._type === Web3ContextStatus.Connected || status._type === Web3ContextStatus.Infura
        ? status.networkConfig.networkId
        : null,
    [status]
  )

  // This apparently should also check if condition creator is a contract but it seems it doesn't work - TODO: Confirm this idea
  const isConditionFromOmen = React.useMemo(
    () =>
      !!question &&
      networkId &&
      getKnowOracleFromAddress(networkId, oracle) === ('realitio' as KnownOracle),
    [question, oracle, networkId]
  )

  return {
    isConditionFromOmen,
    error,
    loading,
  }
}
