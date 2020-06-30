import React, { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { SplitCondition } from './SplitCondition'
import { Remote } from '../../util/remoteData'
import { BigNumber } from 'ethers/utils'
import { NetworkConfig } from '../../config/networkConfig'
import { ZERO_BN } from '../../config/constants'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/react-testing'
import { Signer } from 'ethers/ethers'
import { JsonRpcProvider } from 'ethers/providers'
import { Connected, Web3Context } from 'contexts/Web3Context'

const unlockCollateral = jest.fn()
const onCollateralChange = jest.fn()
const splitPosition = jest.fn()
const hasUnlockedCollateral = false
const networkConfig = new NetworkConfig(4)
const tokens = networkConfig.getTokens()
// eslint-disable-next-line
const CTService = jest.mock('../../services/conditionalTokens') as any

const connect = jest.fn()
const connectedStatus = {
  _type: 'connected',
  address: '0x123',
  CTService,
  networkConfig,
  provider: null as any,
  signer: null as any,
} as Connected

const renderWithConnectedProvider = (component: ReactElement) => (
  <Web3Context.Provider value={{ status: connectedStatus, connect }}>
    <MockedProvider>{component}</MockedProvider>
  </Web3Context.Provider>
)

test('show unlock button with zero allowance', async () => {
  const allowance = Remote.success<BigNumber>(ZERO_BN)

  const { findByText } = render(
    renderWithConnectedProvider(
      <SplitCondition
        allowance={allowance}
        splitPosition={splitPosition}
        unlockCollateral={unlockCollateral}
        onCollateralChange={onCollateralChange}
        hasUnlockedCollateral={hasUnlockedCollateral}
        tokens={tokens}
      />
    )
  )
  const unlockBtn = await findByText(/unlock/i)
  expect(unlockBtn).toBeInTheDocument()
})

test('toggle unlock button visiblity according to allowance and amount', async () => {
  const allowance = Remote.success<BigNumber>(new BigNumber(10))

  const { findByText, queryByText, findByPlaceholderText } = render(
    renderWithConnectedProvider(
      <SplitCondition
        allowance={allowance}
        splitPosition={splitPosition}
        unlockCollateral={unlockCollateral}
        onCollateralChange={onCollateralChange}
        hasUnlockedCollateral={hasUnlockedCollateral}
        tokens={tokens}
      />
    )
  )

  const unlockBefore = queryByText(/unlock/i)
  expect(unlockBefore).toBeNull()

  const amountInput = await findByPlaceholderText('0.00')
  await act(async () => {
    return userEvent.type(amountInput, '20')
  })
  const unlockAfter = await findByText(/unlock/i)

  expect(unlockAfter).toBeInTheDocument()
})

test('show unlock button after failure', async () => {
  const allowance = Remote.success<BigNumber>(ZERO_BN)
  const allowanceFailure = Remote.failure<BigNumber>(new Error('Metamask cancelled'))

  const { findByText, rerender } = render(
    renderWithConnectedProvider(
      <SplitCondition
        allowance={allowance}
        unlockCollateral={unlockCollateral}
        splitPosition={splitPosition}
        onCollateralChange={onCollateralChange}
        hasUnlockedCollateral={hasUnlockedCollateral}
        tokens={tokens}
      />
    )
  )

  const unlock = await findByText(/unlock/i)
  act(() => {
    return userEvent.click(unlock)
  })

  rerender(
    renderWithConnectedProvider(
      <SplitCondition
        allowance={allowanceFailure}
        splitPosition={splitPosition}
        unlockCollateral={unlockCollateral}
        onCollateralChange={onCollateralChange}
        hasUnlockedCollateral={true}
        tokens={tokens}
      />
    )
  )

  const unlockAfterFailure = await findByText(/unlock/i)
  expect(unlockAfterFailure).toBeInTheDocument()
})
