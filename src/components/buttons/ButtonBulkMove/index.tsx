import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { ArrowDown } from '../../icons/ArrowDown'
import { ArrowUp } from '../../icons/ArrowUp'

const Wrapper = styled.button<{ action: ButtonBulkMoveActions }>`
  align-items: center;
  background: transparent;
  border-radius: 50%;
  border: none;
  border: solid 2px ${(props) => props.theme.colors.mediumGrey};
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

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export enum ButtonBulkMoveActions {
  add = 'add',
  remove = 'remove',
}

export enum ButtonBulkMoveDirection {
  down = 'down',
  up = 'up',
}

interface ButtonBulkMoveProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action: ButtonBulkMoveActions
  direction: ButtonBulkMoveDirection
}

export const ButtonBulkMove: React.FC<ButtonBulkMoveProps> = (props) => {
  const { action, direction, ...restProps } = props

  return (
    <Wrapper action={action} {...restProps}>
      {direction === ButtonBulkMoveDirection.up && <ArrowUp />}
      {direction === ButtonBulkMoveDirection.down && <ArrowDown />}
    </Wrapper>
  )
}
