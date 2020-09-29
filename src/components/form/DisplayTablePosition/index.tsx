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
  callbackOnHistoryPush?: () => void
}

export const DisplayTablePositions = (props: Props) => {
  const { callbackOnHistoryPush, collateral, positionIds } = props
  const history = useHistory()
  const { collateral: collateralFetched, loading } = useCollateral(collateral)

  const handleRowClick = useCallback(
    (positionId: string) => {
      if (typeof callbackOnHistoryPush === 'function') callbackOnHistoryPush()
      history.push(`/positions/${positionId}`)
    },
    [history, callbackOnHistoryPush]
  )

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionIdsArray) => {
          return (
            <CellHash externalLink href={`positions/${row.positionId}`} value={row.positionId} />
          )
        },
        maxWidth: '250px',
        minWidth: '250px',
        name: 'Position Id',
        selector: (row: PositionIdsArray) => row.positionId,
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: () => {
          if (!loading) {
            return collateralFetched ? (
              <TokenIcon onClick={() => handleRowClick} token={collateralFetched} />
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
        name: 'ERC1155',
        maxWidth: '150px',
        minWidth: '150px',
        right: true,
        selector: 'userBalanceERC1155',
        sortable: true,
      },
    ]
  }, [collateralFetched, handleRowClick, collateral, loading])

  return (
    <DataTable
      className="outerTableWrapper inlineTable"
      columns={getColumns()}
      customStyles={customStyles}
      data={positionIds || []}
      noDataComponent={<EmptyContentText>No positions found.</EmptyContentText>}
      noHeader
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 15]}
    />
  )
}
