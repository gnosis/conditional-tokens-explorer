import { useApolloClient } from '@apollo/react-hooks'
import { ApolloError, QueryOptions } from 'apollo-client'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface PaginateVariables {
  first?: number
  skip?: number
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
export function useQueryTotalResults<Result, Variables>(
  options: TotalQueryExtraOptions & PaginateVariables & QueryOptions<Variables>,
  skipQuery?: boolean
) {
  const client = useApolloClient()

  const [data, setData] = useState<Maybe<Result[]>>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Maybe<ApolloError>>(null)

  const optionsMemo = useMemo(() => {
    return {
      step: options.step,
      entityName: options.entityName,
      first: options.first,
      skip: options.skip,
      fetchPolicy: options.fetchPolicy,
      query: options.query,
      variables: options.variables,
      errorPolicy: options.errorPolicy,
      fetchResults: options.fetchResults,
      metadata: options.metadata,
      context: options.context,
    }
  }, [
    options.context,
    options.entityName,
    options.errorPolicy,
    options.fetchPolicy,
    options.fetchResults,
    options.first,
    options.metadata,
    options.query,
    options.skip,
    options.step,
    options.variables,
  ])
  const fetchAll = useCallback(async () => {
    const step = optionsMemo.step || LIMIT
    let skip = 0
    let partialData: Result[] = []
    const entityName = optionsMemo.entityName

    setLoading(true)
    setData(null)
    setError(null)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const { data: lastFetched } = await client.query<Entity<Result>>({
          ...optionsMemo,
          variables: { first: step, skip, ...optionsMemo.variables },
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
  }, [client, optionsMemo])

  useEffect(() => {
    if (!skipQuery) fetchAll()
  }, [skipQuery, fetchAll])

  return {
    loading,
    data,
    refetch: fetchAll,
    error,
  }
}
