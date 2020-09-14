/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { getTokenSummary } from 'util/tools'
import { Token } from 'util/types'

type WithAddress =
  | {
      collateralToken: string
    }
  | { collateralToken: { id: string } }

export const useWithToken = <T extends WithAddress>(data: T[]): Array<T & { token: Token }> => {
  const { networkConfig, provider } = useWeb3ConnectedOrInfura()

  const [dataWithToken, setDataWithToken] = useState<Array<T & { token: Token }>>([])
  useEffect(() => {
    let cancelled = false
    const fetchTokens = async (data: T[]): Promise<Array<T & { token: Token }>> => {
      return Promise.all(
        data.map(async (item: T) => {
          const id =
            typeof item.collateralToken === 'string'
              ? item.collateralToken
              : item.collateralToken.id
          const token = await getTokenSummary(networkConfig, provider, id)
          return { ...item, token }
        })
      )
    }

    if (data && data.length > 0) {
      fetchTokens(data).then((withToken) => {
        if (!cancelled) {
          setDataWithToken(withToken)
        }
      })
    }

    return () => {
      cancelled = true
    }
  }, [data, networkConfig, provider])

  return dataWithToken
}
