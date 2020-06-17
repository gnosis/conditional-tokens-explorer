import React from 'react'
import { render } from '@testing-library/react'
import { SplitCondition } from './SplitCondition'
import { Remote } from '../../util/remoteData'
import { BigNumber } from 'ethers/utils'
import { Web3Context, Connected } from '../../contexts/Web3Context'
import { NetworkConfig } from '../../config/networkConfig'
import { Signer } from 'ethers/ethers'
import { Provider } from 'ethers/providers'
import { ConditionalTokensService } from '../../services/conditionalTokens'

test('renders learn react link', () => {
  const allowance = Remote.notAsked<BigNumber>()
  const unlockCollateral = jest.fn()
  const onCollateralChange = jest.fn()
  const hasUnlockedCollateral = false
  const connect = jest.fn()
  const provider = jest.mock('ethers/providers') as any
  const signer = jest.mock('ethers/providers') as any
  const networkConfig = new NetworkConfig(4) as any
  const CTService = jest.mock('../../services/conditionalTokens') as any

  const context = {
    _type: 'connected',
    provider,
    address: '',
    signer,
    networkConfig,
    CTService,
  } as Connected

  const { getByText } = render(
    <Web3Context.Provider value={{ status: context, connect }}>
      <SplitCondition
        allowance={allowance}
        unlockCollateral={unlockCollateral}
        onCollateralChange={onCollateralChange}
        hasUnlockedCollateral={hasUnlockedCollateral}
      />
    </Web3Context.Provider>
  )
  const unlockBtn = getByText(/condition/i)
  expect(unlockBtn).toBeInTheDocument()
})
