import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/common/Modal'
import { TokenIcon } from 'components/common/TokenIcon'
import { IconDelete } from 'components/icons/IconDelete'
import { IconPlusDark } from 'components/icons/IconPlusDark'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { StripedList, StripedListEmpty } from 'components/pureStyledComponents/StripedList'
import { CellHash } from 'components/table/CellHash'
import { TitleValue } from 'components/text/TitleValue'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { Position, usePositions } from 'hooks'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

interface Props extends ModalProps {
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
  /* height: 20px; */
  outline: none;
  padding: 0 24px 0 0;
  /* width: 20px; */
`

export const SelectPositionModal: React.FC<Props> = (props) => {
  const { onConfirm, singlePosition, ...restProps } = props
  const [selectedPositions, setSelectedPositions] = useState<Array<Position>>([])
  const { data, error, loading } = usePositions('')
  const { _type: status, networkConfig } = useWeb3ConnectedOrInfura()
  // const { addPositionId, removePositionId } = useMultiPositionsContext()

  const handleMultiAddClick = useCallback((position: Position) => {
    setSelectedPositions((current) => {
      const included = current.find((selected) => selected.id === position.id)
      return included ? current : [...current, position]
    })
    // addPositionId(position.id)
  }, [])

  const handleSingleAddClick = useCallback((position: Position) => {
    setSelectedPositions([position])
    // addPositionId(position.id)
  }, [])

  const handleRemoveClick = useCallback((position: Position) => {
    setSelectedPositions((current) => {
      return current.filter((selected) => selected.id !== position.id)
    })
    // removePositionId(position.id)
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
        maxWidth: '150px',
        minWidth: '150px',
      },
    ],
    [networkConfig]
  )

  const addCell = useMemo(
    () => ({
      name: '',
      button: true,
      ignoreRowClick: true,
      maxWidth: '48px',
      minWidth: '48px',
      // eslint-disable-next-line react/display-name
      cell: (row: Position) => (
        <ButtonControl
          onClick={() => (singlePosition ? handleSingleAddClick(row) : handleMultiAddClick(row))}
        >
          <IconPlusDark />
        </ButtonControl>
      ),
    }),
    [singlePosition, handleSingleAddClick, handleMultiAddClick]
  )

  const deleteCell = useMemo(
    () => ({
      name: '',
      button: true,
      ignoreRowClick: true,
      maxWidth: '48px',
      minWidth: '48px',
      // eslint-disable-next-line react/display-name
      cell: (row: Position) => (
        <ButtonControl onClick={() => handleRemoveClick(row)}>
          <IconDelete />
        </ButtonControl>
      ),
    }),
    [handleRemoveClick]
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
          maxWidth: '100px',
          minWidth: '100px',
        },
      ])
    }
  }, [status])

  const getPositionsColumns = useCallback(() => {
    return [...defaultColumns, ...connectedItems, addCell]
  }, [connectedItems, defaultColumns, addCell])

  const getSelectedColumns = useCallback(() => {
    return [
      ...defaultColumns.map((col) => ({ ...col, sortable: false })),
      ...connectedItems.map((col) => ({ ...col, sortable: false })),
      deleteCell,
    ]
  }, [defaultColumns, connectedItems, deleteCell])

  const handleDone = useCallback(() => {
    if (selectedPositions.length) {
      if (onConfirm && typeof onConfirm === 'function') {
        onConfirm(selectedPositions)
      }
    }
  }, [onConfirm, selectedPositions])

  return (
    <Modal
      {...restProps}
      subTitle={singlePosition ? 'Select one Position.' : 'Select multiple Positions.'}
      title={'Select Position'}
    >
      <Row cols="1fr">
        <DataTable
          columns={getPositionsColumns()}
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
                columns={getSelectedColumns()}
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
      <ButtonContainer>
        <Button disabled={!selectedPositions.length} onClick={handleDone}>
          Done
        </Button>
      </ButtonContainer>
    </Modal>
  )
}
