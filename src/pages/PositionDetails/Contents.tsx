import { BigNumber } from 'ethers/utils'
import uniqby from 'lodash.uniqby'
import React, { useCallback, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ButtonDropdownCircle } from 'components/buttons/ButtonDropdownCircle'
import { ButtonExpand } from 'components/buttons/ButtonExpand'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CenteredCard } from 'components/common/CenteredCard'
import {
  Dropdown,
  DropdownItem,
  DropdownItemCSS,
  DropdownItemProps,
  DropdownPosition,
} from 'components/common/Dropdown'
import { TokenIcon } from 'components/common/TokenIcon'
import { Tooltip } from 'components/common/Tooltip'
import { DisplayHashesTableModal } from 'components/modals/DisplayHashesTableModal'
import { TransferOutcomeTokensModal } from 'components/modals/TransferOutcomeTokensModal'
import { UnwrapModal } from 'components/modals/UnwrapModal'
import { WrapModal } from 'components/modals/WrapModal'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { Outcome } from 'components/partitions/Outcome'
import { CardTextSm } from 'components/pureStyledComponents/CardText'
import { FlexRow } from 'components/pureStyledComponents/FlexRow'
import { OutcomesContainer } from 'components/pureStyledComponents/OutcomesContainer'
import { Row } from 'components/pureStyledComponents/Row'
import {
  StripedList,
  StripedListEmpty,
  StripedListItem,
  StripedListItemLessPadding,
} from 'components/pureStyledComponents/StripedList'
import { FullLoading } from 'components/statusInfo/FullLoading'
import { IconTypes } from 'components/statusInfo/common'
import { FormatHash } from 'components/text/FormatHash'
import { TitleValue } from 'components/text/TitleValue'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useCollateral } from 'hooks/useCollateral'
import { useIsConditionFromOmen } from 'hooks/useIsConditionFromOmen'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { GetPosition_position as Position } from 'types/generatedGQLForCTE'
import { getLogger } from 'util/logger'
import { Remote } from 'util/remoteData'
import {
  formatBigNumber,
  formatTS,
  getRealityQuestionUrl,
  indexSetToBase2,
  positionString,
  truncateStringInTheMiddle,
} from 'util/tools'
import {
  HashArray,
  LocalStorageManagement,
  NetworkIds,
  OutcomeProps,
  TransferOptions,
} from 'util/types'

const CollateralText = styled.span`
  color: ${(props) => props.theme.colors.darkerGrey};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  max-width: 50%;
  text-align: left;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    max-width: none;
  }
`

const CollateralTextStrong = styled.span`
  font-weight: 600;
`

const CollateralTextAmount = styled.span<{ italic?: boolean }>`
  font-style: ${(props) => (props.italic ? 'italic' : 'normal')};
`

const CollateralWrapButton = styled(Button)`
  font-size: 14px;
  font-weight: 600;
  height: 24px;
  width: 80px;
`

const StripedListStyled = styled(StripedList)`
  margin-top: 6px;
`

const DropdownItemLink = styled(NavLink)<DropdownItemProps>`
  ${DropdownItemCSS}
`

const LinkCSS = css`
  color: ${(props) => props.theme.colors.textColor};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

const InternalLink = styled(NavLink)`
  ${LinkCSS}
`

const Link = styled.a`
  ${LinkCSS}
`

const TooltipStyled = styled(Tooltip)`
  cursor: pointer;
  margin: 0 0 0 8px;
  position: relative;
  top: -1px;
`

interface Props {
  balanceERC1155: BigNumber
  balanceERC20: BigNumber
  conditions: Array<HashArray>
  collateralTokenAddress: string
  position: Position
  refetchBalances: () => void
  wrappedTokenAddress: string
}

const logger = getLogger('Contents')

export const Contents = (props: Props) => {
  const {
    _type: status,
    CTService,
    WrapperService,
    connect,
    networkConfig,
    signer,
  } = useWeb3ConnectedOrInfura()
  const {
    balanceERC20,
    balanceERC1155,
    collateralTokenAddress,
    conditions,
    position,
    refetchBalances,
    wrappedTokenAddress,
  } = props

  const { createTimestamp, id: positionId, indexSets } = position
  const { setValue } = useLocalStorage(LocalStorageManagement.PositionId)

  const { collateral: collateralERC1155 } = useCollateral(collateralTokenAddress)
  const { collateral: collateralERC20 } = useCollateral(wrappedTokenAddress)

  const [isWrapModalOpen, setIsWrapModalOpen] = useState(false)
  const [isUnwrapModalOpen, setIsUnwrapModalOpen] = useState(false)
  const [openTransferOutcomeTokensModal, setOpenTransferOutcomeTokensModal] = useState(false)
  const [openDisplayConditionsTableModal, setOpenDisplayConditionsTableModal] = useState(false)
  const [openDisplayQuestionIdsTableModal, setOpenDisplayQuestionIdsTableModal] = useState(false)
  const [openDisplayOraclesIdsTableModal, setOpenDisplayOraclesIdsTableModal] = useState(false)

  const [transfer, setTransfer] = useState<Remote<TransferOptions>>(
    Remote.notAsked<TransferOptions>()
  )
  const [transactionTitle, setTransactionTitle] = useState<string>('')

  const oracleIds = useMemo(() => uniqby(position.conditions, 'oracle').map((c) => c.oracle), [
    position,
  ])
  const questionIds = useMemo(
    () => uniqby(position.conditions, 'questionId').map((c) => c.questionId),
    [position]
  )

  const areQuestionIdsMoreThanOne = useMemo(() => questionIds.length > 1, [questionIds])
  const areOracleIdsMoreThanOne = useMemo(() => oracleIds.length > 1, [oracleIds])
  const areConditionsMoreThanOne = useMemo(() => conditions.length > 1, [conditions])

  const positionPreview = useMemo(() => {
    if (collateralERC1155 && balanceERC1155) {
      return positionString(
        position.conditionIds,
        position.indexSets,
        balanceERC1155,
        collateralERC1155
      )
    }
  }, [collateralERC1155, position, balanceERC1155])

  const numberedOutcomes = useMemo(() => {
    return indexSets.map((indexSet: string) => {
      return indexSetToBase2(indexSet)
        .split('')
        .reverse()
        .map((value, index) => (value === '1' ? index + 1 : 0))
        .filter((n) => !!n)
        .map((n) => n - 1)
    })
  }, [indexSets])

  const isConditionFromOmen = useIsConditionFromOmen(oracleIds[0])

  const ERC1155Symbol = useMemo(
    () => (collateralERC1155 && collateralERC1155.symbol ? collateralERC1155.symbol : ''),
    [collateralERC1155]
  )

  const ERC1155Decimals = useMemo(
    () => (collateralERC1155 && collateralERC1155.decimals ? collateralERC1155.decimals : 18),
    [collateralERC1155]
  )

  const ERC20Symbol = useMemo(
    () => (collateralERC20 && collateralERC20.symbol ? collateralERC20.symbol : ''),
    [collateralERC20]
  )

  const wtmAddress = useMemo(() => (wrappedTokenAddress ? wrappedTokenAddress : ''), [
    wrappedTokenAddress,
  ])

  const onWrap = useCallback(
    async (transferValue: TransferOptions) => {
      if (signer) {
        try {
          setTransactionTitle('Wrapping ERC1155')
          setTransfer(Remote.loading())

          const { address: addressTo, amount, positionId } = transferValue
          const addressFrom = await signer.getAddress()

          await CTService.safeTransferFrom(addressFrom, addressTo, positionId, amount)

          refetchBalances()

          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      } else {
        connect()
      }
    },
    [setTransfer, CTService, connect, refetchBalances, signer]
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

          refetchBalances()

          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      } else {
        connect()
      }
    },
    [WrapperService, connect, signer, setTransfer, refetchBalances]
  )

  const onTransferOutcomeTokens = useCallback(
    async (transferValue: TransferOptions) => {
      if (signer) {
        try {
          setTransfer(Remote.loading())
          setTransactionTitle('Transfer Tokens')

          const { address: addressTo, amount, positionId } = transferValue
          const addressFrom = await signer.getAddress()

          await CTService.safeTransferFrom(addressFrom, addressTo, positionId, amount)

          refetchBalances()
          setTransfer(Remote.success(transferValue))
        } catch (err) {
          logger.error(err)
          setTransfer(Remote.failure(err))
        }
      }
    },
    [signer, CTService, refetchBalances]
  )

  const fullLoadingActionButton = transfer.isSuccess()
    ? {
        buttonType: ButtonType.primary,
        onClick: () => setTransfer(Remote.notAsked<TransferOptions>()),
        text: 'OK',
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
  const outcomesByRow = '14'

  const isConnected = useMemo(() => status === Web3ContextStatus.Connected, [status])
  const isSigner = useMemo(() => signer !== null, [signer])
  const userHasBalance = useMemo(() => balanceERC1155 && !balanceERC1155.isZero(), [balanceERC1155])

  const dropdownItems = useMemo(() => {
    const menu = [
      {
        disabled: !userHasBalance || !isConnected,
        href: `/redeem`,
        onClick: () => {
          setValue(positionId)
        },
        text: 'Redeem',
      },
      {
        disabled: !userHasBalance || !isConnected,
        href: `/split`,
        onClick: () => {
          setValue(positionId)
        },
        text: 'Split',
      },
      {
        disabled: !userHasBalance || !isConnected || !isSigner,
        href: '',
        text: 'Transfer Outcome Tokens',
        onClick: () => {
          setOpenTransferOutcomeTokensModal(true)
        },
      },
    ]

    return menu
  }, [setValue, positionId, isConnected, isSigner, userHasBalance])

  const conditionIdLink = (id: string) => {
    return (
      <>
        <InternalLink to={`/conditions/${id}`}>
          <FormatHash hash={truncateStringInTheMiddle(id, 8, 6)} />
        </InternalLink>
        <ButtonCopy value={id} />
      </>
    )
  }

  const getEtherscanFormattedUrl = useCallback(
    (etherscanURL: string, address: string): string => {
      return networkConfig.networkId === NetworkIds.GANACHE
        ? '#'
        : networkConfig.networkId === NetworkIds.MAINNET
        ? `https://${etherscanURL}${address}`
        : `https://rinkeby.${etherscanURL}${address}`
    },
    [networkConfig.networkId]
  )

  const getEtherscanTokenUrl = useCallback(
    (address: string): string => {
      const etherscanURL = `etherscan.io/token/`

      return getEtherscanFormattedUrl(etherscanURL, address)
    },
    [getEtherscanFormattedUrl]
  )

  const getEtherscanContractUrl = useCallback(
    (address: string): string => {
      const etherscanURL = `etherscan.io/address/`

      return getEtherscanFormattedUrl(etherscanURL, address)
    },
    [getEtherscanFormattedUrl]
  )

  const isWorking = transfer.isLoading() || transfer.isFailure() || transfer.isSuccess()

  const oracleTitle = useMemo(() => {
    if (isConditionFromOmen) {
      return areQuestionIdsMoreThanOne ? 'Oracles' : 'Oracle'
    } else {
      return areQuestionIdsMoreThanOne ? 'Reporting Addresses' : 'Reporting Address'
    }
  }, [isConditionFromOmen, areQuestionIdsMoreThanOne])

  const oracleName = useMemo(
    () =>
      isConditionFromOmen ? (
        networkConfig.getOracleFromAddress(oracleIds[0]).description
      ) : (
        <FormatHash hash={truncateStringInTheMiddle(oracleIds[0], 8, 6)} />
      ),
    [networkConfig, oracleIds, isConditionFromOmen]
  )

  const getRealityQuestionUrlMemoized = useCallback(
    (questionId: string): string => getRealityQuestionUrl(questionId, networkConfig),
    [networkConfig]
  )

  return (
    <CenteredCard
      dropdown={
        <Dropdown
          activeItemHighlight={false}
          dropdownButtonContent={<ButtonDropdownCircle />}
          dropdownPosition={DropdownPosition.right}
          items={dropdownItems.map((item, index) => {
            if (item.href) {
              return (
                <DropdownItemLink
                  disabled={item.disabled}
                  key={index}
                  onMouseDown={item.onClick}
                  to={item.href}
                >
                  {item.text}
                </DropdownItemLink>
              )
            } else {
              return (
                <DropdownItem disabled={item.disabled} key={index} onClick={item.onClick}>
                  {item.text}
                </DropdownItem>
              )
            }
          })}
        />
      }
    >
      <Row marginBottomXL>
        <TitleValue
          title="Position Id"
          value={
            <FlexRow>
              <FormatHash hash={truncateStringInTheMiddle(positionId, 8, 6)} />
              <ButtonCopy value={positionId} />
            </FlexRow>
          }
        />
        <TitleValue
          title="Collateral Token"
          value={collateralERC1155 ? <TokenIcon token={collateralERC1155} /> : '-'}
        />
        <TitleValue
          title="Collateral Address"
          value={
            <FlexRow>
              <Link href={getEtherscanContractUrl(collateralTokenAddress)}>
                <FormatHash hash={truncateStringInTheMiddle(collateralTokenAddress, 8, 6)} />
              </Link>
              <ButtonCopy value={collateralTokenAddress} />
              <ExternalLink href={getEtherscanContractUrl(collateralTokenAddress)} />
            </FlexRow>
          }
        />
        <TitleValue title="Creation Date" value={formatTS(createTimestamp)} />
        <TitleValue
          title={areQuestionIdsMoreThanOne ? 'Question Ids' : 'Question Id'}
          value={
            <FlexRow>
              <FormatHash hash={truncateStringInTheMiddle(questionIds[0], 8, 6)} />
              {!areQuestionIdsMoreThanOne && <ButtonCopy value={questionIds[0]} />}
              {areQuestionIdsMoreThanOne && (
                <ButtonExpand onClick={() => setOpenDisplayQuestionIdsTableModal(true)} />
              )}
            </FlexRow>
          }
        />
        <TitleValue
          title={oracleTitle}
          value={
            <FlexRow>
              {oracleName}
              {!areOracleIdsMoreThanOne && <ButtonCopy value={oracleIds[0]} />}
              {areOracleIdsMoreThanOne && (
                <ButtonExpand onClick={() => setOpenDisplayOraclesIdsTableModal(true)} />
              )}
              {isConditionFromOmen && (
                <ExternalLink href={getRealityQuestionUrlMemoized(questionIds[0])} />
              )}
            </FlexRow>
          }
        />

        {conditions.length > 0 && (
          <TitleValue
            title={!areConditionsMoreThanOne ? 'Condition Id' : 'Condition Ids'}
            value={
              !areConditionsMoreThanOne ? (
                <FlexRow>{conditionIdLink(conditions[0].hash)}</FlexRow>
              ) : (
                <FlexRow>
                  {conditionIdLink(conditions[0].hash)}
                  <ButtonExpand onClick={() => setOpenDisplayConditionsTableModal(true)} />
                </FlexRow>
              )
            }
          />
        )}
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Wrapped Collateral"
          value={
            <StripedListStyled maxHeight="auto">
              <StripedListItem>
                <CollateralText>
                  <CollateralTextStrong>ERC1155:</CollateralTextStrong>{' '}
                  <CollateralTextAmount>
                    {balanceERC1155.isZero() ? (
                      <i>None.</i>
                    ) : (
                      `${formatBigNumber(balanceERC1155, ERC1155Decimals)} ${ERC1155Symbol}`
                    )}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton
                  disabled={!balanceERC1155 || balanceERC1155.isZero()}
                  onClick={() => setIsWrapModalOpen(true)}
                >
                  Wrap
                </CollateralWrapButton>
              </StripedListItem>
              <StripedListItem>
                <CollateralText>
                  <CollateralTextStrong>ERC20:</CollateralTextStrong>{' '}
                  <CollateralTextAmount>
                    {balanceERC20.isZero() ? (
                      <i>None.</i>
                    ) : (
                      <>
                        {`${formatBigNumber(balanceERC20, ERC1155Decimals)} ${ERC20Symbol}`}
                        <TooltipStyled
                          id="balanceERC20"
                          text="Wrapped ERC-1155 (Wrapped Multi Token)"
                        />
                      </>
                    )}
                  </CollateralTextAmount>
                </CollateralText>
                <CollateralWrapButton
                  disabled={!balanceERC20 || balanceERC20.isZero()}
                  onClick={() => setIsUnwrapModalOpen(true)}
                >
                  Unwrap
                </CollateralWrapButton>
              </StripedListItem>
            </StripedListStyled>
          }
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Wrapped Collateral Address"
          value={
            balanceERC20.isZero() ? (
              <i>None.</i>
            ) : (
              <FlexRow>
                <Link href={getEtherscanTokenUrl(wtmAddress)}>
                  <FormatHash hash={truncateStringInTheMiddle(wtmAddress, 8, 6)} />
                </Link>
                <ButtonCopy value={wtmAddress} />
                <ExternalLink href={getEtherscanTokenUrl(wtmAddress)} />
              </FlexRow>
            )
          }
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Partition"
          value={
            <>
              <CardTextSm>Collections</CardTextSm>
              <StripedListStyled minHeight="auto">
                {numberedOutcomes && numberedOutcomes.length ? (
                  numberedOutcomes
                    .map((value) => {
                      return value.map((value, id) => {
                        return { id: id.toString(), value }
                      })
                    })
                    .map((outcomeList: OutcomeProps[], outcomeListIndex: number) => {
                      return (
                        <StripedListItemLessPadding key={outcomeListIndex}>
                          <OutcomesContainer columnGap="0" columns={outcomesByRow}>
                            {outcomeList.map((outcome: OutcomeProps, outcomeIndex: number) => (
                              <Outcome
                                key={outcomeIndex}
                                lastInRow={outcomesByRow}
                                outcome={outcome}
                              />
                            ))}
                          </OutcomesContainer>
                        </StripedListItemLessPadding>
                      )
                    })
                ) : (
                  <StripedListEmpty>No Collections.</StripedListEmpty>
                )}
              </StripedListStyled>
            </>
          }
        />
      </Row>
      <Row cols="1fr" marginBottomXL>
        <TitleValue
          title="Position Preview"
          value={<StripedListItem>{positionPreview || ''} </StripedListItem>}
        />
      </Row>
      {isWrapModalOpen && (
        <WrapModal
          balance={balanceERC1155}
          decimals={ERC1155Decimals}
          isOpen={isWrapModalOpen}
          onRequestClose={() => setIsWrapModalOpen(false)}
          onWrap={onWrap}
          positionId={positionId}
          tokenSymbol={ERC1155Symbol}
        />
      )}
      {isUnwrapModalOpen && (
        <UnwrapModal
          balance={balanceERC20}
          decimals={ERC1155Decimals}
          isOpen={isUnwrapModalOpen}
          onRequestClose={() => setIsUnwrapModalOpen(false)}
          onUnWrap={onUnwrap}
          positionId={positionId}
          tokenSymbol={ERC20Symbol}
        />
      )}
      {openTransferOutcomeTokensModal && positionId && collateralTokenAddress && (
        <TransferOutcomeTokensModal
          collateralToken={collateralTokenAddress}
          isOpen={openTransferOutcomeTokensModal}
          onRequestClose={() => setOpenTransferOutcomeTokensModal(false)}
          onSubmit={onTransferOutcomeTokens}
          positionId={positionId}
        />
      )}
      {openDisplayConditionsTableModal && areConditionsMoreThanOne && (
        <DisplayHashesTableModal
          hashes={conditions}
          isOpen={openDisplayConditionsTableModal}
          onRequestClose={() => setOpenDisplayConditionsTableModal(false)}
          title="Conditions"
          titleTable="Condition Id"
          url="condition"
        />
      )}
      {openDisplayOraclesIdsTableModal && areOracleIdsMoreThanOne && (
        <DisplayHashesTableModal
          hashes={oracleIds.map((id) => {
            return { hash: id }
          })}
          isOpen={openDisplayOraclesIdsTableModal}
          onRequestClose={() => setOpenDisplayOraclesIdsTableModal(false)}
          title="Oracles"
          titleTable="Oracle Id"
          url=""
        />
      )}
      {openDisplayQuestionIdsTableModal && areQuestionIdsMoreThanOne && (
        <DisplayHashesTableModal
          hashes={questionIds.map((id) => {
            return { hash: id }
          })}
          isOpen={openDisplayQuestionIdsTableModal}
          onRequestClose={() => setOpenDisplayQuestionIdsTableModal(false)}
          title="Question Ids"
          titleTable="Question Id"
          url=""
        />
      )}
      {isWorking && (
        <FullLoading
          actionButton={fullLoadingActionButton}
          icon={fullLoadingIcon}
          message={fullLoadingMessage}
          title={fullLoadingTitle}
        />
      )}
    </CenteredCard>
  )
}
