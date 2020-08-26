import { truncateStringInTheMiddle } from 'util/tools'

import { useQuery } from '@apollo/react-hooks'
import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/modal'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { ConditionsListQuery } from 'queries/conditions'
import React, { useCallback, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'
import { Conditions, Conditions_conditions, GetCondition_condition } from 'types/generatedGQL'

import { IconPlus } from './img/IconPlus'

const ButtonControl = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  height: 20px;
  outline: none;
  padding: 0;
  width: 20px;
`

interface Props extends ModalProps {
  onConfirm?: (condition: Conditions_conditions) => void
}

export const SelectConditionModal: React.FC<Props> = (props) => {
  const { onConfirm, ...restProps } = props
  const { data } = useQuery<Conditions>(ConditionsListQuery)
  const [selectedCondition, setSelectedCondition] = useState<Maybe<GetCondition_condition>>(null)
  const { setCondition } = useConditionContext()

  const handleAddClick = useCallback((selected) => {
    setSelectedCondition(selected)
  }, [])

  const columns = useMemo(
    () => [
      {
        name: 'Id',
        selector: 'id',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => <div>{truncateStringInTheMiddle(row.id, 8, 6)}</div>,
      },
      {
        name: 'Oracle',
        selector: 'oracle',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <div>{truncateStringInTheMiddle(row.oracle, 8, 6)}</div>
        ),
      },
      {
        name: 'Question Id',
        selector: 'questionId',
        sortable: true,
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <div>{truncateStringInTheMiddle(row.questionId, 8, 6)}</div>
        ),
      },
      {
        name: '',
        button: true,
        ignoreRowClick: true,
        maxWidth: '24px',
        minWidth: '24px',
        // eslint-disable-next-line react/display-name
        cell: (row: Conditions_conditions) => (
          <ButtonControl onClick={() => handleAddClick(row)}>
            <IconPlus />
          </ButtonControl>
        ),
      },
    ],
    [handleAddClick]
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
    <Modal {...restProps} subTitle={'Select one condition.'} title={'Select Condition'}>
      <Row cols="1fr">
        <DataTable
          columns={columns}
          data={data?.conditions || []}
          noHeader={true}
          pagination={true}
          paginationPerPage={5}
          style={{
            width: '100%',
          }}
        />
      </Row>
      <Row cols="1fr">
        <TitleValue
          title="Selected Condition"
          value={
            <StripedList maxHeight={'160px'}>
              {selectedCondition ? (
                <StripedListItem>
                  {truncateStringInTheMiddle(selectedCondition.id, 8, 6)}
                </StripedListItem>
              ) : (
                <StripedListEmpty>No condition selected.</StripedListEmpty>
              )}
            </StripedList>
          }
        />
      </Row>
      <ButtonContainer>
        <Button disabled={!selectedCondition} onClick={handleDone}>
          Done
        </Button>
      </ButtonContainer>
    </Modal>
  )
}
