import { useApolloClient } from '@apollo/react-hooks'
import { QueryBaseOptions } from 'apollo-client'
import { useCallback, useEffect, useState } from 'react'

import { Conditions } from 'types/generatedGQLForCTE'

interface PaginateVariables {
  first: number
  skip: number
}

// TODO
// [ ] Compose with async-fetch hook / use if !cancelled
// [ ] throttle
// [ ] Found the way of make firstArg/secondArg general.

const LIMIT = 10
export function useQueryTotalResults<T extends Conditions, K extends PaginateVariables>(
  options: QueryBaseOptions<K>
  // firstArg: string,
  // secondArg?: string
) {
  const client = useApolloClient()

  const [data, setData] = useState<Maybe<T['conditions']>>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const limit = options.variables ? options.variables.first : LIMIT
    let skip = options.variables ? options.variables.skip : 0
    let partialData: T['conditions'] = []

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: lastFetched } = await client.query<T>({
        ...options,
      })

      skip = skip + limit

      if (lastFetched && lastFetched.conditions.length === 0) {
        break
      } else {
        partialData = [...partialData, ...lastFetched.conditions]
      }
    }
    setLoading(false)
    setData(partialData)
    // let hasNextPage = true
    // let allResults: any[] = []
    // variables.first = 1000
    // while (hasNextPage) {
    //   const { data }: { data: any } = await client.query<T>({
    //     query,
    //     context,
    //     variables,
    //   })
    //   let registers: any[] = []
    //   if (firstArg && secondArg) {
    //     registers = data[firstArg] ? data[firstArg][secondArg] : []
    //   } else {
    //     registers = data[firstArg]
    //   }
    //   allResults = [...allResults, ...registers]
    //   if (registers.length === 1000) {
    //     variables.skip = (variables.skip || 0) + 1000
    //   } else {
    //     hasNextPage = false
    //   }
    //   await new Promise((r) => setTimeout(r, 2000))
    // }
    // setLoading(false)
    // if (firstArg && secondArg) {
    //   const obj1: any = {}
    //   const obj2: any = {}
    //   obj2[secondArg] = allResults
    //   obj1[firstArg] = obj2
    //   setData(obj1)
    // } else {
    //   const obj: any = {}
    //   obj[firstArg] = allResults
    //   setData(obj)
    // }
  }, [client, options])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    loading,
    data,
    refetch: fetchAll,
  }
}
