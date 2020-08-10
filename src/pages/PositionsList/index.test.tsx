import { MockedProvider } from '@apollo/react-testing'
import { waitFor } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { Connected, NotAsked, Web3Context } from 'contexts/Web3Context'
import { PositionsListQuery } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { ThemeProvider } from 'styled-components'

import theme from '../../theme'

import { PositionsList } from './index'

const connect = jest.fn()

const connectedStatus = {
  _type: 'connected',
  address: '0x123',
} as Connected

const notAskedStatus = {
  _type: 'notAsked',
} as NotAsked

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderWithConnectedProvider = (component: any, query: any) => {
  return render(
    <Web3Context.Provider value={{ status: connectedStatus, connect }}>
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={query}>{component}</MockedProvider>
      </ThemeProvider>
    </Web3Context.Provider>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderWithDisconnectedProvider = (component: any, query: any) => {
  return render(
    <Web3Context.Provider value={{ status: notAskedStatus, connect }}>
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={query}>{component}</MockedProvider>
      </ThemeProvider>
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
    const { findByText, getByRole } = await renderWithConnectedProvider(
      <PositionsList />,
      mockQueryResult
    )

    await waitFor(() => {
      expect(getByRole('table')).toBeInTheDocument()
    })

    const positinIdColumn = await findByText(/Position Id/i)
    expect(positinIdColumn).toBeInTheDocument()

    const collateralColumn = await findByText(/Collateral/i)
    expect(collateralColumn).toBeInTheDocument()

    const erc1155Column = await findByText(/ERC1155 Amount/i)
    expect(erc1155Column).toBeInTheDocument()
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
    const { findByText, getByRole, queryByText } = renderWithDisconnectedProvider(
      <PositionsList />,
      mockQueryResult
    )

    await waitFor(() => {
      expect(getByRole('table')).toBeInTheDocument()
    })

    const positinIdColumn = await findByText(/Position Id/i)
    expect(positinIdColumn).toBeInTheDocument()

    const collateralColumn = await findByText(/Collateral/i)
    expect(collateralColumn).toBeInTheDocument()

    expect(queryByText(/ERC1155 Amount/i)).toBeNull()
  })
})
