import { Token } from 'util/types'

import React from 'react'
import { ERC20Service } from 'services/erc20'

import { Web3ContextStatus, useWeb3Context } from '../contexts/Web3Context'

export const useCollateral = (collateralAddress: string) => {
  const { status } = useWeb3Context()

  const [collateral, setCollateral] = React.useState<Maybe<Token>>(null)

  React.useEffect(() => {
    let cancelled = false
    if (status._type === Web3ContextStatus.Connected) {
      const fetchToken = async (collateral: string) => {
        const { provider, signer } = status

        try {
          const erc20Service = new ERC20Service(provider, signer, collateral)
          const token = await erc20Service.getProfileSummary()
          if (!cancelled) {
            setCollateral(token)
          }
        } catch (e) {
          setCollateral(null)
        }
      }

      fetchToken(collateralAddress)
    }

    return () => {
      cancelled = true
    }
  }, [status, collateralAddress])

  return collateral
}
