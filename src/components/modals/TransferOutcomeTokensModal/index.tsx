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
import { ZERO_BN } from 'config/constants'
import { useWeb3Connected } from 'contexts/Web3Context'
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
  onRequestClose?: () => void
  onSubmit: (transfer: TransferOptions) => void
  positionId: string
  collateralToken: string
}

export const TransferOutcomeTokensModal: React.FC<Props> = (props) => {
  const { collateralToken, onRequestClose, onSubmit, positionId, ...restProps } = props

  const { CTService, provider, signer } = useWeb3Connected()

  const [balance, setBalance] = React.useState<BigNumber>(ZERO_BN)
  const [token, setToken] = React.useState<Maybe<Token>>(null)
  const [amount, setAmount] = React.useState<BigNumber>(ZERO_BN)
  const [address, setAddress] = React.useState('')
  const [error, setError] = React.useState(false)
  const [isLoading, setLoading] = React.useState(true)

  const onClickTransfer = () => {
    if (typeof onRequestClose === 'function') {
      onRequestClose()
      onSubmit({ amount, address, positionId })
    }
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
    if (balance.gt(ZERO_BN)) {
      setAmount(balance)
    }
  }, [balance])

  React.useEffect(() => {
    let cancelled = false

    if (signer) {
      setLoading(true)
      const fetchBalanceAndTokenInformation = async () => {
        const balanceOfPositionId = await CTService.balanceOf(positionId)
        const erc20Service = new ERC20Service(provider, collateralToken)
        const token = await erc20Service.getProfileSummary()
        if (!cancelled) {
          setToken(token)
          setBalance(balanceOfPositionId)
          setLoading(false)
        }
      }
      fetchBalanceAndTokenInformation()
    }

    return () => {
      cancelled = true
    }
  }, [provider, signer, CTService, positionId, collateralToken])

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={'Transfer outcome tokens'}
      {...restProps}
    >
      {isLoading && (
        <LoadingWrapper>
          <InlineLoading message="Loading balance..." />
        </LoadingWrapper>
      )}
      {!isLoading && (
        <>
          <FirstRow cols="1fr">
            {token && token.decimals && (
              <Amount
                amount={amount}
                balance={balance}
                decimals={token.decimals}
                isFromAPosition={true}
                max={balance.toString()}
                onAmountChange={amountChangeHandler}
                onUseWalletBalance={useWalletHandler}
                tokenSymbol={'Outcome Tokens'}
              />
            )}
          </FirstRow>
          <Row cols="1fr">
            <InputAddress
              address={address}
              onAddressChange={addressChangeHandler}
              onErrorChange={errorChangeHandler}
            />
          </Row>
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
