import { BigNumber } from 'ethers/utils'
import React from 'react'

import { formatBigNumber } from '../../../util/tools'
import { BigNumberInputWrapper } from '../../form/BigNumberInputWrapper'
import { TitleControlButton } from '../../pureStyledComponents/TitleControl'
import { TitleValue } from '../../text/TitleValue'

interface Props {
  amount: BigNumber
  balance: BigNumber
  decimals: number
  disabled: boolean
  max: string
  onAmountChange: (value: BigNumber) => void
  onUseWalletBalance: () => void
  tokenSymbol?: string
}

export const Amount = ({
  amount,
  balance,
  decimals,
  disabled,
  onAmountChange,
  onUseWalletBalance,
  tokenSymbol,
}: Props) => {
  const disable = amount.isZero() || disabled

  return (
    <TitleValue
      title="Amount"
      titleControl={
        <TitleControlButton disabled={disable} onClick={onUseWalletBalance}>
          Use Wallet Balance (${formatBigNumber(balance, decimals)})
        </TitleControlButton>
      }
      value={
        <BigNumberInputWrapper
          decimals={decimals}
          disabled={disable}
          max={`${1e18}`}
          onChange={onAmountChange}
          tokenSymbol={tokenSymbol}
          value={amount}
        />
      }
    />
  )
}
