import React, { useCallback } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { CellHash } from 'components/table/CellHash'
import { customStyles } from 'theme/tableCustomStyles'
import { PositionIdsArray } from 'util/types'

export const DisplayTablePositions = ({ positionIds }: { positionIds: PositionIdsArray[] }) => {
  const history = useHistory()

  const handleRowClick = useCallback(
    (positionId: string) => {
      history.push(`/positions/${positionId}`)
    },
    [history]
  )

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionIdsArray) => {
          return (
            <CellHash
              onClick={() => {
                handleRowClick(row.positionId)
              }}
              underline
              value={row.positionId}
            />
          )
        },
        maxWidth: '370px',
        name: 'Position Id',
        selector: 'id',
        sortable: true,
      },
    ]
  }, [handleRowClick])

  return (
    <DataTable
      className="outerTableWrapper inlineTable"
      columns={getColumns()}
      customStyles={customStyles}
      data={positionIds || []}
      noDataComponent={<EmptyContentText>{`No positions found.`}</EmptyContentText>}
      noHeader
      pagination
      paginationPerPage={5}
    />
  )
}
