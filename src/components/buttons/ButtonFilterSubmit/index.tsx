import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { IconSubmit } from 'components/icons/IconSubmit'

const Wrapper = styled.button`
  align-items: center;
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid ${(props) => props.theme.buttonPrimary.backgroundColor};
  cursor: pointer;
  display: flex;
  height: 32px;
  justify-content: center;
  outline: none;
  padding: 0;
  transition: all 0.15s ease-out;
  width: 32px;

  .fill {
    fill: ${(props) => props.theme.buttonPrimary.backgroundColor};
  }

  &:hover {
    background-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
    border-color: ${(props) => props.theme.buttonPrimary.borderColor};

    .fill {
      fill: #fff;
    }
  }

  &[disabled] {
    background-color: #fff;
    border-color: ${(props) => props.theme.buttonPrimary.backgroundColor};
    cursor: not-allowed;
    opacity: 0.5;

    .fill {
      fill: ${(props) => props.theme.buttonPrimary.backgroundColor};
    }
  }
`

export const ButtonFilterSubmit: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <IconSubmit />
    </Wrapper>
  )
}
