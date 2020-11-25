import React from 'react'
import styled from 'styled-components'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { TitleValue } from 'components/text/TitleValue'

const Button = styled(ButtonSelect)``

const ButtonText = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const IdsDropdown = styled(Dropdown)`
  .dropdownItems {
    width: 100%;
  }
`

interface Props {
  conditions: Maybe<Array<string>>
  isLoading?: boolean
  onClick: (conditionId: string) => void
  title?: string
  value: Maybe<string>
}

export const ConditionsDropdown: React.FC<Props> = (props) => {
  const { conditions, isLoading, onClick, title = 'Condition ID', value, ...restProps } = props

  const dropdownItems =
    conditions && conditions.length
      ? [
          ...conditions.map((item) => {
            return {
              onClick: () => onClick(item),
              value: item,
            }
          }),
        ]
      : undefined

  const currentIndex =
    value && dropdownItems && dropdownItems.length
      ? dropdownItems.findIndex((item) => item.value === value)
      : 0

  return (
    <TitleValue
      title={title}
      value={
        <IdsDropdown
          currentItem={currentIndex}
          disabled={!dropdownItems || isLoading}
          dropdownButtonContent={
            <Button
              content={
                dropdownItems && dropdownItems.length && dropdownItems[currentIndex]? (
                  <ButtonText>{dropdownItems[currentIndex].value}</ButtonText>
                ) : isLoading ? (
                  'Loading...'
                ) : (
                  'No conditions available for positions...'
                )
              }
            />
          }
          dropdownPosition={DropdownPosition.center}
          items={
            dropdownItems
              ? dropdownItems.map((item, index) => (
                  <DropdownItem key={index} onClick={item.onClick}>
                    {item.value}
                  </DropdownItem>
                ))
              : []
          }
          {...restProps}
        />
      }
    />
  )
}
