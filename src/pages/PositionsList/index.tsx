import { useDebounceCallback } from '@react-hook/debounce'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useHistory } from 'react-router-dom'

import { ButtonDots } from 'components/buttons/ButtonDots'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CollateralFilterDropdown } from 'components/common/CollateralFilterDropdown'
import { Dropdown, DropdownItem, DropdownPosition } from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { SearchField } from 'components/form/SearchField'
import { TransferOutcomeTokensModal } from 'components/modals/TransferOutcomeTokensModal'
import { UnwrapModal } from 'components/modals/UnwrapModal'
import { WrapModal } from 'components/modals/WrapModal'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { IconTypes } from 'components/statusInfo/common'
import { CellHash } from 'components/table/CellHash'
import { TableControls } from 'components/table/TableControls'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { PositionWithUserBalanceWithDecimals, usePositions } from 'hooks'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { customStyles } from 'theme/tableCustomStyles'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import { CollateralFilterOptions, LocalStorageManagement, Token, TransferOptions } from 'util/types'

const logger = getLogger('PositionsList')

export const PositionsList = () => {
  const { _type: status, CTService, WrapperService, connect, signer } = useWeb3ConnectedOrInfura()
  const history = useHistory()
  const { setValue } = useLocalStorage(LocalStorageManagement.PositionId)

  const [positionIdToSearch, setPositionIdToSearch] = useState<string>('')
  const [positionIdToShow, setPositionIdToShow] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [connectedItems, setConnectedItems] = useState<Array<any>>([])
  const [selectedCollateralFilter, setSelectedCollateralFilter] = useState<string>('')
  const [selectedCollateralValue, setSelectedCollateralValue] = useState<string>(
    CollateralFilterOptions.All
  )
  const [isTransferOutcomeModalOpen, setIsTransferOutcomeModalOpen] = useState(false)
  const [selectedPositionId, setSelectedPositionId] = useState<string>('')
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<Maybe<Token>>(null)
  const [transfer, setTransfer] = useState<Remote<TransferOptions>>(
    Remote.notAsked<TransferOptions>()
  )
  const [transactionTitle, setTransactionTitle] = useState<string>('')
  const [isWrapModalOpen, setIsWrapModalOpen] = useState(false)
  const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false)
  const [userBalance, setUserBalance] = useState(new BigNumber(0))

  const debouncedHandlerPositionIdToSearch = useDebounceCallback((positionIdToSearch) => {
    setPositionIdToSearch(positionIdToSearch)
  }, 500)

  const onChangePositionId = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget
      setPositionIdToShow(value)
      debouncedHandlerPositionIdToSearch(value)
    },
    [debouncedHandlerPositionIdToSearch]
  )

  const { data, error, loading, refetchPositions, refetchUserPositions } = usePositions({
    positionId: positionIdToSearch,
    collateralFilter: selectedCollateralFilter,
    collateralValue: selectedCollateralValue,
  })

  const isLoading = !positionIdToSearch && loading && transfer.isNotAsked()
  const isSearching = positionIdToSearch && loading

  const buildMenuForRow = useCallback(
    (row: PositionWithUserBalanceWithDecimals) => {
      const { collateralTokenERC1155, id, userBalanceERC20, userBalanceERC1155 } = row

      const menu = [
        {
          text: 'Details',
          onClick: () => history.push(`/positions/${id}`),
        },
        {
          text: 'Redeem',
          onClick: () => {
            setValue(id)
            history.push(`/redeem`)
          },
        },
      ]

      if (!userBalanceERC1155.isZero() && signer) {
        const menuERC1155 = [
          {
            text: 'Transfer Outcome Tokens',
            onClick: () => {
              setSelectedPositionId(id)
              setSelectedCollateralToken(collateralTokenERC1155)
              setIsTransferOutcomeModalOpen(true)
            },
          },
          {
            text: 'Wrap ERC1155',
            onClick: () => {
              setSelectedPositionId(id)
              setSelectedCollateralToken(collateralTokenERC1155)
              setUserBalance(userBalanceERC1155)
              setIsWrapModalOpen(true)
            },
          },
        ]
        menu.push(...menuERC1155)
      }

      if (!userBalanceERC20.isZero() && signer) {
        const menuERC20 = [
          {
            text: 'Unwrap ERC20',
            onClick: () => {
              setSelectedPositionId(id)
              // Must send the original token, not the ERC20
              setSelectedCollateralToken(collateralTokenERC1155)
              setUserBalance(userBalanceERC20)
              setIsUnwrapModalOpen(true)
            },
          },
        ]
        menu.push(...menuERC20)
      }

      return menu
    },
    [history, setValue, signer]
  )

  const handleRowClick = useCallback(
    (row: PositionWithUserBalanceWithDecimals) => {
      history.push(`/positions/${row.id}`)
    },
    [history]
  )

  const menu = useMemo(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <Dropdown
            activeItemHighlight={false}
            dropdownButtonContent={<ButtonDots />}
            dropdownPosition={DropdownPosition.right}
            items={buildMenuForRow(row).map((item, index) => (
              <DropdownItem key={index} onClick={item.onClick}>
                {item.text}
              </DropdownItem>
            ))}
          />
        ),
        name: '',
        width: '60px',
        right: true,
      },
    ]
  }, [buildMenuForRow])

  useEffect(() => {
    if (status === Web3ContextStatus.Connected) {
      setConnectedItems([
        {
          // eslint-disable-next-line react/display-name
          cell: (row: PositionWithUserBalanceWithDecimals) => (
            <span
              onClick={() => handleRowClick(row)}
              {...(row.userBalanceERC1155WithDecimals
                ? { title: row.userBalanceERC1155.toString() }
                : {})}
            >
              {row.userBalanceERC1155WithDecimals}
            </span>
          ),
          name: 'ERC1155 Amount',
          right: true,
          selector: 'userBalanceERC1155Numbered',
          sortable: true,
        },
        {
          // eslint-disable-next-line react/display-name
          cell: (row: PositionWithUserBalanceWithDecimals) => (
            <span
              onClick={() => handleRowClick(row)}
              {...(row.userBalanceERC20WithDecimals
                ? { title: row.userBalanceERC20.toString() }
                : {})}
            >
              {row.userBalanceERC20WithDecimals}
            </span>
          ),
          name: 'ERC20 Amount',
          right: true,
          selector: 'userBalanceERC20Numbered',
          sortable: true,
        },
      ])
    }
  }, [status, buildMenuForRow, handleRowClick])

  const getColumns = useCallback(() => {
    // If you move this outside of the useCallback, can cause performance issues as a dep of this useCallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultColumns: Array<any> = [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <CellHash onClick={() => handleRowClick(row)} underline value={row.id} />
        ),
        name: 'Position Id',
        selector: 'createTimestamp',
        sortable: true,
        minWidth: '250px',
      },
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => {
          const { collateralTokenERC1155 } = row
          // Please don't delete this because the tests will explode
          return collateralTokenERC1155 ? (
            <TokenIcon symbol={collateralTokenERC1155.symbol || ''} />
          ) : (
            row.collateralToken
          )
        },
        name: 'Collateral',
        selector: 'collateralTokenSymbol',
        sortable: true,
      },
    ]

    return [...defaultColumns, ...connectedItems, ...menu]
  }, [connectedItems, menu, handleRowClick])

  const onWrap = useCallback(
    async (transferValue: TransferOptions) => {
      if (signer) {
        try {
          setTransactionTitle('Wrapping ERC1155')
          setTransfer(Remote.loading())

          const { address: addressTo, amount, positionId } = transferValue
          const addressFrom = await signer.getAddress()

          await CTService.safeTransferFrom(addressFrom, addressTo, positionId, amount)

          refetchPositions()
          refetchUserPositions()

          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      } else {
        connect()
      }
    },
    [setTransfer, CTService, connect, refetchPositions, refetchUserPositions, signer]
  )

  const onUnwrap = useCallback(
    async (transferValue: TransferOptions) => {
      if (signer) {
        try {
          setTransactionTitle('Unwrapping ERC20')
          setTransfer(Remote.loading())

          const { address: addressFrom, amount, positionId } = transferValue
          const addressTo = await signer.getAddress()

          await WrapperService.unwrap(addressFrom, positionId, amount, addressTo)

          refetchPositions()
          refetchUserPositions()

          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      } else {
        connect()
      }
    },
    [WrapperService, connect, signer, setTransfer, refetchPositions, refetchUserPositions]
  )

  const onTransferOutcomeTokens = useCallback(
    async (transferValue: TransferOptions) => {
      if (signer) {
        try {
          setTransactionTitle('Transfer Outcome Tokens')
          setTransfer(Remote.loading())

          const { address: addressTo, amount, positionId } = transferValue
          const addressFrom = await signer.getAddress()
          await CTService.safeTransferFrom(addressFrom, addressTo, positionId, amount)

          refetchPositions()
          refetchUserPositions()

          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      } else {
        connect()
      }
    },
    [signer, CTService, connect, refetchUserPositions, refetchPositions]
  )

  const fullLoadingActionButton = transfer.isSuccess()
    ? {
        buttonType: ButtonType.primary,
        text: 'OK',
        onClick: () => setTransfer(Remote.notAsked<TransferOptions>()),
      }
    : transfer.isFailure()
    ? {
        buttonType: ButtonType.danger,
        text: 'Close',
        onClick: () => setTransfer(Remote.notAsked<TransferOptions>()),
      }
    : undefined

  const fullLoadingIcon = transfer.isFailure()
    ? IconTypes.error
    : transfer.isSuccess()
    ? IconTypes.ok
    : IconTypes.spinner

  const fullLoadingMessage = transfer.isFailure()
    ? transfer.getFailure()
    : transfer.isLoading()
    ? 'Working...'
    : 'All done!'

  const fullLoadingTitle = transfer.isFailure() ? 'Error' : transactionTitle

  return (
    <>
      <PageTitle>Positions</PageTitle>
      {isLoading && !error && <InlineLoading />}
      {error && <InfoCard message={error.message} title="Error" />}
      {data && !isLoading && !error && (
        <>
          <TableControls
            end={
              <CollateralFilterDropdown
                onClick={(symbol: string, address: string) => {
                  setSelectedCollateralFilter(address)
                  setSelectedCollateralValue(symbol)
                }}
                value={selectedCollateralValue}
              />
            }
            start={
              <SearchField
                onChange={onChangePositionId}
                placeholder="Search by position id..."
                value={positionIdToShow}
              />
            }
          />
          {isSearching && <InlineLoading />}
          {!isSearching && (
            <DataTable
              className="outerTableWrapper"
              columns={getColumns()}
              customStyles={customStyles}
              data={data || []}
              highlightOnHover
              noDataComponent={<EmptyContentText>No positions found.</EmptyContentText>}
              noHeader
              onRowClicked={handleRowClick}
              pagination
              responsive
            />
          )}
          {isWrapModalOpen && selectedCollateralToken && (
            <WrapModal
              balance={userBalance}
              decimals={selectedCollateralToken.decimals}
              isOpen={isWrapModalOpen}
              onRequestClose={() => setIsWrapModalOpen(false)}
              onWrap={onWrap}
              positionId={selectedPositionId}
              tokenSymbol={selectedCollateralToken.symbol}
            />
          )}
          {isUnwrapModalOpen && selectedCollateralToken && (
            <UnwrapModal
              balance={userBalance}
              decimals={selectedCollateralToken.decimals}
              isOpen={isUnwrapModalOpen}
              onRequestClose={() => setIsUnwrapModalOpen(false)}
              onUnWrap={onUnwrap}
              positionId={selectedPositionId}
              tokenSymbol={selectedCollateralToken.symbol}
            />
          )}
          {isTransferOutcomeModalOpen && selectedPositionId && selectedCollateralToken && (
            <TransferOutcomeTokensModal
              collateralToken={selectedCollateralToken.address}
              isOpen={isTransferOutcomeModalOpen}
              onRequestClose={() => setIsTransferOutcomeModalOpen(false)}
              onSubmit={onTransferOutcomeTokens}
              positionId={selectedPositionId}
            />
          )}
          {(transfer.isLoading() || transfer.isFailure() || transfer.isSuccess()) && (
            <FullLoading
              actionButton={fullLoadingActionButton}
              icon={fullLoadingIcon}
              message={fullLoadingMessage}
              title={fullLoadingTitle}
              width={transfer.isFailure() ? '400px' : '320px'}
            />
          )}
        </>
      )}
    </>
  )
}
