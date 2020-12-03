import { useEffect, useState } from 'react'

import { ConditionSearchOptions } from 'util/types'

export const useConditionsSearchOptions = (
  itemAction: (searchFilter: ConditionSearchOptions) => void
) => {
  const [items, setItems] = useState<
    Array<{ onClick: () => void; placeholder: string; text: string }>
  >()

  useEffect(() => {
    setItems([
      // TODO not remove this until the TEXT fields will be created in the subgraph. Thegraph doesnt't support OR operator
      // {
      //   onClick: () => {
      //     itemAction(ConditionSearchOptions.All)
      //   },
      //   placeholder:
      //     'Search by Condition Id, Question Id, Question Text, Oracle Address, Reporting Address, Creator Address.',
      //   text: 'All',
      // },
      {
        onClick: () => {
          itemAction(ConditionSearchOptions.ConditionId)
        },
        placeholder: 'Search by Condition Id',
        text: 'Condition Id',
      },
      // TODO  remove this when the question is indexed
      // {
      //   onClick: () => {
      //     itemAction(ConditionSearchOptions.QuestionText)
      //   },
      //   placeholder: 'Search by Question Text',
      //   text: 'Question Text',
      // },
      {
        onClick: () => {
          itemAction(ConditionSearchOptions.QuestionId)
        },
        placeholder: 'Search by Question Id',
        text: 'Question Id',
      },
      {
        onClick: () => {
          itemAction(ConditionSearchOptions.OracleAddress)
        },
        placeholder: 'Search by Oracle Address',
        text: 'Oracle Address',
      },
      {
        onClick: () => {
          itemAction(ConditionSearchOptions.CreatorAddress)
        },
        placeholder: 'Search by Creator Address',
        text: 'Creator Address',
      },
    ])
  }, [itemAction])

  return items
}
