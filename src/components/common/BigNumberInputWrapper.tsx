import React from 'react'
import { BigNumberInput } from 'big-number-input'
import { BigNumber } from 'ethers/utils'
import { ZERO_BN } from '../../config/constants'

interface Props {
  value: BigNumber
  onChange: (n: BigNumber) => void
  decimals: number
}

export const BigNumberInputWrapper = (props: Props) => {
  const { value, onChange, decimals } = props
  return (
    <BigNumberInput
      autofocus={true}
      decimals={decimals}
      onChange={(newValue) => (newValue ? onChange(new BigNumber(newValue)) : onChange(ZERO_BN))}
      value={value ? value.toString() : ''}
    />
  )
}
