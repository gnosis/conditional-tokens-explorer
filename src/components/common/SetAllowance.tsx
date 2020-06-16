import React from 'react'
import styled from 'styled-components'

import { Token } from '../../config/networkConfig'

const Wrapper = styled.div``

const Title = styled.h2`
  font-size: 16px;
  letter-spacing: 0.4px;
  line-height: 1.2;
  margin: 0 0 20px;
`

const DescriptionWrapper = styled.div`
  align-items: center;
  border-radius: 4px;
  display: flex;
  padding: 21px 25px;
`

const Description = styled.p`
  font-size: 14px;
  letter-spacing: 0.2px;
  line-height: 1.4;
  margin: 0 25px 0 0;
`

interface Props {
  collateral: Token
  onUnlock: () => void
  loading: boolean
  finished: boolean
}

export const SetAllowance = (props: Props) => {
  const { collateral, onUnlock, loading, finished } = props

  const btnText = loading ? 'loading' : finished ? 'finished' : 'unlock'

  return (
    <Wrapper>
      <Title>Set Allowance</Title>
      <DescriptionWrapper>
        <Description>
          This permission allows the smart contracts to interact with your {collateral.symbol}. This
          has to be done for each new token.
        </Description>
        <button onClick={onUnlock} disabled={loading}>
          {btnText}
        </button>
        {/* <ToggleTokenLock finished={finished} loading={loading} onUnlock={onUnlock} /> */}
      </DescriptionWrapper>
    </Wrapper>
  )
}
