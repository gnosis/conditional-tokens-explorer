import { Position, usePositions } from 'hooks'
import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { InfoCard } from '../../components/statusInfo/InfoCard'
import { InlineLoading } from '../../components/statusInfo/InlineLoading'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from '../../contexts/Web3Context'

const defaultColumns = [
  {
    name: 'Position Id',
    selector: 'id',
    sortable: true,
  },
  {
    name: 'Collateral',
    selector: 'collateralToken',
    sortable: true,
  },
]

const getTableColumns = (status: Web3ContextStatus) => {
  if (status === Web3ContextStatus.Connected) {
    return [
      ...defaultColumns,
      {
        name: 'ERC1155 Amount',
        selector: 'userBalance',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => <div>{row.userBalance.toString()}</div>, // Note: Should we show this as decimal number, based on collateral decimals?
      },
    ]
  }

  return defaultColumns
}

const customStyles = {
  rows: {
    style: {
      cursor: 'pointer',
    },
  },
}

export const PositionsList = () => {
  const { _type: status } = useWeb3ConnectedOrInfura()

  const { data, error, loading } = usePositions()
  const [tableColumns, setTableColumns] = useState(getTableColumns(status))

  useEffect(() => {
    setTableColumns(getTableColumns(status))
  }, [status])

  const history = useHistory()

  const handleRowClick = (row: Position) => {
    history.push(`/positions/${row.id}`)
  }

  return (
    <>
      <PageTitle>Positions</PageTitle>
      {loading && <InlineLoading />}
      {error && <InfoCard title="Error" />}
      {data && (
        <DataTable
          columns={tableColumns}
          customStyles={customStyles}
          data={data || []}
          onRowClicked={handleRowClick}
          pagination={true}
          style={{
            width: '100%',
          }}
        />
      )}
    </>
  )
}
