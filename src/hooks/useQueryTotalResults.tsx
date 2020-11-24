import { useApolloClient } from '@apollo/react-hooks'
import { ApolloError, QueryBaseOptions } from 'apollo-client'
import { useCallback, useEffect, useState } from 'react'

export interface PaginateVariables {
  first?: number
  skip?: number
}

interface TotalQueryExtraOptions {
  step?: number
  entityName: EntitiesNames
  skipQuery?: boolean
}

type EntitiesNames = 'conditions' | 'positions'
type Entity<Result> = {
  [I in EntitiesNames]: Result[]
}

const LIMIT = 1000
export function useQueryTotalResults<Result, K extends PaginateVariables>(
  options: TotalQueryExtraOptions & QueryBaseOptions<K>
) {
  const client = useApolloClient()

  const [data, setData] = useState<Maybe<Result[]>>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Maybe<ApolloError>>(null)

  const fetchAll = useCallback(async () => {
    const step = options.step || LIMIT
    let skip = 0
    let partialData: Result[] = []
    const entityName = options.entityName

    setLoading(true)
    setData(null)
    setError(null)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const { data: lastFetched } = await client.query<Entity<Result>>({
          ...options,
          variables: { first: step, skip, ...options.variables },
        })

        skip = skip + step

        if ((lastFetched && lastFetched[entityName].length === 0) || !lastFetched) {
          break
        } else {
          partialData = [...partialData, ...lastFetched[entityName]]
        }
      } catch (e) {
        setError(e)
        setLoading(false)
        setData(null)
        break
      }
    }
    setLoading(false)
    setData(partialData)
  }, [client, options])

  useEffect(() => {
    if (!options.skipQuery) fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.query, options.variables, options.skipQuery])

  return {
    loading,
    data,
    refetch: fetchAll,
    error,
  }
}
