import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { ArrowDown } from '../../icons/ArrowDown'
import { ArrowUp } from '../../icons/ArrowUp'

export enum ButtonBulkMoveActions {
  add = 'add',
  remove = 'remove',
}

export enum ButtonBulkMoveDirection {
  down = 'down',
  up = 'up',
}

const Wrapper = styled.button<{ action: ButtonBulkMoveActions }>`
  align-items: center;
  background: transparent;
  border-radius: 50%;
  border: none;
  border: solid 2px ${(props) => props.theme.colors.darkGrey};
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

  path {
    fill: ${(props) => props.theme.colors.darkGrey};
    transition: all 0.15s ease-out;
  }

  ${(props) =>
    props.action === ButtonBulkMoveActions.add &&
    `
        border-color: ${props.theme.colors.primary};
        path {
          fill: ${props.theme.colors.primary};
        }
      `}

  ${(props) =>
    props.action === ButtonBulkMoveActions.remove &&
    `
        border-color: ${props.theme.colors.error};
        path {
          fill: ${props.theme.colors.error};
        }
      `}

  &:hover {
    ${(props) =>
      props.action === ButtonBulkMoveActions.add &&
      `
        background-color: ${props.theme.colors.primary};
        border-color: ${props.theme.colors.primary};
        path {
          fill: #fff;
        }
      `}

    ${(props) =>
      props.action === ButtonBulkMoveActions.remove &&
      `
        background-color: ${props.theme.colors.error};
        border-color: ${props.theme.colors.error};
        path {
          fill: #fff;
        }
      `}
  }

  &[disabled],
  &[disabled]:hover {
    background: transparent;
    border-color: ${(props) => props.theme.colors.darkGrey};
    cursor: not-allowed;
    opacity: 0.5;

    path {
      fill: ${(props) => props.theme.colors.darkGrey};
    }
  }
`

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
