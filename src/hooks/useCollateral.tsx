import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ERC20Service } from 'services/erc20'
import { Token } from 'util/types'

export const useCollateral = (collateralAddress: string): Maybe<Token> => {
  const { _type: status, networkConfig, provider } = useWeb3ConnectedOrInfura()

  const [collateral, setCollateral] = React.useState<Maybe<Token>>(null)

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
      try {
        const erc20Service = new ERC20Service(provider, collateral)
        const token = await erc20Service.getProfileSummary()
        return token
      } catch (e) {
        return null
      }
    }

    fetchToken(collateralAddress).then((token) => {
      if (!cancelled) {
        setCollateral(token)
      }
    })

    return () => {
      cancelled = true
    }
  }, [status, provider, collateralAddress, networkConfig])

  return collateral
}
