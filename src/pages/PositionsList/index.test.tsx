import { MockedProvider } from '@apollo/react-testing'
import { waitFor } from '@testing-library/dom'
import { render } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { ThemeProvider } from 'styled-components'

import { Connected, NotAsked, Web3Context, Web3ContextStatus } from 'contexts/Web3Context'
import { PositionsList } from 'pages/PositionsList/index'
import { PositionsListType, buildQueryPositions } from 'queries/positions'
import { UserWithPositionsQuery } from 'queries/users'
import theme from 'theme'

const connect = jest.fn()
const disconnect = jest.fn()

const connectedStatus = {
  _type: Web3ContextStatus.Connected,
  address: '0x123',
} as Connected

const infuraStatus = {
  _type: Web3ContextStatus.Infura,
} as NotAsked

const buildQueryOptions: PositionsListType = {
  positionId: '',
}

const query = buildQueryPositions(buildQueryOptions)

const variables = {
  positionId: '',
  collateral: '',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderWithConnectedProvider = (component: any, query: any) => {
  return render(
    <Web3Context.Provider value={{ status: connectedStatus, connect, disconnect }}>
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={query}>{component}</MockedProvider>
      </ThemeProvider>
    </Web3Context.Provider>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderWithDisconnectedProvider = (component: any, query: any) => {
  return render(
    <Web3Context.Provider value={{ status: infuraStatus, connect, disconnect }}>
      <ThemeProvider theme={theme}>
        <MockedProvider mocks={query}>{component}</MockedProvider>
      </ThemeProvider>
    </Web3Context.Provider>
  )
}

test('position list should show right columns when the user is connected', async () => {
  const mockQueryResult = [
    {
      request: {
        query: query,
        variables: variables,
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

    const positionIdColumn = await findByText(/Position Id/i)
    expect(positionIdColumn).toBeInTheDocument()

    // const collateralColumn = await findByText(/Collateral/i)
    // expect(collateralColumn).toBeInTheDocument()

    const erc1155Column = await findByText(/ERC1155 Amount/i)
    expect(erc1155Column).toBeInTheDocument()
  })
})

test('position list shold show right columns when the user is not connected', async () => {
  const mockQueryResult = [
    {
      request: {
        query: query,
        variables: variables,
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

    const positionIdColumn = await findByText(/Position Id/i)
    expect(positionIdColumn).toBeInTheDocument()
    //
    // const collateralColumn = await findByText(/Collateral/i)
    // expect(collateralColumn).toBeInTheDocument()

    expect(queryByText(/ERC1155 Amount/i)).toBeNull()
  })
})
