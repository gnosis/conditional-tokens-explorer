import { BigNumberInput } from 'big-number-input'
import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { ZERO_BN } from '../../../config/constants'
import { TextfieldCSS } from '../../pureStyledComponents/Textfield'

const Wrapper = styled.span`
  position: relative;
  width: 100%;

  > input {
    ${TextfieldCSS}
    padding-right: 60px;
    position: relative;
    z-index: 1;
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
  decimals?: number | undefined
  onChange?: (n: BigNumber) => void
  tokenSymbol?: string
  value?: BigNumber
}

export const BigNumberInputWrapper: React.FC<Props> = (props) => {
  const { decimals = 0, onChange, tokenSymbol, value } = props

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
    <Wrapper>
      <BigNumberInput
        decimals={decimals}
        onChange={handleChange}
        value={value ? value.toString() : ''}
      />
      {tokenSymbol && <TokenSymbol>{tokenSymbol}</TokenSymbol>}
    </Wrapper>
  )
}
