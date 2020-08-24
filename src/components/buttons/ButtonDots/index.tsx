import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { Dots } from '../../icons/Dots'
import { ButtonProps } from '../buttonStylingTypes'

const Wrapper = styled.button`
  align-items: center;
  background: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: 30px;
  justify-content: center;
  line-height: 1.2;
  outline: none;
  padding: 0;
  text-align: center;
  transition: all 0.15s ease-out;
  user-select: none;
  width: 30px;

  .isOpen &,
  &:hover {
    background-color: ${(props) => props.theme.colors.whitesmoke2};

    svg {
      rect {
        fill: ${(props) => props.theme.colors.darkerGray};
      }
    }
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const ButtonDots: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (
  props: ButtonProps
) => {
  const { ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Dots />
    </Wrapper>
  )
}
