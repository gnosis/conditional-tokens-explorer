import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { IconPlus } from '../../icons/IconPlus'

const Wrapper = styled.button`
  align-items: center;
  background-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme.buttonPrimary.borderColor};
  cursor: pointer;
  display: flex;
  height: 36px;
  justify-content: center;
  outline: none;
  padding: 0;
  transition: all 0.15s ease-out;
  width: 36px;

  &:hover {
    border-color: ${(props) => props.theme.buttonPrimary.borderColorHover};
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColorHover};
  }

  &[disabled] {
    background-color: ${(props) => props.theme.buttonPrimary.borderColor};
    border-color: ${(props) => props.theme.buttonPrimary.borderColor};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const ButtonAdd: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <IconPlus />
    </Wrapper>
  )
}
