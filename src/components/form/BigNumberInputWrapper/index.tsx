import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { BigNumberInput } from 'components/form/BigNumberInput'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { ZERO_BN } from 'config/constants'

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
  autoFocus?: boolean
  decimals?: number
  disabled?: boolean
  max?: string
  min?: string
  onChange?: (n: BigNumber) => void
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void | undefined
  placeholder?: string
  tokenSymbol?: string
  value?: BigNumber
}

export const BigNumberInputWrapper: React.FC<Props> = (props) => {
  const {
    autoFocus,
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
      if (newValue && newValue !== '.') {
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
          return <Textfield autoFocus={autoFocus} disabled={disabled} {...props} />
        }}
        value={value ? value.toString() : ''}
      />
      {tokenSymbol && <TokenSymbol>{tokenSymbol}</TokenSymbol>}
    </Wrapper>
  )
}
