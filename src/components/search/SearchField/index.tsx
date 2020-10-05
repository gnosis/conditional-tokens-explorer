import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { ClearSearch } from 'components/icons/ClearSearch'
import { Magnifier } from 'components/icons/Magnifier'
import { Textfield } from 'components/pureStyledComponents/Textfield'

const Wrapper = styled.div`
  background-color: #fff;
  border: 1px solid ${(props) => props.theme.colors.mediumGrey};
  border-radius: 4px;
  display: flex;
  height: 32px;
  max-width: 100%;
  min-width: 436px;
`

const Input = styled(Textfield)`
  background-color: transparent;
  border-radius: 4px;
  flex-grow: 1;
  height: 100%;
  padding-left: 0;
  padding-right: 0;
  z-index: 1;

  &,
  &:focus,
  &:active {
    border: none;
  }
`

const SearchIconWrapper = styled.label`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 35px;
`

const ClearSearchButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  height: 100%;
  justify-content: center;
  outline: none;
  padding: 0;
  width: 35px;

  &:active {
    .fill {
      fill: #000;
    }
  }
`

interface Props {
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined
  onClear?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  placeholder?: string | undefined
  value: string | number | readonly string[] | undefined
}

export const SearchField: React.FC<Props> = (props) => {
  const { onChange, onClear, placeholder, value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <SearchIconWrapper htmlFor="searchField">
        <Magnifier />
      </SearchIconWrapper>
      <Input
        id="searchField"
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {onClear && (
        <ClearSearchButton onClick={onClear}>
          <ClearSearch />
        </ClearSearchButton>
      )}
    </Wrapper>
  )
}
