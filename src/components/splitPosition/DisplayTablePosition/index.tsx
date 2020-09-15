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

export const DisplayTablePositions = ({ amount, collateral, positionIds }: SplitStatus) => {
  const history = useHistory()
  const { collateral: collateralFetched, loading } = useCollateral(collateral)

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
        maxWidth: '400px',
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
        maxWidth: '145px',
        minWidth: '125px',
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: () => {
          if (!loading) {
            return collateralFetched && amount ? (
              <span title={amount.toString()}>
                {formatBigNumber(amount, collateralFetched.decimals)}
              </span>
            ) : (
              <span title={amount.toString()}>{amount.toString()}</span>
            )
          } else {
            return null
          }
        },
        name: 'ERC1155 Amount',
        right: true,
        selector: 'userBalance',
        sortable: true,
      },
    ]
  }, [handleRowClick, collateralFetched, collateral, loading, amount])

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
