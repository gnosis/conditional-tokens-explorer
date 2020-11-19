import { MockedProvider, MockedResponse } from '@apollo/react-testing'
import gql from 'graphql-tag'
import React, { ReactElement } from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { useQueryTotalResults } from 'hooks/useQueryTotalResults'
import { Conditions } from 'types/generatedGQLForCTE'

const query = gql`
  query PaginatedConditions($first: Int, $skip: Int) {
    conditions(first: $first, skip: $skip) {
      id
    }
  }
`

const mockedQuery = [
  {
    request: {
      query,
      variables: { first: 1, skip: 0 },
    },
    result: {
      data: {
        conditions: [
          {
            id: '0x1',
          },
        ],
      },
    },
  },
  {
    request: {
      query,
      variables: { first: 1, skip: 1 },
    },
    result: {
      data: {
        conditions: [
          {
            id: '0x2',
          },
        ],
      },
    },
  },
  {
    request: {
      query,
      variables: { first: 1, skip: 2 },
    },
    result: {
      data: {
        conditions: [
          {
            id: '0x3',
          },
        ],
      },
    },
  },
  {
    request: {
      query,
      variables: { first: 1, skip: 3 },
    },
    result: {
      data: {
        conditions: [],
      },
    },
  },
]

interface Paginate {
  first: number
  skip: number
}

interface Props {
  children: ReactElement
}

const wrapper = (query: MockedResponse[]) => (props: Props) => {
  return (
    <MockedProvider addTypename={false} mocks={query}>
      {props.children}
    </MockedProvider>
  )
}

describe('useQueryTotalResults', () => {
  it('verifies that it renders with no initial value', async () => {
    const { result } = renderHook(
      () =>
        useQueryTotalResults<Conditions, Paginate>({ query, step: 1, entityName: 'conditions' }),
      {
        wrapper: wrapper(mockedQuery),
      }
    )
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
  })
  it('verifies that next update has all values', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useQueryTotalResults<Conditions, Paginate>({ query, step: 1, entityName: 'conditions' }),
      {
        wrapper: wrapper(mockedQuery),
      }
    )

    await waitForNextUpdate({ timeout: 100 })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual([{ id: '0x1' }, { id: '0x2' }, { id: '0x3' }])
  })
})
