import React from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/react-hooks'
import DataTable from 'react-data-table-component'

import { ConditionsList } from 'queries/conditions'
import { ConditionList as ConditionListType, ConditionList_conditions } from 'types/generatedGQL'

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
    cell: (row: ConditionList_conditions) => <div>{row.resolved ? 'Resolved' : 'Open'}</div>,
    sortFunction: (a: ConditionList_conditions, b: ConditionList_conditions) => {
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

export const ConditionList = () => {
  const { data, error, loading } = useQuery<ConditionListType>(ConditionsList)

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
          data={data?.conditions || []}
          pagination={true}
        />
      )}
    </Wrapper>
  )
}
