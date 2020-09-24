import React from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { ERC20Service } from 'services/erc20'
import { humanizeMessageError } from 'util/tools'
import { Token } from 'util/types'

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
          if (!cancelled) {
            if (token) {
              setCollateral(token)
              setError(null)
            } else {
              setCollateral(null)
            }
          }
        } catch (err) {
          if (!cancelled) {
            err.message = humanizeMessageError(err.message)
            setError(err)
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
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
