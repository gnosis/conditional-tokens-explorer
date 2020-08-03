import { darken } from 'polished'
import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { useWeb3Disconnected } from '../../../contexts/Web3Context'

import { ChevronRight } from './img/ChevronRight'

const Wrapper = styled.button`
  align-items: center;
  background: transparent;
  color: ${(props) => props.theme.colors.error};
  cursor: pointer;
  display: flex;
  font-size: 15px;
  font-weight: 400;
  height: 100%;
  line-height: 1.2;
  outline: none;
  padding: 0;
  border: none;

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }

  path {
    fill: ${(props) => props.theme.colors.error};
  }

  &:hover {
    color: ${(props) => darken(0.15, props.theme.colors.error)};

    path {
      fill: ${(props) => darken(0.15, props.theme.colors.error)};
    }
  }
`

const Text = styled.span`
  margin-right: 10px;
`

export const ButtonConnect: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { connect } = useWeb3Disconnected()

  return (
    <Wrapper {...props} onClick={connect}>
      <Text>Connect To Wallet</Text>
      <ChevronRight />
    </Wrapper>
  )
}
