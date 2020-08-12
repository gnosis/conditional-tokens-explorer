import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styled from 'styled-components'

import { CopyIcon } from './img/CopyIcon'

const Wrapper = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  height: 15px;
  margin: 0 0 0 12px;
  outline: none;
  padding: 0;
  width: 13px;

  &:active {
    opacity: 0.7;
  }

  &:hover {
    svg {
      path {
        fill: ${(props) => props.theme.colors.primary};
      }
    }
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

interface ButtonCopyProps {
  value: unknown
}

export const ButtonCopy: React.FC<ButtonCopyProps> = (props) => {
  const { value, ...restProps } = props

  return (
    <CopyToClipboard text={value}>
      <Wrapper {...restProps}>
        <CopyIcon />
      </Wrapper>
    </CopyToClipboard>
  )
}
