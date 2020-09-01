import { Token } from 'util/types'

import React from 'react'
import { ERC20Service } from 'services/erc20'

import { useWeb3ConnectedOrInfura } from '../contexts/Web3Context'

export const useCollateral = (collateralAddress: string): Maybe<Token> => {
  const { _type: status, provider } = useWeb3ConnectedOrInfura()

  const [collateral, setCollateral] = React.useState<Maybe<Token>>(null)

  React.useEffect(() => {
    let cancelled = false

    const fetchToken = async (collateral: string) => {
      try {
        const erc20Service = new ERC20Service(provider, collateral)
        const token = await erc20Service.getProfileSummary()
        if (!cancelled) {
          setCollateral(token)
        }
      } catch (e) {
        setCollateral(null)
      }
    }

    fetchToken(collateralAddress)

    return () => {
      cancelled = true
    }
  }, [status, provider, collateralAddress])

  return collateral
}
