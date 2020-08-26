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
import { Button } from '../../buttons'
import { Modal, ModalProps } from '../../common/Modal'
import { ButtonContainer } from '../../pureStyledComponents/ButtonContainer'
import { Row } from '../../pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from '../../pureStyledComponents/StripedList'
import { TitleValue } from '../../text/TitleValue'

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
      <DataTable
        className="outerTableWrapper inlineTable"
        columns={columns}
        customStyles={customStyles}
        data={data?.conditions || []}
        highlightOnHover
        noHeader
        pagination
        paginationPerPage={5}
      />

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
