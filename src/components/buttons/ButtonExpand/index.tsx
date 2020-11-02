import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { ExpandIcon } from 'components/icons/ExpandIcon'

const Wrapper = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  margin-left: 8px;
  outline: none;
  padding: 0;

  &:hover {
    filter: brightness(50%);
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      filter: none;
    }
  }
`

type Props = ButtonHTMLAttributes<HTMLButtonElement>

export const ButtonExpand: React.FC<Props> = (props) => {
  const { onClick, ...restProps } = props

  return (
    <Wrapper onClick={onClick} {...restProps}>
      <ExpandIcon />
    </Wrapper>
  )
}
