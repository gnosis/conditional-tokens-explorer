import React, { useEffect, useState } from 'react'
import { FormContextValues } from 'react-hook-form'
import styled from 'styled-components'

import { SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Token } from '../../../util/types'
import { Dropdown, DropdownPosition } from '../../common/Dropdown'
import { TokenIcon } from '../../common/TokenIcon'

import { ChevronDown } from './img/ChevronDown'

const Wrapper = styled(Dropdown)`
  .dropdownItems {
    width: 100%;
  }

  .dropdownItem {
    padding: 0;
  }
`

const Button = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.textField.backgroundColor};
  border-color: ${(props) => props.theme.textField.borderColor};
  border-radius: ${(props) => props.theme.textField.borderRadius};
  border-style: ${(props) => props.theme.textField.borderStyle};
  border-width: ${(props) => props.theme.textField.borderWidth};
  color: ${(props) => props.theme.textField.color};
  display: flex;
  font-size: ${(props) => props.theme.textField.fontSize};
  font-weight: ${(props) => props.theme.textField.fontWeight};
  height: ${(props) => props.theme.textField.height};
  justify-content: space-between;
  outline: none;
  padding: 0 ${(props) => props.theme.textField.paddingHorizontal};
  width: 100%;

  .isOpen & {
    background-color: ${(props) => props.theme.textField.backgroundColorActive};
    border-color: ${(props) => props.theme.textField.borderColorActive};
  }
`

const Item = styled.label`
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
  const button = (
    <Button>
      <TokenIconStyled symbol={collateral} /> <ChevronDown />
    </Button>
  )
  const dropdownItems = tokens.map(({ address, symbol }) => {
    return {
      content: (
        <Item key={address}>
          <Radio
            name="collateral"
            ref={register({ required: splitFromCollateral })}
            type="radio"
            value={address}
          />
          <TokenIconStyled symbol={symbol} />
        </Item>
      ),
      onClick: () => {
        setCollateral(symbol)
      },
    }
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
