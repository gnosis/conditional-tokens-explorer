import React, { useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'
import styled from 'styled-components'

import { SplitPositionFormMethods } from '../../../pages/SplitPosition/Form'
import { Token } from '../../../util/types'

const Wrapper = styled.div``

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

  useEffect(() => {
    onCollateralChange(watchCollateral)
  }, [watchCollateral, onCollateralChange])

  return (
    <Wrapper {...restProps}>
      {/* <select
        disabled={!splitFromCollateral}
        name="collateral"
        ref={register({ required: splitFromCollateral })}
      >
        {tokens.map(({ address, symbol }) => {
          return (
            <option key={address} value={address}>
              {symbol}
            </option>
          )
        })}
      </select> */}
      {tokens.map(({ address, symbol }) => {
        return (
          <label key={address}>
            <input
              name="collateral"
              ref={register({ required: splitFromCollateral })}
              type="radio"
              value={address}
            />
            {symbol}
          </label>
        )
      })}
    </Wrapper>
  )
}
