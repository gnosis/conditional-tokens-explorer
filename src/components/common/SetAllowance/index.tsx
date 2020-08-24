import React from 'react'
import styled from 'styled-components'

import { Button } from '../../buttons/Button'
import { ButtonType } from '../../buttons/buttonStylingTypes'
import { InlineLoading } from '../../statusInfo/InlineLoading'

const Wrapper = styled.div`
  align-items: center;
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.colors.primary};
  display: flex;
  margin-bottom: 25px;
  padding: 13px 16px;
`

const Description = styled.p`
  font-size: 15px;
  line-height: 1.2;
  margin: 0 10px 0 0;
  color: ${(props) => props.theme.colors.primary};
`

const UnlockButton = styled(Button)`
  font-size: 18px;
  height: 32px;
  min-width: 125px;
  padding-left: 15px;
  padding-right: 15px;
`

interface Props {
  collateral: any
  fetching: boolean
  finished: boolean
  onUnlock: () => void
}

export const SetAllowance = (props: Props) => {
  const { collateral, fetching, finished, onUnlock } = props
  const btnText = fetching ? 'Working...' : finished ? 'Done!' : 'Unlock'

  return (
    <Wrapper>
      {fetching ? (
        <InlineLoading height="30px" width="30px" />
      ) : (
        <>
          <Description>
            You need to unlock <strong>{collateral.symbol}</strong> to allow the smart contract to
            interact with it. This has to be done for each new token.
          </Description>
          <UnlockButton
            buttonType={ButtonType.primaryInverted}
            data-testid="unlock-btn"
            disabled={finished}
            onClick={onUnlock}
          >
            {btnText}
          </UnlockButton>
        </>
      )}
    </Wrapper>
  )
}
