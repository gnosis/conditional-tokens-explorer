import React from 'react'
import styled from 'styled-components'

import { DropdownItem } from 'components/common/Dropdown'

const Wrappper = styled(DropdownItem)`
  padding: 0;
`

const Option = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: ${(props) => props.theme.dropdown.item.height};
  padding: 0 ${(props) => props.theme.dropdown.item.paddingHorizontal};
  position: relative;
  width: 100%;
`

const Radio = styled.input`
  height: 100%;
  opacity: 0;
  position: absolute;
  width: 100%;
  z-index: 5;
`

const Content = styled.span`
  position: relative;
  z-index: 1;
`

interface Props {
  content: React.ReactNode | string
  name: string
  radioRef?:
    | ((instance: HTMLInputElement | null) => void)
    | React.RefObject<HTMLInputElement>
    | null
    | undefined
  value: string
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined
}

export const SelectItem: React.FC<Props> = (props) => {
  const { content, name, radioRef, value, ...restProps } = props

  return (
    <Wrappper {...restProps}>
      <Option>
        <Radio name={name} ref={radioRef} type="radio" value={value} />
        <Content>{content}</Content>
      </Option>
    </Wrappper>
  )
}
