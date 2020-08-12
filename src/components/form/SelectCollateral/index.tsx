import React, { useEffect, useState } from 'react'
import { FormContextValues } from 'react-hook-form'
import styled from 'styled-components'

import { SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Token } from '../../../util/types'
import { ButtonSelect } from '../../buttons/ButtonSelect'
import { Dropdown, DropdownItem, DropdownPosition } from '../../common/Dropdown'
import { TokenIcon } from '../../common/TokenIcon'

const Wrapper = styled(Dropdown)`
  .dropdownItems {
    width: 100%;
  }
`

const DropdownItemStyled = styled(DropdownItem)`
  padding: 0;
`

const Option = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: ${(props) => props.theme.dropdown.item.height};
  padding: 0 ${(props) => props.theme.dropdown.item.paddingHorizontal};
  position: relative;
  width: 100%;
`

const Radio = styled.input`
  height: 100%;
  opacity: 0;
  position: absolute;
  width: 100%;
  z-index: 5;
`

const TokenIconStyled = styled(TokenIcon)`
  position: relative;
  z-index: 1;
`

export interface SelectCollateralProps {
  formMethods: FormContextValues<SplitPositionFormMethods>
  onCollateralChange: (c: string) => void
  splitFromCollateral: boolean
  tokens: Token[]
}

export const SelectCollateral = ({
  formMethods: { register, watch },
  onCollateralChange,
  splitFromCollateral,
  tokens,
  ...restProps
}: SelectCollateralProps) => {
  const watchCollateral = watch('collateral')
  const [collateral, setCollateral] = useState(tokens[0].symbol)
  const button = <ButtonSelect content={<TokenIconStyled symbol={collateral} />} />
  const dropdownItems = tokens.map(({ address, symbol }) => {
    return (
      <DropdownItemStyled
        key={address}
        onClick={() => {
          setCollateral(symbol)
        }}
      >
        <Option>
          <Radio
            name="collateral"
            ref={register({ required: splitFromCollateral })}
            type="radio"
            value={address}
          />
          <TokenIconStyled symbol={symbol} />
        </Option>
      </DropdownItemStyled>
    )
  })

  useEffect(() => {
    onCollateralChange(watchCollateral)
  }, [watchCollateral, onCollateralChange])

  return (
    <Wrapper
      {...restProps}
      dropdownButtonContent={button}
      dropdownPosition={DropdownPosition.center}
      items={dropdownItems}
    />
  )
}
