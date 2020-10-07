import React, { useCallback, useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { TokenIcon } from 'components/common/TokenIcon'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { CellHash } from 'components/table/CellHash'
import { PositionWithUserBalanceWithDecimals } from 'hooks'
import { useCollateral } from 'hooks/useCollateral'
import { customStyles } from 'theme/tableCustomStyles'
import { formatBigNumber, truncateStringInTheMiddle } from 'util/tools'
import { SplitStatus } from 'util/types'

interface PropsWrapper extends SplitStatus {
  callbackOnHistoryPush?: () => void
}

export const DisplayTablePositionsWrapper = (props: PropsWrapper) => {
  const { callbackOnHistoryPush, collateral, positionIds } = props
  const { collateral: collateralFetched, loading } = useCollateral(collateral)

  const positions = useMemo(() => {
    if (!loading && collateralFetched) {
      return positionIds.map(({ balance, positionId }) => {
        return {
          id: positionId,
          token: collateralFetched,
          userBalanceERC1155: balance,
          collateralToken: collateral,
          userBalanceERC1155WithDecimals: formatBigNumber(balance, collateralFetched.decimals),
        }
      })
    } else {
      return []
    }
  }, [loading, collateralFetched, positionIds, collateral])

  return (
    <DisplayTablePositions
      callbackOnHistoryPush={callbackOnHistoryPush}
      positions={positions as PositionWithUserBalanceWithDecimals[]}
    ></DisplayTablePositions>
  )
}

interface Props {
  callbackOnHistoryPush?: () => void
  positions: PositionWithUserBalanceWithDecimals[]
}

export const DisplayTablePositions = (props: Props) => {
  const { callbackOnHistoryPush, positions } = props
  const history = useHistory()

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
        cell: (row: PositionWithUserBalanceWithDecimals) => {
          return <CellHash externalLink href={`/positions/${row.id}`} value={row.id} />
        },
        maxWidth: '250px',
        minWidth: '250px',
        name: 'Position Id',
        selector: (row: PositionWithUserBalanceWithDecimals) => row.id,
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => {
          return row.token ? (
            <TokenIcon onClick={() => handleRowClick} token={row.token} />
          ) : (
            <span title={row.collateralToken}>
              {truncateStringInTheMiddle(row.collateralToken, 10, 8)}
            </span>
          )
        },
        maxWidth: '150px',
        minWidth: '150px',
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
      },

      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <span title={row.userBalanceERC1155.toString()}>
            {row.userBalanceERC1155WithDecimals}
          </span>
        ),
        name: 'ERC1155',
        maxWidth: '150px',
        minWidth: '150px',
        right: true,
        selector: 'userBalanceERC1155',
        sortable: true,
      },
    ]
  }, [handleRowClick])

  return (
    <DataTable
      className="outerTableWrapper inlineTable"
      columns={getColumns()}
      customStyles={customStyles}
      data={positions || []}
      noDataComponent={<EmptyContentText>No positions found.</EmptyContentText>}
      noHeader
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 15]}
    />
  )
}
