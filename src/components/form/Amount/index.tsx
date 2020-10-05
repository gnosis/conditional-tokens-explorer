import { BigNumber } from 'ethers/utils'
import React from 'react'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { TitleControlButton } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { formatBigNumber } from 'util/tools'

interface Props {
  amount: BigNumber
  balance: BigNumber
  decimals: number
  disabled?: boolean
  max: string
  onAmountChange: (value: BigNumber) => void
  onUseWalletBalance: () => void
  tokenSymbol?: string
  isFromAPosition?: boolean
}

export const Amount = ({
  amount,
  balance,
  decimals,
  disabled,
  isFromAPosition = false,
  max,
  onAmountChange,
  onUseWalletBalance,
  tokenSymbol,
}: Props) => {
  const { _type: status } = useWeb3ConnectedOrInfura()

  const isDisconnected = status !== Web3ContextStatus.Connected

  return (
    <TitleValue
      title="Amount"
      titleControl={
        isDisconnected || !balance ? (
          <TitleControlButton disabled>Not Connected To Wallet</TitleControlButton>
        ) : (
          <TitleControlButton disabled={disabled} onClick={onUseWalletBalance}>
            Use {isFromAPosition ? 'Position' : 'Wallet'} Balance ($
            {formatBigNumber(balance, decimals)})
          </TitleControlButton>
        )
      }
      value={
        <BigNumberInputWrapper
          decimals={decimals}
          disabled={disabled}
          max={max}
          onChange={onAmountChange}
          tokenSymbol={tokenSymbol}
          value={amount}
        />
      }
    />
  )
}
