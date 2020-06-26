import React from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/react-hooks'
import DataTable from 'react-data-table-component'

import { PositionsListQuery } from 'queries/positions'
import { Positions, Positions_positions } from 'types/generatedGQL'

import { usePositions } from 'hooks'

const columns = [
  {
    name: 'Positions Id',
    selector: 'id',
    sortable: true,
  },
  {
    name: 'Collateral',
    selector: 'collateralToken',
    sortable: true,
    // eslint-disable-next-line react/display-name
    cell: (row: Positions_positions) => <div>{row.collateralToken.id}</div>,
    sortFunction: (a: Positions_positions, b: Positions_positions) => {
      return a.collateralToken.id > b.collateralToken.id
        ? 1
        : a.collateralToken.id < b.collateralToken.id
        ? -1
        : 0
    },
  },
]

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

export const PositionsList = () => {
  const { data, error, loading } = useQuery<Positions>(PositionsListQuery)
  usePositions()

  return (
    <Wrapper>
      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {data && (
        <DataTable
          style={{
            width: '80%',
          }}
          columns={columns}
          data={data?.positions || []}
          pagination={true}
        />
      )}
    </Wrapper>
  )
}
