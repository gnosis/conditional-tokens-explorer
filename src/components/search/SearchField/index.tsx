import React from 'react'
import styled from 'styled-components'

import { Magnifier } from 'components/icons/Magnifier'
import { Textfield } from 'components/pureStyledComponents/Textfield'

const Wrapper = styled.label`
  display: block;
  height: 32px;
  max-width: 100%;
  position: relative;
  width: 368px;
`

const Input = styled(Textfield)`
  border-color: ${(props) => props.theme.colors.lightGrey};
  flex-grow: 1;
  height: 100%;
  padding-left: 36px;
  z-index: 1;
`

const Icon = styled(Magnifier)`
  left: 12px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 12;
`

interface Props {
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined
  placeholder?: string | undefined
  value: string | number | readonly string[] | undefined
}

export const SearchField: React.FC<Props> = (props) => {
  const { onChange, placeholder, value, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Input onChange={onChange} placeholder={placeholder} type="text" value={value} />
      <Icon />
    </Wrapper>
  )
}
