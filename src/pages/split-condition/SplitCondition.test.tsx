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
import { ZERO_BN } from '../../config/constants'

test('show unlock allowance with zero allowance', async () => {
  const allowance = Remote.success<BigNumber>(ZERO_BN)
  const unlockCollateral = jest.fn()
  const onCollateralChange = jest.fn()
  const hasUnlockedCollateral = false
  const networkConfig = new NetworkConfig(4)
  const tokens = networkConfig.getTokens()
  const CTService = jest.mock('../../services/conditionalTokens') as any

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
