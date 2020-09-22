import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Token } from 'util/types'
import { ERC20Service } from 'services/erc20'

export const useCollateral = (
  collateralAddress: string
): { collateral: Maybe<Token>; error: Maybe<Error>; loading: boolean } => {
  const { _type: status, provider } = useWeb3ConnectedOrInfura()

  const [collateral, setCollateral] = React.useState<Maybe<Token>>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Maybe<Error>>(null)

  React.useEffect(() => {
    let cancelled = false

    if (collateralAddress) {
      setLoading(true)
      const fetchBalanceAndTokenInformation = async () => {
        try {
          const erc20Service = new ERC20Service(provider, collateralAddress)
          const token = await erc20Service.getProfileSummary()
          console.log(token)
          if (!cancelled) {
            setCollateral(token)
          }
        } catch (err) {
          if (!cancelled) {
            setError(err)
          }
        }
        if (!cancelled) {
          setLoading(false)
        }
      }
      fetchBalanceAndTokenInformation()
    }
    return () => {
      cancelled = true
    }
  }, [status, provider, collateralAddress])

  return { loading, error, collateral }
}
