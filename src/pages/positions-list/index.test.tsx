import React from 'react'
import { render } from '@testing-library/react'
import { waitFor } from '@testing-library/dom'
import { act } from 'react-dom/test-utils'
import { MockedProvider } from '@apollo/react-testing'

import { Web3Context, Connected, NotAsked } from 'contexts/Web3Context'
import { PositionsList } from './index'
import { UserWithPositionsQuery } from 'queries/users'
import { PositionsListQuery } from 'queries/positions'

const connect = jest.fn()

const connectedStatus = {
  _type: 'connected',
  address: '0x123',
} as Connected

const notAskedStatus = {
  _type: 'notAsked',
} as NotAsked

const renderWithConnectedProvider = (component: any, query: any) => {
  return render(
    <Web3Context.Provider value={{ status: connectedStatus, connect }}>
      <MockedProvider mocks={query}>{component}</MockedProvider>
    </Web3Context.Provider>
  )
}

const renderWithDisconnectedProvider = (component: any, query: any) => {
  return render(
    <Web3Context.Provider value={{ status: notAskedStatus, connect }}>
      <MockedProvider mocks={query}>{component}</MockedProvider>
    </Web3Context.Provider>
  )
}

test('position list shold show right columns when the user is connected', async () => {
  const mockQueryResult = [
    {
      request: {
        query: PositionsListQuery,
      },
      result: {
        data: {
          positions: [
            {
              __typename: 'Position',
              id: 'Position1',
              collateralToken: {
                __typename: 'CollateralToken',
                id: 'token1',
              },
            },
            {
              __typename: 'Position',
              id: 'Position2',
              collateralToken: {
                __typename: 'CollateralToken',
                id: 'token1',
              },
            },
          ],
        },
      },
    },
    {
      request: {
        query: UserWithPositionsQuery,
        variables: {
          account: '0x123',
        },
      },
      result: {
        data: {
          user: {
            __typename: 'User',
            userPositions: [
              {
                __typename: 'UserPosition',
                id: '0x0',
                position: {
                  __typename: 'Position',
                  id: 'Position1',
                },
                balance: '100',
              },
            ],
          },
        },
      },
    },
  ]
  await act(async () => {
    const { findByText, debug, getByRole } = await renderWithConnectedProvider(
      <PositionsList />,
      mockQueryResult
    )

    await waitFor(() => {
      expect(getByRole('table')).toBeInTheDocument()
    })

    const positinIdColum = await findByText(/Position Id/i)
    expect(positinIdColum).toBeInTheDocument()

    const collateralColum = await findByText(/Collateral/i)
    expect(collateralColum).toBeInTheDocument()

    const erc1155Colum = await findByText(/ERC1155 Amount/i)
    expect(erc1155Colum).toBeInTheDocument()
  })
})

test('position list shold show right columns when the user is not connected', async () => {
  const mockQueryResult = [
    {
      request: {
        query: PositionsListQuery,
      },
      result: {
        data: {
          positions: [
            {
              __typename: 'Position',
              id: 'Position1',
              collateralToken: {
                __typename: 'CollateralToken',
                id: 'token1',
              },
            },
            {
              __typename: 'Position',
              id: 'Position2',
              collateralToken: {
                __typename: 'CollateralToken',
                id: 'token1',
              },
            },
          ],
        },
      },
    },
  ]
  await act(async () => {
    const { findByText, queryByText, getByRole } = renderWithDisconnectedProvider(
      <PositionsList />,
      mockQueryResult
    )

    await waitFor(() => {
      expect(getByRole('table')).toBeInTheDocument()
    })

    const positinIdColum = await findByText(/Position Id/i)
    expect(positinIdColum).toBeInTheDocument()

    const collateralColum = await findByText(/Collateral/i)
    expect(collateralColum).toBeInTheDocument()

    expect(queryByText(/ERC1155 Amount/i)).toBeNull()
  })
})
