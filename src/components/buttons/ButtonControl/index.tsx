import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { IconDelete } from 'components/icons/IconDelete'
import { IconEdit } from 'components/icons/IconEdit'
import { IconOk } from 'components/icons/IconOk'
import { IconPlus } from 'components/icons/IconPlus'

const Wrapper = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  height: 20px;
  outline: none;
  padding: 0;
  width: 20px;

  path {
    fill: ${(props) => props.theme.colors.darkGrey};
  }

  &:hover {
    path {
      fill: ${(props) => props.theme.colors.primary};
    }

    .iconDelete {
      path {
        fill: ${(props) => props.theme.colors.delete};
      }
    }
  }

  &:active {
    opacity: 0.6;
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;

    svg {
      path {
        fill: ${(props) => props.theme.colors.darkGrey}!important;
      }
    }
  }
`

export enum ButtonControlType {
  ok = 1,
  delete = 2,
  edit = 3,
  add = 4,
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: ButtonControlType
}

export const ButtonControl: React.FC<Props> = (props) => {
  const { buttonType = ButtonControlType.ok, ...restProps } = props
  return (
    <Wrapper {...restProps}>
      {buttonType === ButtonControlType.delete && <IconDelete />}
      {buttonType === ButtonControlType.ok && <IconOk />}
      {buttonType === ButtonControlType.edit && <IconEdit />}
      {buttonType === ButtonControlType.add && <IconPlus />}
    </Wrapper>
  )
}
