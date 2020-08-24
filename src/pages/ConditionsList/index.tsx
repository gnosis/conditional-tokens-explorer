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
  const [conditionIdToSearch, setConditionIdToSearch] = React.useState('')
  const { data, error, loading } = useQuery<Conditions>(
    conditionIdToSearch ? ConditionsSearchQuery : ConditionsListQuery,
    {
      variables: { conditionId: conditionIdToSearch },
    }
  )
  const history = useHistory()
  const handleRowClick = (row: Conditions_conditions) => {
    history.push(`/conditions/${row.id}`)
  }

  return (
    <>
      <PageTitle>Conditions</PageTitle>
      {loading && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {
        <input
          onChange={(e) => setConditionIdToSearch(e.currentTarget.value)}
          placeholder="Search by condition id..."
          type="text"
          value={conditionIdToSearch}
        />
      }
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
