import { MockedProvider } from '@apollo/react-testing'
import gql from 'graphql-tag'
import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { useQueryTotalResults } from 'hooks/useQueryTotalResults'
import { Conditions } from 'types/generatedGQLForCTE'

const query = gql`
  {
    conditions(first: 5) {
      id
    }
    positions(first: 2) {
      id
    }
  }
`

const mockedQuery = [
  {
    request: {
      query,
    },
    result: {
      data: {
        conditions: [
          {
            id: '0x00af9b2462e40e7d04678054e1f734dbd1f2c0ceb6af6a79ea3cba7fa3ac9ae7',
          },
          {
            id: '0x00f498c5a90432da7dfffe663032b970060e83b935664ac5b4a47c7010059795',
          },
          {
            id: '0x00fc8952b001bfe940a770cb406e1126b7f09469ce01e62743ad3c2447d1ef87',
          },
          {
            id: '0x019a0a3c352051c3da8b328dd39bb651c27402a2301cb07fad868df05568bd98',
          },
          {
            id: '0x01f2993e6240c67b66f2c79f668786d5e365a000724d6fe24fc3961c81a810fe',
          },
        ],
        positions: [
          {
            id: '0x0015b40bbe11a844d3f5501060b42143d59e1ac701327e9e260478e2657aab57',
          },
          {
            id: '0x004c6465c69efaf352989de39dd51120fd03877e2403cdcad96e0e0f3cea6006',
          },
        ],
      },
    },
  },
]

interface Paginate {
  first: number
  skip: number
}

const wrapper = (query: any) => (props: any) => {
  return <MockedProvider mocks={query}>{props.children}</MockedProvider>
}

describe('useQueryTotalResults', () => {
  it('verifies that it renders with no initial value', () => {
    const { result } = renderHook(
      () => useQueryTotalResults<Conditions, Paginate>({ query }),
      {
        wrapper: wrapper(mockedQuery),
      }
    )
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
  })

  // it('verifies that it renders with initial value', () => {
  //   const { result } = renderHook(() => useQueryTotalResults())
  //   expect(result.current).toBe('My name is Larry.')
  // })
})
