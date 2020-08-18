import { formatBigNumber } from 'util/tools'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { BigNumber, formatUnits, parseUnits } from 'ethers/utils'
import React from 'react'

interface Props {
  amount: BigNumber
  onAmountChange: (value: BigNumber) => void
  onUseWalletBalance: () => void
  balance: BigNumber
  disabled: boolean
  decimals: number
  max: string
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
    <Row cols={'1fr'} marginBottomXL>
      <TitleValue
        title="Amount"
        titleControl={
          <TitleControl onClick={onUseWalletBalance}>
            Use Wallet Balance (${formatBigNumber(balance, decimals)})
          </TitleControl>
        }
        value={
          <BigNumberInputWrapper
            decimals={decimals}
            disabled={false}
            max={`${1e18}`}
            onChange={onAmountChange}
            value={amount}
          />
        }
      />
    </Row>
  )
}
