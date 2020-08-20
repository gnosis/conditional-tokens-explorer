import { useQuery } from '@apollo/react-hooks'
import { ConditionsListQuery, ConditionsSearchQuery } from 'queries/conditions'
import React from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'
import { Conditions, Conditions_conditions } from 'types/generatedGQL'

import { InfoCard } from '../../components/common/InfoCard'
import { InlineLoading } from '../../components/loading/InlineLoading'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'

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

const customStyles = {
  rows: {
    style: {
      cursor: 'pointer',
    },
  },
}

export const ConditionsList = () => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const { data, error, loading } = useQuery<Conditions>(
    searchTerm ? ConditionsSearchQuery : ConditionsListQuery,
    {
      variables: { oracle: searchTerm },
    }
  )
  const history = useHistory()
  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setSearchTerm(event.target.value)
  }

  const handleRowClick = (row: Conditions_conditions) => {
    history.push(`/conditions/${row.id}`)
  }

  return (
    <>
      <PageTitle>Conditions</PageTitle>
      {loading && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {<input onChange={handleChange} placeholder="Search oracle" type="text" value={searchTerm} />}
      {data && (
        <DataTable
          columns={columns}
          customStyles={customStyles}
          data={data?.conditions || []}
          highlightOnHover
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
