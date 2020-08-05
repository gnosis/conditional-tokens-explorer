import React from 'react'
import styled from 'styled-components'

import { Button } from '../../buttons/Button'

const Wrapper = styled.div`
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.colors.primary};
  display: flex;
  margin-bottom: 25px;
  padding: 13px 16px;
`

const Description = styled.p`
  font-size: 15px;
  line-height: 1.4;
  margin: 0 15px 0 0;
  color: ${(props) => props.theme.colors.primary};
`

interface Props {
  collateral: any
  onUnlock: () => void
  loading: boolean
  finished: boolean
}

export const SetAllowance = (props: Props) => {
  const { collateral, finished, loading, onUnlock } = props
  const btnText = loading ? 'loading' : finished ? 'finished' : 'unlock'

  return (
    <Wrapper>
      <Description>
        You need to unlock <strong>{collateral.symbol}</strong> to allow the smart contract to
        interact with it. This has to be done for each new token.
      </Description>
      <Button disabled={loading || finished} onClick={onUnlock}>
        {btnText}
      </Button>
    </Wrapper>
  )
}
