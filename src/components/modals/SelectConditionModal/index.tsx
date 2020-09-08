import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { Modal, ModalProps } from 'components/common/Modal'
import { SearchField } from 'components/form/SearchField'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TableControls } from 'components/table/TableControls'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { useConditions } from 'hooks/useConditions'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions, GetCondition_condition } from 'types/generatedGQL'
import { truncateStringInTheMiddle } from 'util/tools'

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

  const { data, error, loading } = useConditions({
    conditionId: conditionIdToSearch,
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
