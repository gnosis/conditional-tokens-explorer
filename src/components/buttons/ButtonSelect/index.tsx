import React from 'react'
import styled from 'styled-components'

import { ChevronDown } from '../../buttons/ButtonSelect/img/ChevronDown'

const Wrapper = styled.div`
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

interface Props {
  content: React.ReactNode
}

export const ButtonSelect: React.FC<Props> = (props) => {
  const { content, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      {content}
      <ChevronDown />
    </Wrapper>
  )
}
