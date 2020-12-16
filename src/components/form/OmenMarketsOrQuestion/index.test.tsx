import { MockedProvider } from '@apollo/react-testing'
import { render } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { NetworkConfig } from 'config/networkConfig'
import { Connected, Web3Context, Web3ContextStatus } from 'contexts/Web3Context'
import {
  GetConditionWithQuestions,
  GetConditionWithQuestionsOfPosition,
} from 'queries/CTEConditionsWithQuestions'
import { queryGetOmenMarketsByConditionID } from 'queries/OMENMarkets'
import theme from 'theme'

import { OmenMarketsOrQuestion } from '.'

const connect = jest.fn()
const disconnect = jest.fn()

const networkConfig = new NetworkConfig(4)

const connectedStatus = {
  _type: Web3ContextStatus.Connected,
  address: '0x123',
  networkConfig,
} as Connected

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderWithConnectedProvider = (component: any, query: any) => {
  return render(
    <Web3Context.Provider value={{ status: connectedStatus, connect, disconnect }}>
      <ThemeProvider theme={theme}>
        <HashRouter>
          <MockedProvider mocks={query}>{component}</MockedProvider>
        </HashRouter>
      </ThemeProvider>
    </Web3Context.Provider>
  )
}
const mockQueryResult = [
  {
    request: {
      query: GetConditionWithQuestions,
      variables: { id: '0x1' },
    },
    result: {
      data: {
        condition: {
          question: {
            title: 'test1',
          },
        },
      },
    },
  },
  {
    request: {
      query: GetConditionWithQuestionsOfPosition,
      variables: { id: '0x2' },
    },
    result: {
      data: {
        conditions: [
          {
            question: {
              title: 'test1',
            },
          },
          {
            question: {
              title: 'test2',
            },
          },
        ],
      },
    },
  },
  {
    request: {
      query: GetConditionWithQuestionsOfPosition,
      variables: { id: '0x1' },
    },
    result: {
      data: {
        position: '0x1',
        conditions: [
          {
            id: '0x1',
            question: {
              title: 'test1',
            },
          },
        ],
      },
    },
  },
  {
    request: {
      query: queryGetOmenMarketsByConditionID,
      //context: { clientName: 'Omen' },
      variables: { id: '0xconditionWith1FPMM' },
    },
    result: {
      data: {
        condition: {
          fixedProductMarketMakers: [
            {
              id: '0xfpmm1',
              question: {
                title: 'fpmm_title_1',
              },
            },
          ],
        },
      },
    },
  },
  {
    request: {
      query: queryGetOmenMarketsByConditionID,
      //context: { clientName: 'Omen' },
      variables: { id: '0x2' },
    },
    result: {
      data: {
        condition: {
          fixedProductMarketMakers: [
            {
              id: '0xfpmm1',
              question: {
                title: 'fpmm_title_1',
              },
            },
            {
              id: '0xfpmm2',
              question: {
                title: 'fpmm_title_2',
              },
            },
          ],
        },
      },
    },
  },
]

test('Pass conditionId with 1 omen market', async () => {
  await act(async () => {
    const { findByText, queryByText } = await renderWithConnectedProvider(
      <OmenMarketsOrQuestion conditionId={'0xconditionWith1FPMM'} />,
      mockQueryResult
    )

    const omenMarketTitle = await findByText(/^Omen Market$/i)
    const noInformation = await queryByText(/^Information not available$/i)
    expect(noInformation).toBeInTheDocument()
    expect(omenMarketTitle).not.toBeInTheDocument()
  })
})

xtest('Pass positionId with more than omen market', async () => {
  await act(async () => {
    const { findByText } = await renderWithConnectedProvider(
      <OmenMarketsOrQuestion positionId={'0x1'} />,
      mockQueryResult
    )

    const omenMarketTitle = await findByText(/^Omen Markets$/i)
    expect(omenMarketTitle).toBeInTheDocument()
  })
})

xtest('Pass positionId with no omen market', async () => {
  await act(async () => {
    const { findByText } = await renderWithConnectedProvider(
      <OmenMarketsOrQuestion positionId={'0x1'} />,
      mockQueryResult
    )

    const omenMarketTitle = await findByText(/^Question$/i)
    expect(omenMarketTitle).toBeInTheDocument()
  })
})

xtest('Pass conditionId with 1 omen market', async () => {
  await act(async () => {
    const { findByText } = await renderWithConnectedProvider(
      <OmenMarketsOrQuestion conditionId={'0x1'} />,
      mockQueryResult
    )

    const omenMarketTitle = await findByText(/^Omen Market$/i)
    expect(omenMarketTitle).toBeInTheDocument()
  })
})

xtest('Pass conditionId with more than omen market', async () => {
  await act(async () => {
    const { findByText } = await renderWithConnectedProvider(
      <OmenMarketsOrQuestion conditionId={'0x1'} />,
      mockQueryResult
    )

    const omenMarketTitle = await findByText(/^Omen Markets$/i)
    expect(omenMarketTitle).toBeInTheDocument()
  })
})

xtest('Pass conditionId no omen market', async () => {
  await act(async () => {
    const { findByText } = await renderWithConnectedProvider(
      <OmenMarketsOrQuestion conditionId={'0x1'} />,
      mockQueryResult
    )

    const omenMarketTitle = await findByText(/^Question$/i)
    expect(omenMarketTitle).toBeInTheDocument()
  })
})
