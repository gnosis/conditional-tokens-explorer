import { useQuery } from '@apollo/react-hooks'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { useConditionContext } from '../../../contexts/ConditionContext'
import { ConditionsListQuery } from '../../../queries/conditions'
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

interface Props extends ModalProps {
  onConfirm?: (condition: Conditions_conditions) => void
}

export const SelectConditionModal: React.FC<Props> = (props) => {
  const { onConfirm, ...restProps } = props
  const { data, error, loading } = useQuery<Conditions>(ConditionsListQuery)
  const [selectedCondition, setSelectedCondition] = useState<Maybe<GetCondition_condition>>(null)
  const { setCondition } = useConditionContext()

  const isLoading = loading && !data
  // const isLoading = !conditionIdToSearch && loading
  // const isSearching = conditionIdToSearch && loading

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
        name: 'Oracle',
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
              <SearchField
                onChange={() => {
                  /**/
                }}
                value={0}
              />
            }
          />
          <DataTable
            className="outerTableWrapper inlineTable"
            columns={columns}
            customStyles={customStyles}
            data={data?.conditions || []}
            noHeader
            pagination
            paginationPerPage={5}
          />
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
