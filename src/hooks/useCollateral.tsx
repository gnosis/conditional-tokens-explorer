import { Token } from 'util/types'

import React from 'react'
import { ERC20Service } from 'services/erc20'

import { useWeb3ConnectedOrInfura } from '../contexts/Web3Context'

export const useCollateral = (collateralAddress: string): Maybe<Token> => {
  const { _type: status, networkConfig, provider } = useWeb3ConnectedOrInfura()

  const [collateral, setCollateral] = React.useState<Maybe<Token>>(null)

  React.useEffect(() => {
    let cancelled = false

    const fetchToken = async (collateral: string) => {
      if (!collateralAddress) {
        return null
      }

      try {
        return networkConfig.getTokenFromAddress(collateralAddress)
      } catch {
        // do nothing
      }

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
  }, [status, provider, collateralAddress])

  return collateral
}
