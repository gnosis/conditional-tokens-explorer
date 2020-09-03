import { useQuery } from '@apollo/react-hooks'
import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { useConditionContext } from '../../../contexts/ConditionContext'
import { buildQueryConditions } from '../../../queries/conditions'
import { customStyles } from '../../../theme/tableCustomStyles'
import {
  Conditions,
  Conditions_conditions,
  GetCondition_condition,
} from '../../../types/generatedGQL'
import { truncateStringInTheMiddle } from '../../../util/tools'
import { Button } from '../../buttons/Button'
import { ButtonControl, ButtonControlType } from '../../buttons/ButtonControl'
import { Modal, ModalProps } from '../../common/Modal'
import { SearchField } from '../../form/SearchField'
import { ButtonContainer } from '../../pureStyledComponents/ButtonContainer'
import { EmptyContentText } from '../../pureStyledComponents/EmptyContentText'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from '../../pureStyledComponents/StripedList'
import { InfoCard } from '../../statusInfo/InfoCard'
import { InlineLoading } from '../../statusInfo/InlineLoading'
import { TableControls } from '../../table/TableControls'
import { TitleValue } from '../../text/TitleValue'

const LoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 400px;
`

const SearchingWrapper = styled(LoadingWrapper)`
  min-height: 348px;
`

const Search = styled(SearchField)`
  max-width: 210px;
`

interface Props extends ModalProps {
  isOpen: boolean
  onConfirm?: (condition: Conditions_conditions) => void
}

export const SelectConditionModal: React.FC<Props> = (props) => {
  const { onConfirm, ...restProps } = props
  const [conditionIdToSearch, setConditionIdToSearch] = useState<string>('')
  const [conditionIdToShow, setConditionIdToShow] = useState<string>('')
  const debouncedHandler = useDebounceCallback((conditionIdToSearch) => {
    setConditionIdToSearch(conditionIdToSearch)
  }, 500)
  const inputHandler = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setConditionIdToShow(value)
      debouncedHandler(value)
    },
    [debouncedHandler]
  )

  const query = buildQueryConditions({
    conditionId: conditionIdToSearch,
  })

  const { data, error, loading } = useQuery<Conditions>(query, {
    variables: { conditionId: conditionIdToSearch },
  })
  const [selectedCondition, setSelectedCondition] = useState<Maybe<GetCondition_condition>>(null)
  const { setCondition } = useConditionContext()

  const isLoading = !conditionIdToSearch && loading
  const isSearching = conditionIdToSearch && loading

  const handleAddClick = useCallback((selected) => {
    setSelectedCondition(selected)
  }, [])

  const columns = useMemo(
    () => [
      {
        name: 'Condition Id',
        selector: 'id',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => truncateStringInTheMiddle(row.id, 8, 6),
      },
      {
        name: 'R. Address / Oracle',
        selector: 'oracle',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => truncateStringInTheMiddle(row.oracle, 8, 6),
      },
      {
        name: 'Question Id',
        selector: 'questionId',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => truncateStringInTheMiddle(row.questionId, 8, 6),
      },
      {
        button: true,
        ignoreRowClick: true,
        maxWidth: '24px',
        minWidth: '24px',
        name: '',
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <ButtonControl
            buttonType={ButtonControlType.add}
            disabled={!!selectedCondition}
            onClick={() => handleAddClick(row)}
          />
        ),
      },
    ],
    [handleAddClick, selectedCondition]
  )

  const handleDone = useCallback(() => {
    if (selectedCondition) {
      setCondition(selectedCondition)

      if (onConfirm && typeof onConfirm === 'function') {
        onConfirm(selectedCondition)
      }
    }
  }, [onConfirm, selectedCondition, setCondition])

  return (
    <Modal subTitle={'Select one condition.'} title={'Select Condition'} {...restProps}>
      {isLoading && (
        <LoadingWrapper>
          <InlineLoading message="Loading conditions..." />
        </LoadingWrapper>
      )}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !isLoading && (
        <>
          <TableControls
            start={
              <Search
                onChange={inputHandler}
                placeholder="Search condition id..."
                value={conditionIdToShow}
              />
            }
          />
          {isSearching && (
            <SearchingWrapper>
              <InlineLoading />
            </SearchingWrapper>
          )}
          {!isSearching && (
            <DataTable
              className="outerTableWrapper inlineTable"
              columns={columns}
              customStyles={customStyles}
              data={data?.conditions || []}
              noDataComponent={<EmptyContentText>No conditions found.</EmptyContentText>}
              noHeader
              pagination
              paginationPerPage={5}
            />
          )}
          <TitleValue
            title="Selected Condition"
            value={
              <StripedList maxHeight={selectedCondition ? 'auto' : '44px'}>
                {selectedCondition ? (
                  <StripedListItem>
                    {truncateStringInTheMiddle(selectedCondition.id, 8, 6)}
                    <ButtonControl
                      buttonType={ButtonControlType.delete}
                      onClick={() => setSelectedCondition(null)}
                    />
                  </StripedListItem>
                ) : (
                  <StripedListEmpty>No condition selected.</StripedListEmpty>
                )}
              </StripedList>
            }
          />
          <ButtonContainer>
            <Button disabled={!selectedCondition} onClick={handleDone}>
              Done
            </Button>
          </ButtonContainer>
        </>
      )}
    </Modal>
  )
}
