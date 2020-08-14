import { Remote } from 'util/remoteData'

import { MockedProvider } from '@apollo/react-testing'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ZERO_BN } from 'config/constants'
import { NetworkConfig } from 'config/networkConfig'
import { Connected, Web3Context, Web3ContextStatus } from 'contexts/Web3Context'
import { BigNumber } from 'ethers/utils'
import React, { ReactElement } from 'react'
import { act } from 'react-dom/test-utils'
import { ThemeProvider } from 'styled-components'
import theme from 'theme'

import { Form } from './Form'

const unlockCollateral = jest.fn()
const onCollateralChange = jest.fn()
const splitPosition = jest.fn()
const hasUnlockedCollateral = false
const networkConfig = new NetworkConfig(4)
const tokens = networkConfig.getTokens()
// eslint-disable-next-line
const CTService = jest.mock('services/conditionalTokens') as any

const connect = jest.fn()
const disconnect = jest.fn()

const connectedStatus = {
  _type: Web3ContextStatus.Connected,
  address: '0x123',
  CTService,
  networkConfig,
  // eslint-disable-next-line
  provider: null as any,
  // eslint-disable-next-line
  signer: null as any,
} as Connected

const renderWithConnectedProvider = (component: ReactElement) => (
  <Web3Context.Provider value={{ status: connectedStatus, connect, disconnect }}>
    <ThemeProvider theme={theme}>
      <MockedProvider>{component}</MockedProvider>
    </ThemeProvider>
  </Web3Context.Provider>
)

test('show unlock button with zero allowance', async () => {
  const allowance = Remote.success<BigNumber>(ZERO_BN)

  const { findByTestId } = render(
    renderWithConnectedProvider(
      <Form
        allowance={allowance}
        hasUnlockedCollateral={hasUnlockedCollateral}
        onCollateralChange={onCollateralChange}
        splitPosition={splitPosition}
        tokens={tokens}
        unlockCollateral={unlockCollateral}
      />
    )
  )
  const unlockBtn = await findByTestId('unlock-btn')
  expect(unlockBtn).toBeInTheDocument()
})

test('toggle unlock button visiblity according to allowance and amount', async () => {
  const allowance = Remote.success<BigNumber>(new BigNumber(10))

  const { findByPlaceholderText, findByTestId } = render(
    renderWithConnectedProvider(
      <Form
        allowance={allowance}
        hasUnlockedCollateral={hasUnlockedCollateral}
        onCollateralChange={onCollateralChange}
        splitPosition={splitPosition}
        tokens={tokens}
        unlockCollateral={unlockCollateral}
      />
    )
  )

  const unlockBefore = findByTestId('unlockButton')
  expect(unlockBefore).toMatchObject({})

  const amountInput = await findByPlaceholderText('0.00')
  await act(async () => {
    return userEvent.type(amountInput, '20')
  })
  const unlockAfter = await findByTestId('unlock-btn')

  expect(unlockAfter).toBeInTheDocument()
})

test('show unlock button after failure', async () => {
  const allowance = Remote.success<BigNumber>(ZERO_BN)
  const allowanceFailure = Remote.failure<BigNumber>(new Error('Metamask cancelled'))

  const { findByTestId, rerender } = render(
    renderWithConnectedProvider(
      <Form
        allowance={allowance}
        hasUnlockedCollateral={hasUnlockedCollateral}
        onCollateralChange={onCollateralChange}
        splitPosition={splitPosition}
        tokens={tokens}
        unlockCollateral={unlockCollateral}
      />
    )
  )

  const unlock = await findByTestId('unlock-btn')
  act(() => {
    return userEvent.click(unlock)
  })

  rerender(
    renderWithConnectedProvider(
      <Form
        allowance={allowanceFailure}
        hasUnlockedCollateral={true}
        onCollateralChange={onCollateralChange}
        splitPosition={splitPosition}
        tokens={tokens}
        unlockCollateral={unlockCollateral}
      />
    )
  )

  const unlockAfterFailure = await findByTestId('unlock-btn')
  expect(unlockAfterFailure).toBeInTheDocument()
})
