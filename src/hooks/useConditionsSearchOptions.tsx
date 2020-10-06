import { useEffect, useState } from 'react'

export const useConditionsSearchOptions = (itemAction: (searchFilter: string) => void) => {
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
          'Search by Condition Id, Question Id, Question Text, Oracle Address, Reporting Address, Creator Address.',
        text: 'All',
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
          itemAction('questionId')
        },
        placeholder: 'Search by Question Id',
        text: 'Question Id',
      },
      {
        onClick: () => {
          itemAction('questionText')
        },
        placeholder: 'Search by Question Text',
        text: 'Question Text',
      },
      {
        onClick: () => {
          itemAction('oracleAddress')
        },
        placeholder: 'Search by Oracle Address',
        text: 'Oracle Address',
      },
      {
        onClick: () => {
          itemAction('reportingAddress')
        },
        placeholder: 'Search by Reporting Address',
        text: 'Reporting Address',
      },
      {
        onClick: () => {
          itemAction('creatorAddress')
        },
        placeholder: 'Search by Creator Address',
        text: 'Creator Address',
      },
    ])
  }, [itemAction])

  return items
}
