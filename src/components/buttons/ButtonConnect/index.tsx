import { darken } from 'polished'
import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { ChevronRight } from 'components/icons/ChevronRight'
import { useWeb3Disconnected } from 'contexts/Web3Context'

const Wrapper = styled.button`
  &.buttonConnect {
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

    .fill {
      fill: ${(props) => props.theme.colors.error};
    }

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colors.error)};

      .fill {
        fill: ${(props) => darken(0.15, props.theme.colors.error)};
      }
    }
  }
`

const Text = styled.span`
  margin-right: 10px;
`

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export const ButtonConnect: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { className, ...restProps } = props
  const { connect } = useWeb3Disconnected()

  return (
    <Wrapper className={`buttonConnect ${className}`} onClick={connect} {...restProps}>
      <Text>Connect To Wallet</Text>
      <ChevronRight />
    </Wrapper>
  )
}
