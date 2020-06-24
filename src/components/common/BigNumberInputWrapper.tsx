import React from 'react'
import { BigNumberInput } from 'big-number-input'
import { BigNumber } from 'ethers/utils'
import { ZERO_BN } from '../../config/constants'

interface Props {
  value?: BigNumber
  onChange?: (n: BigNumber) => void
  decimals?: number
}

export const BigNumberInputWrapper = (props: Props) => {
  const { value, onChange, decimals = 0 } = props

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
