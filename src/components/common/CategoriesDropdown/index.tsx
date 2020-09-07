import React from 'react'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { SelectItem } from 'components/form/SelectItem'
import { Categories } from 'util/types'

interface Props {
  onClick: (value: Categories) => void
  value: Categories
}

export const CategoriesDropdown = ({ onClick, value }: Props) => {
  const categoryItems = [
    {
      text: Categories.businessAndFinance,
      onClick: () => {
        onClick(Categories.businessAndFinance)
      },
      value: Categories.businessAndFinance,
    },
    {
      text: Categories.cryptocurrency,
      onClick: () => {
        onClick(Categories.cryptocurrency)
      },
      value: Categories.cryptocurrency,
    },
    {
      text: Categories.newsAndPolitics,
      onClick: () => {
        onClick(Categories.newsAndPolitics)
      },
      value: Categories.newsAndPolitics,
    },
    {
      text: Categories.scienceAndTech,
      onClick: () => {
        onClick(Categories.scienceAndTech)
      },
      value: Categories.scienceAndTech,
    },
    {
      text: Categories.sports,
      onClick: () => {
        onClick(Categories.sports)
      },
      value: Categories.sports,
    },
    {
      text: Categories.weather,
      onClick: () => {
        onClick(Categories.weather)
      },
      value: Categories.weather,
    },
    {
      text: Categories.miscellaneous,
      onClick: () => {
        onClick(Categories.miscellaneous)
      },
      value: Categories.miscellaneous,
    },
  ]

  return (
    <Dropdown
      dropdownButtonContent={
        <ButtonSelect content={categoryItems.filter((item) => item.value === value)[0].text} />
      }
      dropdownPosition={DropdownPosition.center}
      fullWidth
      items={categoryItems.map((item, index) => (
        <SelectItem
          content={item.text}
          key={index}
          name="category"
          onClick={item.onClick}
          value={item.value.toString()}
        />
      ))}
    />
  )
}
