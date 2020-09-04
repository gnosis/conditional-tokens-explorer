import { BigNumber } from 'ethers/utils'
import React from 'react'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { TitleControlButton } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { formatBigNumber } from 'util/tools'

interface Props {
  amount: BigNumber
  balance: BigNumber
  decimals: number
  disabled: boolean
  max: string
  onAmountChange: (value: BigNumber) => void
  onUseWalletBalance: () => void
}

export const Amount = ({
  amount,
  balance,
  decimals,
  disabled,
  max,
  onAmountChange,
  onUseWalletBalance,
}: Props) => {
  return (
    <TitleValue
      title="Amount"
      titleControl={
        <TitleControlButton disabled={disabled} onClick={onUseWalletBalance}>
          Use Wallet Balance (${formatBigNumber(balance, decimals)})
        </TitleControlButton>
      }
      value={
        <BigNumberInputWrapper
          decimals={decimals}
          disabled={disabled}
          max={max}
          onChange={onAmountChange}
          value={amount}
        />
      }
    />
  )
}
