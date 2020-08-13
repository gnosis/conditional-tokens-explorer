import { formatBigNumber } from 'util/tools'
import { Token } from 'util/types'

import { BigNumberInputWrapper } from 'components/form/BigNumberInputWrapper'
import { Row } from 'components/pureStyledComponents/Row'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { ZERO_BN } from 'config/constants'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'

interface Props {
  amount: BigNumber
  onAmountChange: (value: BigNumber) => void
  onUseWalletBalance: () => void
  balance: BigNumber
  disabled: boolean
  decimals: number
}

export const Amount = ({
  amount,
  balance,
  decimals,
  disabled,
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
            disabled={disabled}
            onChange={onAmountChange}
            value={amount}
          />
        }
      />
    </Row>
  )
}
