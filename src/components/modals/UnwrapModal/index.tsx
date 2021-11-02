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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getTokenBytecode } = require('1155-to-20-helper/src')

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
  tokenName?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accountTo?: any
}

export const UnwrapModal: React.FC<Props> = (props) => {
  const { CTService } = useWeb3ConnectedOrInfura()

  const {
    accountTo,
    balance,
    decimals,
    onRequestClose,
    onUnWrap,
    positionId,
    tokenName,
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

  const unWrap = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement>
    ) => {
      const tokenBytes = getTokenBytecode(tokenName, tokenSymbol, decimals)

      const unWrapValues = {
        address: CTService.address,
        positionId,
        amount,
        accountTo,
        tokenBytes,
      }

      if (isSubmitDisabled) return

      onUnWrap(unWrapValues)

      if (onRequestClose) onRequestClose(e)
    },
    [
      CTService,
      amount,
      isSubmitDisabled,
      onRequestClose,
      onUnWrap,
      positionId,
      tokenName,
      tokenSymbol,
      decimals,
      accountTo,
    ]
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
