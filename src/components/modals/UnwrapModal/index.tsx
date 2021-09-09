import { BigNumber } from 'ethers/utils'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons'
import { Modal, ModalProps } from 'components/common/Modal'
import { Amount } from 'components/form/Amount'
import { ButtonContainer } from 'components/pureStyledComponents/ButtonContainer'
import { Row } from 'components/pureStyledComponents/Row'
import { ZERO_BN } from 'config/constants'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { TransferOptions } from 'util/types'

const FirstRow = styled(Row)`
  padding-top: 12px;
`

const ButtonContainerStyled = styled(ButtonContainer)`
  margin-top: 100px;
`

interface Props extends ModalProps {
  positionId: string
  balance: BigNumber
  decimals: number
  onUnWrap: (transferValue: TransferOptions) => Promise<void>
  tokenSymbol?: string
}

export const UnwrapModal: React.FC<Props> = (props) => {
  const { CTService } = useWeb3ConnectedOrInfura()

  const {
    balance,
    decimals,
    onRequestClose,
    onUnWrap,
    positionId,
    tokenSymbol,
    ...restProps
  } = props

  const maxBalance = useMemo(() => (balance ? balance : ZERO_BN), [balance])

  const [amount, setAmount] = useState<BigNumber>(ZERO_BN)
  const amountChangeHandler = useCallback((value: BigNumber) => {
    setAmount(value)
  }, [])

  const useWalletHandler = useCallback(() => {
    if (maxBalance.gt(ZERO_BN)) {
      setAmount(maxBalance)
    }
  }, [maxBalance])

  const isSubmitDisabled = amount.isZero()

  const tokenBytes = '0x'

  const unWrap = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement>
    ) => {
      const unWrapValues = {
        amount,
        address: CTService.address,
        positionId,
        tokenBytes,
      }

      if (isSubmitDisabled) return

      onUnWrap(unWrapValues)

      if (onRequestClose) onRequestClose(e)
    },
    [CTService, amount, isSubmitDisabled, onRequestClose, onUnWrap, positionId]
  )

  const onPressEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') unWrap(e)
    },
    [unWrap]
  )

  return (
    <Modal
      onRequestClose={onRequestClose}
      style={{ content: { width: '500px' } }}
      title={'Unwrap ERC20'}
      {...restProps}
    >
      <FirstRow>
        <Amount
          amount={amount}
          autoFocus
          balance={maxBalance}
          decimals={decimals}
          isFromAPosition
          max={maxBalance.toString()}
          onAmountChange={amountChangeHandler}
          onKeyUp={onPressEnter}
          onUseWalletBalance={useWalletHandler}
          tokenSymbol={tokenSymbol}
        />
      </FirstRow>
      <ButtonContainerStyled>
        <Button disabled={isSubmitDisabled} onClick={unWrap}>
          Unwrap
        </Button>
      </ButtonContainerStyled>
    </Modal>
  )
}
