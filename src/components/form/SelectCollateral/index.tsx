import React, { useEffect, useState } from 'react'
import { FormContextValues } from 'react-hook-form'

import { SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Token } from '../../../util/types'
import { ButtonSelect } from '../../buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from '../../common/Dropdown'
import { TokenIcon } from '../../common/TokenIcon'
import { SelectItem } from '../../form/SelectItem'

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
  const button = <ButtonSelect content={<TokenIcon symbol={collateral} />} />
  const dropdownItems = tokens.map(({ address, symbol }) => {
    return (
      <SelectItem
        content={<TokenIcon symbol={symbol} />}
        key={address}
        name="collateral"
        onClick={() => {
          setCollateral(symbol)
        }}
        ref={register({ required: splitFromCollateral })}
        value={address}
      />
    )
  })

  useEffect(() => {
    onCollateralChange(watchCollateral)
  }, [watchCollateral, onCollateralChange])

  return (
    <Dropdown
      {...restProps}
      dropdownButtonContent={button}
      dropdownPosition={DropdownPosition.center}
      fullWidth
      items={dropdownItems}
    />
  )
}
