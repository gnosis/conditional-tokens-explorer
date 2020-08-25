import React from 'react'
import styled from 'styled-components'

import { Magnifier } from '../../icons/Magnifier'
import { Textfield } from '../../pureStyledComponents/Textfield'

const Wrapper = styled.div``

const Input = styled(Textfield)``

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
    </Wrapper>
  )
}
