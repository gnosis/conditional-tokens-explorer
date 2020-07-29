import { BigNumberInput } from 'big-number-input'
import { BigNumber } from 'ethers/utils'
import React from 'react'

import { ZERO_BN } from '../../../config/constants'

interface Props {
  value?: BigNumber
  onChange?: (n: BigNumber) => void
  decimals?: number
}

export const BigNumberInputWrapper = (props: Props) => {
  const { decimals = 0, onChange, value } = props

  const handleChange = (newValue: string) => {
    if (onChange) {
      if (newValue) {
        onChange(new BigNumber(newValue))
      } else {
        onChange(ZERO_BN)
      }
    }
  }

  return (
    <BigNumberInput
      autofocus={true}
      decimals={decimals}
      onChange={handleChange}
      value={value ? value.toString() : ''}
    />
  )
}
