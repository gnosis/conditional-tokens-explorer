import React from 'react'

import { ButtonSelect } from 'components/buttons/ButtonSelect'
import { Dropdown, DropdownPosition } from 'components/common/Dropdown'
import { SelectItem } from 'components/form/SelectItem'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Arbitrator } from 'util/types'

interface Props {
  onClick: (value: Arbitrator) => void
  value: Arbitrator
}

export const ArbitratorDropdown = ({ onClick, value }: Props) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const arbitrators: Arbitrator[] = networkConfig.getArbitrators()

  const arbitratorItems = []
  for (const arbitrator of arbitrators) {
    const oracleItem = {
      text: arbitrator.description,
      onClick: () => {
        onClick(arbitrator)
      },
      value: arbitrator.name,
    }
    arbitratorItems.push(oracleItem)
  }

  return (
    <Dropdown
      currentItem={arbitratorItems.findIndex(
        (arbitratorItem) => arbitratorItem.value === value.name
      )}
      dropdownButtonContent={
        <ButtonSelect
          content={arbitratorItems.filter((item) => item.value === value.name)[0].text}
        />
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
