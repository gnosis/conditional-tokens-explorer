import { BigNumber } from 'ethers/utils'
import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/common/Modal'
import { Amount } from 'components/form/Amount'
import { InputAddress } from 'components/form/InputAddress'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { StatusInfoInline, StatusInfoType } from 'components/statusInfo/StatusInfoInline'
import { ZERO_BN } from 'config/constants'
import { useWeb3Connected } from 'contexts/Web3Context'
import { useActiveAddress } from 'hooks/useActiveAddress'
import { ERC20Service } from 'services/erc20'
import { Token, TransferOptions } from 'util/types'

const FirstRow = styled(Row)`
  padding-top: 12px;
`

const ButtonContainerStyled = styled(ButtonContainer)`
  margin-top: 100px;
`

const LoadingWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 300px;
`

interface Props extends ModalProps {
  onSubmit: (transfer: TransferOptions) => void
  positionId: string
  collateralToken: string
  balance: BigNumber
}

export const TransferOutcomeTokensModal: React.FC<Props> = (props) => {
  const { balance, collateralToken, onRequestClose, onSubmit, positionId, ...restProps } = props

  const { CTService, provider } = useWeb3Connected()

  const activeAddress = useActiveAddress()

  const [token, setToken] = React.useState<Maybe<Token>>(null)
  const [amount, setAmount] = React.useState<BigNumber>(ZERO_BN)
  const [address, setAddress] = React.useState('')
  const [error, setError] = React.useState(false)
  const [isLoading, setLoading] = React.useState(true)

  const maxBalance = React.useMemo(() => (balance ? balance : ZERO_BN), [balance])

  const onClickTransfer = (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => {
    if (typeof onRequestClose === 'function') {
      onRequestClose(e)
    }
    const tokenBytes = '0x'
    onSubmit({ amount, address, positionId, tokenBytes })
  }

  const addressChangeHandler = React.useCallback((value: string) => {
    setAddress(value)
  }, [])

  const amountChangeHandler = React.useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])

  const errorChangeHandler = React.useCallback((value: boolean) => {
    setError(value)
  }, [])

  const useWalletHandler = React.useCallback(() => {
    if (maxBalance.gt(ZERO_BN)) {
      setAmount(maxBalance)
    }
  }, [maxBalance])

  const isAddressToSendTheConnectedUser = React.useMemo(
    () => activeAddress && activeAddress.toLowerCase() === address.toLowerCase(),
    [activeAddress, address]
  )

  React.useEffect(() => {
    let cancelled = false

    if (activeAddress) {
      setLoading(true)
      const fetchBalanceAndTokenInformation = async () => {
        const erc20Service = new ERC20Service(provider, collateralToken)
        const token = await erc20Service.getProfileSummary()
        if (!cancelled) {
          setToken(token)
          setLoading(false)
        }
      }
      fetchBalanceAndTokenInformation()
    }

    return () => {
      cancelled = true
    }
  }, [provider, activeAddress, CTService, positionId, collateralToken])

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={'Transfer Outcome Tokens'}
      {...restProps}
    >
      {isLoading && (
        <LoadingWrapper>
          <InlineLoading message="Loading balance..." />
        </LoadingWrapper>
      )}
      {!isLoading && (
        <>
          <FirstRow>
            <InputAddress
              address={address}
              onAddressChange={addressChangeHandler}
              onErrorChange={errorChangeHandler}
            />
          </FirstRow>
          {isAddressToSendTheConnectedUser && (
            <Row>
              <StatusInfoInline status={StatusInfoType.warning}>
                The SEND TO field is the current connected wallet
              </StatusInfoInline>
            </Row>
          )}
          {token && token.decimals && (
            <Row>
              <Amount
                amount={amount}
                balance={maxBalance}
                tokenWrappedDecimals={token.decimals}
                collateralDecimals={token.decimals}
                isFromAPosition={true}
                max={maxBalance.toString()}
                onAmountChange={amountChangeHandler}
                onUseWalletBalance={useWalletHandler}
                tokenSymbol={token.symbol}
              />
            </Row>
          )}
          <ButtonContainerStyled>
            <Button disabled={amount.isZero() || !address || error} onClick={onClickTransfer}>
              Transfer
            </Button>
          </ButtonContainerStyled>
        </>
      )}
    </Modal>
  )
}
