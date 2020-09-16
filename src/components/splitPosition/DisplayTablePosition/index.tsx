import React, { useCallback } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { TokenIcon } from 'components/common/TokenIcon'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { CellHash } from 'components/table/CellHash'
import { useCollateral } from 'hooks/useCollateral'
import { customStyles } from 'theme/tableCustomStyles'
import { formatBigNumber, truncateStringInTheMiddle } from 'util/tools'
import { PositionIdsArray, SplitStatus } from 'util/types'

interface Props extends SplitStatus {
  callbackOnHistoryPush: () => void
}

export const DisplayTablePositions = ({
  callbackOnHistoryPush,
  collateral,
  positionIds,
}: Props) => {
  const history = useHistory()
  const { collateral: collateralFetched, loading } = useCollateral(collateral)

  const handleRowClick = useCallback(
    (positionId: string) => {
      callbackOnHistoryPush()
      history.push(`/positions/${positionId}`)
    },
    [history, callbackOnHistoryPush]
  )

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionIdsArray) => {
          const port = window.location.port !== '' ? `:${window.location.port}` : ''
          return (
            <CellHash
              externalLink={`${window.location.protocol}//${window.location.hostname}${port}/#/positions/${row.positionId}`}
              onClick={() => {
                handleRowClick(row.positionId)
              }}
              underline
              value={row.positionId}
            />
          )
        },
        maxWidth: '250px',
        minWidth: '250px',
        name: 'Position Id',
        selector: 'id',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: () => {
          if (!loading) {
            return collateralFetched ? (
              <TokenIcon symbol={collateralFetched.symbol} />
            ) : (
              <span title={collateral}>{truncateStringInTheMiddle(collateral, 10, 8)}</span>
            )
          } else {
            return null
          }
        },
        maxWidth: '150px',
        minWidth: '150px',
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
      },

      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionIdsArray) => {
          if (!loading) {
            return collateralFetched ? (
              <span title={row.balance.toString()}>
                {formatBigNumber(row.balance, collateralFetched.decimals)}
              </span>
            ) : (
              <span title={row.balance.toString()}>{row.balance.toString()}</span>
            )
          } else {
            return null
          }
        },
        name: 'ERC1155 Amount',
        maxWidth: '150px',
        minWidth: '150px',
        right: true,
        selector: 'userBalance',
        sortable: true,
      },
    ]
  }, [handleRowClick, collateralFetched, collateral, loading])

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
