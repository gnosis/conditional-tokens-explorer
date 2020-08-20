import React from 'react'

import { ButtonSelect } from '../../buttons/ButtonSelect'
import { SelectItem } from '../../form/SelectItem'
import { Dropdown, DropdownPosition } from '../Dropdown'

interface Props {
  onClick: (value: string) => void
  value: string
}

export const ArbitratorDropdown = ({ onClick, value }: Props) => {
  const arbitratorItems = [
    {
      text: 'Realit.io',
      onClick: () => {
        onClick('realitio')
      },
      value: 'realitio',
    },
    {
      text: 'Kleros',
      onClick: () => {
        onClick('kleros')
      },
      value: 'kleros',
    },
  ]

  return (
    <Dropdown
      dropdownButtonContent={
        <ButtonSelect content={arbitratorItems.filter((item) => item.value === value)[0].text} />
      }
      dropdownPosition={DropdownPosition.center}
      fullWidth
      items={arbitratorItems.map((item, index) => (
        <SelectItem
          content={item.text}
          key={index}
          name="arbitrator"
          onClick={item.onClick}
          value={item.value}
        />
      ))}
    />
  )
}
