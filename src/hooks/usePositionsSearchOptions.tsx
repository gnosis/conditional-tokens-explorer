import { useEffect, useState } from 'react'

import { PositionSearchOptions } from 'util/types'

export const usePositionsSearchOptions = (
  itemAction: (searchFilter: PositionSearchOptions) => void
) => {
  const [items, setItems] = useState<
    Array<{ onClick: () => void; placeholder: string; text: string }>
  >()

  useEffect(() => {
    setItems([
      // TODO not remove this until the TEXT fields will be created in the subgraph. Thegraph doesnt't support OR operator
      // {
      //   onClick: () => {
      //     itemAction('all')
      //   },
      //   placeholder:
      //     'Search by Position Id, Condition Id, Collateral Symbol, Collateral Address, Token Address.',
      //   text: 'All',
      // },
      {
        onClick: () => {
          itemAction(PositionSearchOptions.PositionId)
        },
        placeholder: 'Search by Position Id',
        text: 'Position Id',
      },
      {
        onClick: () => {
          itemAction(PositionSearchOptions.ConditionId)
        },
        placeholder: 'Search by Condition Id',
        text: 'Condition Id',
      },
      {
        onClick: () => {
          itemAction(PositionSearchOptions.CollateralSymbol)
        },
        placeholder: 'Search by Collateral Symbol',
        text: 'Collateral Symbol',
      },
      {
        onClick: () => {
          itemAction(PositionSearchOptions.CollateralAddress)
        },
        placeholder: 'Search by Collateral Address',
        text: 'Collateral Address',
      },
      {
        onClick: () => {
          itemAction(PositionSearchOptions.WrappedCollateralAddress)
        },
        placeholder: 'Search by Wrapped Collateral Address',
        text: 'Wrapped Collateral Address',
      },
    ])
  }, [itemAction])

  return items
}
