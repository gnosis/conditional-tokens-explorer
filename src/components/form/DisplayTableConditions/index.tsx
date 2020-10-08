import React, { useCallback } from 'react'
import DataTable from 'react-data-table-component'

import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { Hash } from 'components/text/Hash'
import { customStyles } from 'theme/tableCustomStyles'
import { ConditionIdsArray } from 'util/types'

interface Props {
  conditions: Array<ConditionIdsArray>
  callbackOnHistoryPush?: () => void
}

export const DisplayTableConditions = (props: Props) => {
  const { callbackOnHistoryPush, conditions } = props

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: ConditionIdsArray) => {
          return (
            <Hash
              externalLink
              href={`/conditions/${row.conditionId}`}
              onClick={() => {
                if (typeof callbackOnHistoryPush === 'function') callbackOnHistoryPush()
              }}
              value={row.conditionId}
            />
          )
        },
        name: 'Condition Id',
        selector: 'createTimestamp',
        sortable: true,
      },
    ]
  }, [callbackOnHistoryPush])

  return (
    <DataTable
      className="outerTableWrapper inlineTable"
      columns={getColumns()}
      customStyles={customStyles}
      data={conditions || []}
      noDataComponent={<EmptyContentText>No conditions found.</EmptyContentText>}
      noHeader
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 15]}
    />
  )
}
