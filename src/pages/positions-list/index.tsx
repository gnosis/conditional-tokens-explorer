import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import DataTable from 'react-data-table-component'
import { usePositions, Position } from 'hooks'
import { useWeb3Context, Web3Status } from 'contexts/Web3Context'

const dafaultColumns = [
  {
    name: 'Positions Id',
    selector: 'id',
    sortable: true,
  },
  {
    name: 'Collateral',
    selector: 'collateralToken',
    sortable: true,
  },
]

const getTableColumns = (status: Web3Status) => {
  if (status._type === 'connected') {
    return [
      ...dafaultColumns,
      {
        name: 'ERC1155 Amount',
        selector: 'userBalance',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => <div>{row.userBalance.toString()}</div>, // TODO: Should we show this as decimal number, based on collateral decimals?
      },
    ]
  }

  return dafaultColumns
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

export const PositionsList = () => {
  const { status } = useWeb3Context()
  const { data, error, loading } = usePositions()
  const [tableColumns, setTableColumns] = useState(getTableColumns(status))

  useEffect(() => {
    setTableColumns(getTableColumns(status))
  }, [status])

  return (
    <Wrapper>
      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {data && (
        <DataTable
          style={{
            width: '80%',
          }}
          columns={tableColumns}
          data={data || []}
          pagination={true}
        />
      )}
    </Wrapper>
  )
}
