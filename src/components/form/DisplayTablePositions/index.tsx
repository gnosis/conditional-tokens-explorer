import React, { useCallback, useMemo } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { TokenIcon } from 'components/common/TokenIcon'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { FormatHash } from 'components/text/FormatHash'
import { Hash } from 'components/text/Hash'
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

  return !loading ? (
    <DisplayTablePositions
      callbackOnHistoryPush={callbackOnHistoryPush}
      positions={positions as PositionWithUserBalanceWithDecimals[]}
    ></DisplayTablePositions>
  ) : null
}

interface Props {
  callbackOnHistoryPush?: () => void
  isLoading?: boolean
  positions: PositionWithUserBalanceWithDecimals[]
}

export const DisplayTablePositions = (props: Props) => {
  const { callbackOnHistoryPush, isLoading, positions } = props
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
          return <Hash externalLink href={`/positions/${row.id}`} value={row.id} />
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
            <FormatHash
              hash={truncateStringInTheMiddle(row.collateralToken, 10, 8)}
              title={row.collateralToken}
            />
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
      className="outerTableWrapper inlineTable noMarginBottom"
      columns={getColumns()}
      customStyles={customStyles}
      data={isLoading ? [] : positions.length ? positions : []}
      noDataComponent={
        isLoading ? (
          <InlineLoading size="30px" />
        ) : (
          <EmptyContentText>No positions found.</EmptyContentText>
        )
      }
      noHeader
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 15]}
    />
  )
}
