import { useQuery } from '@apollo/react-hooks'
import { ConditionsListQuery } from 'queries/conditions'
import React from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { Conditions, Conditions_conditions } from 'types/generatedGQL'

const columns = [
  {
    name: 'Condition Id',
    selector: 'id',
    sortable: true,
  },
  {
    name: 'Oracle',
    selector: 'oracle',
    sortable: true,
  },
  {
    name: 'Question Id',
    selector: 'questionId',
    sortable: true,
  },
  {
    name: 'Outcomes Number',
    selector: 'outcomeSlotCount',
    sortable: true,
  },
  {
    name: 'Status',
    selector: 'resolved',
    sortable: true,
    // eslint-disable-next-line react/display-name
    cell: (row: Conditions_conditions) => <div>{row.resolved ? 'Resolved' : 'Open'}</div>,
    sortFunction: (a: Conditions_conditions, b: Conditions_conditions) => {
      const valA = a.resolved ? 2 : 1
      const valB = b.resolved ? 2 : 1
      return valA - valB
    },
  },
]

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

const customStyles = {
  rows: {
    style: {
      cursor: 'pointer',
    },
  },
}

export const ConditionsList = () => {
  const { data, error, loading } = useQuery<Conditions>(ConditionsListQuery)
  const history = useHistory()

  const handleRowClick = (row: Conditions_conditions) => {
    history.push(`/conditions/${row.id}`)
  }

  return (
    <Wrapper>
      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {data && (
        <DataTable
          columns={columns}
          customStyles={customStyles}
          data={data?.conditions || []}
          highlightOnHover
          onRowClicked={handleRowClick}
          pagination={true}
          style={{
            width: '80%',
          }}
        />
      )}
    </Wrapper>
  )
}
