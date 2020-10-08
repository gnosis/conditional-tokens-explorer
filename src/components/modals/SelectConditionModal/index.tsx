import { useDebounceCallback } from '@react-hook/debounce'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonControl, ButtonControlType } from 'components/buttons/ButtonControl'
import { Modal, ModalProps } from 'components/common/Modal'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { SearchField } from 'components/search/SearchField'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { TableControls } from 'components/table/TableControls'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { useConditions } from 'hooks/useConditions'
import { useConditionsSearchOptions } from 'hooks/useConditionsSearchOptions'
import { customStyles } from 'theme/tableCustomStyles'
import { Conditions_conditions } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { truncateStringInTheMiddle } from 'util/tools'

const Search = styled(SearchField)`
  min-width: 0;
  width: 400px;
`

const logger = getLogger('ConditionsListModal')

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

  const onClearSearch = React.useCallback(() => {
    setConditionIdToShow('')
    debouncedHandler('')
  }, [debouncedHandler])

  const { data, error, loading } = useConditions({
    conditionId: conditionIdToSearch,
  })

  const [selectedCondition, setSelectedCondition] = useState<Maybe<Conditions_conditions>>(null)
  const [conditionList, setConditionList] = useState<Conditions_conditions[]>([])

  useEffect(() => {
    if (!data || !data.conditions) {
      setConditionList([])
    } else {
      if (selectedCondition) {
        setConditionList(data.conditions.filter(({ id }) => selectedCondition.id !== id))
      } else {
        setConditionList(data.conditions)
      }
    }
  }, [selectedCondition, data])

  const { setCondition } = useConditionContext()

  const handleAddClick = useCallback((selected) => {
    setSelectedCondition(selected)
  }, [])

  const columns = useMemo(
    () => [
      {
        name: 'Condition Id',
        selector: 'createTimestamp',
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

  const [searchBy, setSearchBy] = useState('all')
  const dropdownItems = useConditionsSearchOptions(setSearchBy)

  logger.log(`Search by ${searchBy}`)

  const isLoading = !conditionIdToSearch && loading
  const isSearching = conditionIdToSearch && loading
  const showSpinner = (isLoading || isSearching) && !error

  return (
    <Modal subTitle={'Select one condition.'} title={'Select Condition'} {...restProps}>
      <TableControls
        end={
          <Search
            dropdownItems={dropdownItems}
            onChange={inputHandler}
            onClear={onClearSearch}
            value={conditionIdToShow}
          />
        }
      />
      {error && !isLoading && <InfoCard message={error.message} title="Error" />}
      {!error && (
        <DataTable
          className="outerTableWrapper inlineTable"
          columns={columns}
          customStyles={customStyles}
          data={showSpinner ? [] : conditionList.length ? conditionList : []}
          noDataComponent={
            showSpinner ? (
              <InlineLoading size="30px" />
            ) : (
              <EmptyContentText>No conditions found.</EmptyContentText>
            )
          }
          noHeader
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15]}
          responsive
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
    </Modal>
  )
}
