import { useEffect, useState } from 'react'

export const usePositionsSearchOptions = (itemAction: (searchFilter: string) => void) => {
  const [items, setItems] = useState<
    Array<{ onClick: () => void; placeholder: string; text: string }>
  >()

  useEffect(() => {
    setItems([
      {
        onClick: () => {
          itemAction('all')
        },
        placeholder:
          'Search by Position Id, Condition Id, Collateral Symbol, Collateral Address, Token Address.',
        text: 'All',
      },
      {
        onClick: () => {
          itemAction('positionId')
        },
        placeholder: 'Search by Position Id',
        text: 'Position Id',
      },
      {
        onClick: () => {
          itemAction('conditionId')
        },
        placeholder: 'Search by Condition Id',
        text: 'Condition Id',
      },
      {
        onClick: () => {
          itemAction('collateralSymbol')
        },
        placeholder: 'Search by Collateral Symbol',
        text: 'Collateral Symbol',
      },
      {
        onClick: () => {
          itemAction('collateralAddress')
        },
        placeholder: 'Search by Collateral Address',
        text: 'Collateral Address',
      },
      {
        onClick: () => {
          itemAction('tokenAddress')
        },
        placeholder: 'Search by Token Address',
        text: 'Token Address',
      },
    ])
  }, [itemAction])

  return items
}
