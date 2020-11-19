import { useApolloClient } from '@apollo/react-hooks'
import { QueryBaseOptions } from 'apollo-client'
import { useCallback, useEffect, useState } from 'react'

interface PaginateVariables {
  first: number
  skip: number
}

interface TotalQueryExtraOptions {
  step?: number
  entityName: EntitiesNames
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

  const fetchAll = useCallback(async () => {
    const step = options.step || LIMIT
    let skip = 0
    let partialData: Result[] = []
    const entityName = options.entityName

    setLoading(true)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: lastFetched } = await client.query<Entity<Result>>({
        ...options,
        variables: { first: step, skip },
      })

      skip = skip + step

      if ((lastFetched && lastFetched[entityName].length === 0) || !lastFetched) {
        break
      } else {
        partialData = [...partialData, ...lastFetched[entityName]]
      }
    }
    setLoading(false)
    setData(partialData)
  }, [client, options])

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    loading,
    data,
    refetch: fetchAll,
  }
}
