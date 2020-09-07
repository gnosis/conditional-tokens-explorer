import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ERC20Service } from 'services/erc20'
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

    const fetchToken = async (collateral: string) => {
      if (!collateralAddress) {
        return null
      }

      // if it's already in configs no need to hit the blockchain
      try {
        return networkConfig.getTokenFromAddress(collateralAddress)
      } catch {
        // do nothing
      }

      // try to recover ERC20 profile
      const erc20Service = new ERC20Service(provider, collateral)
      const token = await erc20Service.getProfileSummary()
      return token
    }

    setLoading(true)
    fetchToken(collateralAddress)
      .then((token) => {
        if (!cancelled) {
          setCollateral(token)
          setLoading(false)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoading(false)
          setCollateral(null)
          setError(err)
        }
      })

    return () => {
      cancelled = true
    }
  }, [status, provider, collateralAddress, networkConfig])

  return { loading, error, collateral }
}
