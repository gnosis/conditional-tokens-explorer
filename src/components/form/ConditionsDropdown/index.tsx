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

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditions: Array<any> | undefined
  loading?: boolean
  onClick: (conditionId: string) => void
  title?: string
  value: string | undefined
}

export const ConditionsDropdown: React.FC<Props> = (props) => {
  const { conditions, loading, onClick, title = 'Condition ID', value, ...restProps } = props

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
    value && dropdownItems?.length ? dropdownItems.findIndex((item) => item.value === value) : 0

  return (
    <TitleValue
      title={title}
      value={
        <Dropdown
          currentItem={currentIndex}
          disabled={!dropdownItems}
          dropdownButtonContent={
            <Button
              content={
                loading ? (
                  'Loading...'
                ) : dropdownItems?.length ? (
                  <ButtonText>{dropdownItems[currentIndex].value}</ButtonText>
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
