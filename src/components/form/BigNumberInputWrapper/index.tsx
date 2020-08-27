import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { ZERO_BN } from '../../../config/constants'
import { BigNumberInput } from '../../common/BigNumberInput'
import { Textfield } from '../../pureStyledComponents/Textfield'

const Wrapper = styled.span<{ hasTokenSymbol?: boolean }>`
  position: relative;
  width: 100%;

  > input {
    position: relative;
    z-index: 1;

    ${(props) => props.hasTokenSymbol && 'padding-right: 60px;'}

    &:disabled,
    &[disabled] {
      &::placeholder {
        color: #000;
      }
    }
  }
`

const TokenSymbol = styled.span`
  color: ${(props) => props.theme.colors.primary};
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  position: absolute;
  right: 11px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
`

interface Props {
  disabled?: boolean | undefined
  decimals?: number | undefined
  onChange?: (n: BigNumber) => void
  tokenSymbol?: string
  value?: BigNumber
  placeholder?: string | undefined
  max?: string
  min?: string
}

export const BigNumberInputWrapper: React.FC<Props> = (props) => {
  const {
    decimals = 0,
    disabled,
    max,
    min,
    onChange,
    placeholder,
    tokenSymbol = '',
    value,
    ...restProps
  } = props

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
    <Wrapper hasTokenSymbol={tokenSymbol !== ''} {...restProps}>
      <BigNumberInput
        decimals={decimals}
        max={max}
        min={min}
        onChange={handleChange}
        placeholder={placeholder}
        renderInput={(props: unknown) => {
          return <Textfield disabled={disabled} {...props} />
        }}
        value={value ? value.toString() : ''}
      />
      {tokenSymbol && <TokenSymbol>{tokenSymbol}</TokenSymbol>}
    </Wrapper>
  )
}
