import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { getTokenSummary, humanizeCollateralMessageError } from 'util/tools'
import { Token } from 'util/types'

export const useCollateral = (
  collateralAddress: string
): { collateral: Maybe<Token>; error: Maybe<Error>; loading: boolean } => {
  const { _type: status, networkConfig, provider } = useWeb3ConnectedOrInfura()

  const [collateral, setCollateral] = React.useState<Maybe<Token>>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Maybe<Error>>(null)

  React.useEffect(() => {
    let cancelled = false

    if (collateralAddress) {
      setLoading(true)
      const fetchBalanceAndTokenInformation = async () => {
        try {
          const token = await getTokenSummary(networkConfig, provider, collateralAddress)
          if (token) {
            if (!cancelled) setCollateral(token)
            if (!cancelled) setError(null)
          } else {
            if (!cancelled) setCollateral(null)
          }
        } catch (err) {
          if (!cancelled) {
            setCollateral(null)
            humanizeCollateralMessageError(err)
            setError(err)
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      }
      fetchBalanceAndTokenInformation()
    }
    return () => {
      cancelled = true
    }
  }, [status, networkConfig, provider, collateralAddress])

  return { loading, error, collateral }
}
