import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { InlineLoading } from 'components/statusInfo/InlineLoading'
import { StatusInfoInline, StatusInfoType } from 'components/statusInfo/StatusInfoInline'

const Wrapper = styled.div`
  align-items: center;
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.colors.primary};
  margin-bottom: 25px;
  padding: 13px 16px;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    display: flex;
  }
`

const Description = styled.p`
  color: ${(props) => props.theme.colors.primary};
  font-size: 15px;
  line-height: 1.2;
  margin: 0 10px 15px 0;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    margin-bottom: 0;
  }
`

const UnlockButton = styled(Button)`
  font-size: 18px;
  height: 32px;
  min-width: 125px;
  padding-left: 15px;
  padding-right: 15px;
  width: 100%;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    width: auto;
  }
`

const StatusInfo = styled(StatusInfoInline)`
  margin-bottom: 25px;
`

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collateral: any
  fetching: boolean
  finished: boolean
  error: Maybe<Error>
  onUnlock: () => void
}

export const SetAllowance = (props: Props) => {
  const { collateral, error, fetching, finished, onUnlock } = props
  const btnText = fetching ? 'Working...' : finished ? 'Done!' : 'Unlock'
  const tokenSymbol = collateral.symbol

  return finished ? (
    <StatusInfo status={StatusInfoType.success}>
      <strong>{tokenSymbol}</strong> has been unlocked, you can now interact with the smart
      contract.
    </StatusInfo>
  ) : error ? (
    <StatusInfo status={StatusInfoType.error}>
      There was a problem while trying to unlock {tokenSymbol}.
    </StatusInfo>
  ) : (
    <Wrapper>
      {fetching ? (
        <InlineLoading height="30px" width="30px" />
      ) : (
        <>
          <Description>
            You need to unlock <strong>{tokenSymbol}</strong> to allow the smart contract to
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
