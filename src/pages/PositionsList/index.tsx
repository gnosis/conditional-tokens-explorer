import { useDebounceCallback } from '@react-hook/debounce'
import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { NavLink, useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonDots } from 'components/buttons/ButtonDots'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import {
  Dropdown,
  DropdownItem,
  DropdownItemCSS,
  DropdownPosition,
} from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { CollateralFilterDropdown } from 'components/filters/CollateralFilterDropdown'
import { DateFilter } from 'components/filters/DateFilter'
import { WrappedCollateralFilterDropdown } from 'components/filters/WrappedCollateralFilterDropdown'
import { Switch } from 'components/form/Switch'
import { TransferOutcomeTokensModal } from 'components/modals/TransferOutcomeTokensModal'
import { UnwrapModal } from 'components/modals/UnwrapModal'
import { WrapModal } from 'components/modals/WrapModal'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { Sidebar } from 'components/pureStyledComponents/Sidebar'
import { SidebarRow } from 'components/pureStyledComponents/SidebarRow'
import { TwoColumnsCollapsibleLayout } from 'components/pureStyledComponents/TwoColumnsCollapsibleLayout'
import { SearchField } from 'components/search/SearchField'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { InfoCard } from 'components/statusInfo/InfoCard'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { IconTypes } from 'components/statusInfo/common'
import { CellHash } from 'components/table/CellHash'
import { TableControls } from 'components/table/TableControls'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { PositionWithUserBalanceWithDecimals, usePositions } from 'hooks'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { usePositionsSearchOptions } from 'hooks/usePositionsSearchOptions'
import { customStyles } from 'theme/tableCustomStyles'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import {
  CollateralFilterOptions,
  LocalStorageManagement,
  Token,
  TransferOptions,
  WrappedCollateralOptions,
} from 'util/types'

const DropdownItemLink = styled(NavLink)<{ isItemActive?: boolean }>`
  ${DropdownItemCSS}
`

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
  const [wrappedCollateral, setWrappedCollateral] = useState<WrappedCollateralOptions>(
    WrappedCollateralOptions.All
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

  const onClearSearch = React.useCallback(() => {
    setPositionIdToShow('')
    debouncedHandlerPositionIdToSearch('')
  }, [debouncedHandlerPositionIdToSearch])

  const { data, error, loading, refetchPositions, refetchUserPositions } = usePositions({
    collateralFilter: selectedCollateralFilter,
    collateralValue: selectedCollateralValue,
    positionId: positionIdToSearch,
  })

  const isLoading = !positionIdToSearch && loading && transfer.isNotAsked()
  const isSearching = positionIdToSearch && loading

  const buildMenuForRow = useCallback(
    (row: PositionWithUserBalanceWithDecimals) => {
      const { collateralTokenERC1155, id, userBalanceERC20, userBalanceERC1155 } = row

      const menu = [
        {
          href: `/positions/${id}`,
          onClick: undefined,
          text: 'Details',
        },
        {
          href: `/redeem`,
          text: 'Redeem',
          onClick: () => {
            setValue(id)
          },
        },
      ]

      if (!userBalanceERC1155.isZero() && signer) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const menuERC1155: Array<any> = [
          {
            href: undefined,
            text: 'Transfer Outcome Tokens',
            onClick: () => {
              setSelectedPositionId(id)
              setSelectedCollateralToken(collateralTokenERC1155)
              setIsTransferOutcomeModalOpen(true)
            },
          },
          {
            href: undefined,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const menuERC20: Array<any> = [
          {
            href: undefined,
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
    [setValue, signer]
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
            items={buildMenuForRow(row).map((item, index) => {
              if (item.href) {
                return (
                  <DropdownItemLink onMouseDown={item.onClick} to={item.href}>
                    {item.text}
                  </DropdownItemLink>
                )
              } else {
                return (
                  <DropdownItem key={index} onClick={item.onClick}>
                    {item.text}
                  </DropdownItem>
                )
              }
            })}
          />
        ),
        name: '',
        width: '60px',
        right: true,
      },
    ]
  }, [buildMenuForRow])

  useEffect(() => {
    const isConnected = status === Web3ContextStatus.Connected

    setConnectedItems([
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <span
            onClick={() => handleRowClick(row)}
            title={
              isConnected
                ? row.userBalanceERC1155.toString()
                : 'Connect your wallet to access ERC1155 values.'
            }
          >
            {isConnected ? row.userBalanceERC1155WithDecimals : '-'}
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
            title={
              isConnected
                ? row.userBalanceERC20.toString()
                : 'Connect your wallet to access ERC20 values.'
            }
          >
            {isConnected ? row.userBalanceERC20WithDecimals : '-'}
          </span>
        ),
        name: 'ERC20 Amount',
        right: true,
        selector: 'userBalanceERC20Numbered',
        sortable: true,
      },
    ])
  }, [status, handleRowClick])

  const getColumns = useCallback(() => {
    // If you move this outside of the useCallback, can cause performance issues as a dep of this useCallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultColumns: Array<any> = [
      {
        // eslint-disable-next-line react/display-name
        cell: (row: PositionWithUserBalanceWithDecimals) => (
          <CellHash href={`/positions/${row.id}`} value={row.id} />
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
            <TokenIcon onClick={() => handleRowClick(row)} token={collateralTokenERC1155} />
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

  const [searchBy, setSearchBy] = useState('all')
  const dropdownItems = usePositionsSearchOptions(setSearchBy)

  logger.log(`Search by ${searchBy}`)

  const [showFilters, setShowFilters] = useState(false)

  const toggleShowFilters = useCallback(() => {
    setShowFilters(!showFilters)
  }, [showFilters])

  const showSpinner = (isLoading || isSearching) && !error

  return (
    <>
      <PageTitle>Positions</PageTitle>
      <TableControls
        end={
          <SearchField
            dropdownItems={dropdownItems}
            onChange={onChangePositionId}
            onClear={onClearSearch}
            value={positionIdToShow}
          />
        }
        start={<Switch active={showFilters} label="Filters" onClick={toggleShowFilters} />}
      />
      {error && !isLoading && <InfoCard message={error.message} title="Error" />}
      {!error && (
        <TwoColumnsCollapsibleLayout isCollapsed={!showFilters}>
          {showFilters && (
            <Sidebar>
              <SidebarRow>
                <CollateralFilterDropdown
                  onClick={(symbol: string, address: string) => {
                    setSelectedCollateralFilter(address)
                    setSelectedCollateralValue(symbol)
                  }}
                  value={selectedCollateralValue}
                />
              </SidebarRow>
              <SidebarRow>
                <WrappedCollateralFilterDropdown
                  onClick={(value: WrappedCollateralOptions) => {
                    setWrappedCollateral(value)
                  }}
                  value={wrappedCollateral}
                />
              </SidebarRow>
              <SidebarRow>
                <DateFilter
                  onChangeFrom={() => {
                    console.error('onChangeFrom not yet implemented...')
                  }}
                  onChangeTo={() => {
                    console.error('onChangeTo not yet implemented...')
                  }}
                  onSubmit={() => {
                    console.error('Filter by date not implemented yet...')
                  }}
                  title="Creation Date"
                />
              </SidebarRow>
            </Sidebar>
          )}
          <DataTable
            className="outerTableWrapper"
            columns={getColumns()}
            customStyles={customStyles}
            data={showSpinner ? [] : data || []}
            highlightOnHover
            noDataComponent={
              showSpinner ? (
                <InlineLoading />
              ) : (
                <EmptyContentText>No positions found.</EmptyContentText>
              )
            }
            noHeader
            onRowClicked={handleRowClick}
            pagination
            responsive
          />
        </TwoColumnsCollapsibleLayout>
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
  )
}
