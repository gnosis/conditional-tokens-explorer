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
