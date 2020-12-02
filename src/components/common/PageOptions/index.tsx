import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { SettingsIcon } from 'components/icons/SettingsIcon'
import { Checkbox } from 'components/pureStyledComponents/Checkbox'

const COMMON_PADDING = '12px;'

const Wrapper = styled(Dropdown)`
  .dropdownItems {
    width: 212px;
  }
`

const DropdownButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  outline: none;
  padding: 0;

  .isOpen &,
  &:hover {
    .dropdownButtonText {
      color: ${(props) => props.theme.colors.darkerGrey};
    }

    .fill {
      fill: ${(props) => props.theme.colors.darkerGrey};
    }
  }
`

const DropdownButtonText = styled.span`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 8px 0 0;
`

const Title = styled.h4`
  border-bottom: 1px solid ${(props) => props.theme.border.color};
  color: ${(props) => props.theme.colors.darkerGrey};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
  padding: ${COMMON_PADDING};
  text-transform: uppercase;
`

const Items = styled.div`
  max-height: 210px;
  overflow: auto;
`

const Item = styled.div<{ disabled?: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.border.color};
  cursor: pointer;
  display: flex;
  padding: 10px ${COMMON_PADDING};

  &:hover {
    background-color: ${(props) => props.theme.dropdown.item.backgroundColorHover};
  }

  &:last-child {
    border-bottom: none;
  }

  ${(props) =>
    props.disabled &&
    `
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  `}
`

const ItemText = styled.span`
  color: ${(props) => props.theme.colors.textColor};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 0 8px;
`

const ApplyButtonContainer = styled.div`
  border-top: 1px solid ${(props) => props.theme.border.color};
  padding: ${COMMON_PADDING};
`

const ApplyButton = styled(Button)`
  font-size: 14px;
  height: 28px;
  line-height: 1;
  width: 100%;
`

interface CommonProps {
  onApply: () => void
  options: Array<{
    mandatory?: boolean
    isVisible?: boolean
    toggleStatus: () => void
    name: string
  }>
}

interface Props extends CommonProps {
  disabled?: boolean
  title?: string
}

const DropdownContent: React.FC<CommonProps> = (props) => {
  const { onApply, options } = props

  return (
    <>
      <Title>Table Columns</Title>
      <Items>
        {options.map((item, index) => {
          const isChecked = item.isVisible || item.mandatory

          return (
            <Item disabled={item.mandatory} key={index} onClick={item.toggleStatus}>
              <Checkbox checked={isChecked} /> <ItemText>{item.name}</ItemText>
            </Item>
          )
        })}
      </Items>
      <ApplyButtonContainer>
        <ApplyButton buttonType={ButtonType.primary} onClick={onApply}>
          Apply
        </ApplyButton>
      </ApplyButtonContainer>
    </>
  )
}

export const PageOptions: React.FC<Props> = (props) => {
  const { disabled, onApply, options, title = 'Page Settings', ...restProps } = props

  return (
    <Wrapper
      {...restProps}
      activeItemHighlight={false}
      closeOnClick={false}
      disabled={disabled}
      dropdownButtonContent={
        <DropdownButton>
          <DropdownButtonText className="dropdownButtonText">{title}</DropdownButtonText>
          <SettingsIcon />
        </DropdownButton>
      }
      dropdownPosition={DropdownPosition.right}
      items={[<DropdownContent key="1" onApply={onApply} options={options} />]}
    />
  )
}
