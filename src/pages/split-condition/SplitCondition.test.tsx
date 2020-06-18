import React from 'react'
import { render, screen } from '@testing-library/react'
import { SplitCondition } from './SplitCondition'
import { Remote } from '../../util/remoteData'
import { BigNumber } from 'ethers/utils'
import { NetworkConfig } from '../../config/networkConfig'
import { ZERO_BN } from '../../config/constants'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'

const unlockCollateral = jest.fn()
const onCollateralChange = jest.fn()
const hasUnlockedCollateral = false
const networkConfig = new NetworkConfig(4)
const tokens = networkConfig.getTokens()
const CTService = jest.mock('../../services/conditionalTokens') as any

test('show unlock allowance with zero allowance', async () => {
  const allowance = Remote.success<BigNumber>(ZERO_BN)

  const { findByText } = render(
    <SplitCondition
      allowance={allowance}
      unlockCollateral={unlockCollateral}
      onCollateralChange={onCollateralChange}
      hasUnlockedCollateral={hasUnlockedCollateral}
      ctService={CTService}
      tokens={tokens}
    />
  )
  const unlockBtn = await findByText(/unlock/i)
  expect(unlockBtn).toBeInTheDocument()
})

test('dont show unlock allowance with not enough allowance', async () => {
  const allowance = Remote.success<BigNumber>(new BigNumber(10))

  const { findByText, queryByText } = render(
    <SplitCondition
      allowance={allowance}
      unlockCollateral={unlockCollateral}
      onCollateralChange={onCollateralChange}
      hasUnlockedCollateral={hasUnlockedCollateral}
      ctService={CTService}
      tokens={tokens}
    />
  )

  const unlockBefore = queryByText(/unlock/i)
  expect(unlockBefore).toBeNull()

  const amountInput = await screen.findByPlaceholderText('0.00')
  await act(() => {
    return userEvent.type(amountInput, '20')
  })
  const unlockAfter = await findByText(/unlock/i)

  expect(unlockAfter).toBeInTheDocument()
})
