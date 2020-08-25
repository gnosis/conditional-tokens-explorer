import { truncateStringInTheMiddle } from 'util/tools'

import { useQuery } from '@apollo/react-hooks'
import { Button } from 'components/buttons'
import { Modal, ModalBasicProps } from 'components/common/Modal'
import { TokenIcon } from 'components/common/TokenIcon'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
} from 'components/pureStyledComponents/StripedList'
import { CellHash } from 'components/table/CellHash'
import { TitleValue } from 'components/text/TitleValue'
import { useConditionContext } from 'contexts/ConditionContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, usePositions } from 'hooks'
import { ConditionsListQuery } from 'queries/conditions'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'
import { Conditions, Conditions_conditions, GetCondition_condition } from 'types/generatedGQL'

import { IconPlus } from '../SelectConditionModal/img/IconPlus'

interface ModalProps extends ModalBasicProps {
  isOpen: boolean
  singlePosition?: boolean
  onConfirm?: (positions: Array<Position>) => void
  onRequestClose?: () => void
}

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

export const SelectPositionModal: React.FC<ModalProps> = (props) => {
  const { onConfirm, singlePosition, ...restProps } = props
  const [selectedPositions, setSelectedPositions] = useState<Array<Position>>([])
  const { data, error, loading } = usePositions('')
  const { _type: status, networkConfig } = useWeb3ConnectedOrInfura()

  const handleAddClick = useCallback((selected) => {
    setSelectedPositions((current) => [...current, selected])
  }, [])

  const defaultColumns: Array<any> = useMemo(
    () => [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => <CellHash underline value={row.id} />,
        name: 'Position Id',
        selector: 'id',
        sortable: true,
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: Position) => {
          return networkConfig ? (
            <TokenIcon symbol={networkConfig.getTokenFromAddress(row.collateralToken).symbol} />
          ) : (
            row.collateralToken
          )
        },
        name: 'Collateral',
        selector: 'collateralToken',
        sortable: true,
      },
    ],
    [networkConfig]
  )

  const buttonCell = useMemo(
    () => ({
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
    }),
    [handleAddClick]
  )

  const [connectedItems, setConnectedItems] = useState<Array<any>>([])

  useEffect(() => {
    if (status === Web3ContextStatus.Connected) {
      setConnectedItems([
        {
          // eslint-disable-next-line react/display-name
          cell: (row: Position) => row.userBalance.toString(),
          name: 'ERC1155 Amount',
          right: true,
          selector: 'userBalance',
          sortable: true,
        },
      ])
    }
  }, [status])

  const getColumns = useCallback(() => {
    return [...defaultColumns, ...connectedItems, buttonCell]
  }, [connectedItems, defaultColumns, buttonCell])

  return (
    <Modal
      {...restProps}
      subTitle={singlePosition ? 'Select one Position.' : 'Select multiple Positions.'}
      title={'Select Position'}
    >
      <Row cols="1fr">
        <DataTable
          columns={getColumns()}
          data={data || []}
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
          title={singlePosition ? 'Selected Position' : 'Selected Positions'}
          value={
            selectedPositions.length ? (
              <DataTable
                columns={getColumns()}
                data={selectedPositions}
                noHeader={true}
                pagination={false}
                style={{
                  width: '100%',
                }}
              />
            ) : (
              <StripedList maxHeight={'160px'}>
                <StripedListEmpty>No positions selected.</StripedListEmpty>
              </StripedList>
            )
          }
        />
      </Row>
    </Modal>
  )
}
