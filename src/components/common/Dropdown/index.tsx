import React, { DOMAttributes, useCallback, useState } from 'react'
import styled, { css } from 'styled-components'

import { BaseCard } from '../../pureStyledComponents/common'

export enum DropdownPosition {
  center,
  left,
  right,
}

export enum DropdownDirection {
  downwards,
  upwards,
}

const Wrapper = styled.div<{ isOpen: boolean; disabled: boolean }>`
  outline: none;
  pointer-events: ${(props) => (props.disabled ? 'none' : 'initial')};
  position: relative;
`

const Button = styled.div`
  user-select: none;
`

const PositionLeftCSS = css`
  left: 0;
`

const PositionRightCSS = css`
  right: 0;
`

const PositionCenterCSS = css`
  left: 50%;
  transform: translateX(-50%);
`

const DirectionDownwardsCSS = css`
  top: calc(100% + 10px);
`

const DirectionUpwardsCSS = css`
  bottom: calc(100% + 10px);
`

const Items = styled(BaseCard)<{
  dropdownDirection?: DropdownDirection
  dropdownPosition?: DropdownPosition
  isOpen: boolean
}>`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  min-width: 160px;
  position: absolute;
  ${(props) => (props.dropdownPosition === DropdownPosition.left ? PositionLeftCSS : '')}
  ${(props) => (props.dropdownPosition === DropdownPosition.right ? PositionRightCSS : '')}
  ${(props) => (props.dropdownPosition === DropdownPosition.center ? PositionCenterCSS : '')}
  ${(props) =>
    props.dropdownDirection === DropdownDirection.downwards ? DirectionDownwardsCSS : ''}
  ${(props) => (props.dropdownDirection === DropdownDirection.upwards ? DirectionUpwardsCSS : '')}
`

Items.defaultProps = {
  dropdownPosition: DropdownPosition.left,
  dropdownDirection: DropdownDirection.downwards,
}

const Item = styled.div<{ active: boolean; hasOnClick?: boolean }>`
  align-items: center;
  background-color: ${(props) =>
    props.active
      ? props.theme.dropdown.item.backgroundColorActive
      : props.theme.dropdown.item.backgroundColor};
  border-bottom: 1px solid ${(props) => props.theme.dropdown.item.borderColor};
  color: ${(props) =>
    props.active ? props.theme.dropdown.item.color : props.theme.dropdown.item.colorActive};
  cursor: ${(props) => (props.hasOnClick ? 'pointer' : 'default')};
  display: flex;
  font-size: 13px;
  line-height: 1.4;
  min-height: 34px;
  padding: 0 12px;

  &:hover {
    background: ${(props) =>
      props.hasOnClick
        ? props.theme.dropdown.item.backgroundColorHover
        : props.theme.dropdown.item.backgroundColor};
  }
`

export interface DropdownItemProps {
  content: React.ReactNode | string
  onClick?: () => void
}

interface Props extends DOMAttributes<HTMLDivElement> {
  activeItemHightlight?: boolean | undefined
  currentItem?: number | undefined
  disabled?: boolean
  dropdownButtonContent?: React.ReactNode | string
  dropdownDirection?: DropdownDirection | undefined
  dropdownPosition?: DropdownPosition | undefined
  items: Array<DropdownItemProps>
  className?: string
}

export const Dropdown: React.FC<Props> = (props) => {
  const {
    activeItemHightlight = true,
    className,
    currentItem = 0,
    disabled = false,
    dropdownButtonContent,
    dropdownDirection,
    dropdownPosition,
    items,
    ...restProps
  } = props
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(currentItem)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const optionClick = useCallback((onClick: (() => void) | undefined, itemIndex: number) => {
    if (!onClick) return

    setCurrentItemIndex(itemIndex)
    onClick()
    setIsOpen(false)
  }, [])

  const onWrapperClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [isOpen])

  return (
    <Wrapper
      className={`dropdown ${isOpen ? 'isOpen' : ''} ${className}`}
      disabled={disabled}
      isOpen={isOpen}
      onBlur={() => {
        setIsOpen(false)
      }}
      onClick={onWrapperClick}
      tabIndex={-1}
      {...restProps}
    >
      <Button className="dropdownButton">{dropdownButtonContent}</Button>
      <Items
        className="dropdownItems"
        dropdownDirection={dropdownDirection}
        dropdownPosition={dropdownPosition}
        isOpen={isOpen}
        noPadding
      >
        {items.map((item: DropdownItemProps, index: number) => {
          return (
            <Item
              active={activeItemHightlight && index === currentItemIndex}
              className="dropdownItem"
              hasOnClick={item.onClick !== undefined}
              key={index}
              onClick={
                item.onClick !== undefined
                  ? () => optionClick(item.onClick, index)
                  : () => setIsOpen(false)
              }
            >
              {item.content}
            </Item>
          )
        })}
      </Items>
    </Wrapper>
  )
}
