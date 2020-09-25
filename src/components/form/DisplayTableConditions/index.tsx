import React, { useCallback } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { CellHash } from 'components/table/CellHash'
import { customStyles } from 'theme/tableCustomStyles'
import { ConditionIdsArray } from 'util/types'

interface Props {
  conditionIds: Array<ConditionIdsArray>
  callbackOnHistoryPush?: () => void
}

export const DisplayTableConditions = (props: Props) => {
  const { callbackOnHistoryPush, conditionIds } = props
  const history = useHistory()

  const handleRowClick = useCallback(
    (conditionId: string) => {
      if (typeof callbackOnHistoryPush === 'function') callbackOnHistoryPush()
      history.push(`/conditions/${conditionId}`)
    },
    [history, callbackOnHistoryPush]
  )

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: ConditionIdsArray) => {
          const port = window.location.port !== '' ? `:${window.location.port}` : ''
          return (
            <CellHash
              externalLink={`${window.location.protocol}//${window.location.hostname}${port}/#/conditions/${row.conditionId}`}
              onClick={() => {
                handleRowClick(row.conditionId)
              }}
              underline
              value={row.conditionId}
            />
          )
        },
        name: 'Condition Id',
        selector: 'createTimestamp',
        sortable: true,
      },
    ]
  }, [handleRowClick])

  return (
    <DataTable
      className="outerTableWrapper inlineTable"
      columns={getColumns()}
      customStyles={customStyles}
      data={conditionIds || []}
      noDataComponent={<EmptyContentText>No conditions found.</EmptyContentText>}
      noHeader
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 15]}
    />
  )
}
