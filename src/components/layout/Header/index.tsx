import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonConnect } from 'components/buttons/ButtonConnect'
import { Logo } from 'components/common/Logo'
import { UserDropdown } from 'components/common/UserDropdown'
import { Web3ContextStatus, useWeb3Context } from 'contexts/Web3Context'

const Wrapper = styled.header`
  &.siteHeader {
    align-items: center;
    background-color: ${(props) => props.theme.header.backgroundColor};
    border-bottom: solid 1px #e8e7e6;
    display: flex;
    flex-shrink: 0;
    height: ${(props) => props.theme.header.height};
    justify-content: space-between;
    padding-left: ${(props) => props.theme.layout.horizontalPadding};
    padding-right: ${(props) => props.theme.layout.horizontalPadding};
  }
`

const LogoLink = styled(Link)`
  &.logoLink {
    text-decoration: none;
  }
`

export const Header: React.FC = (props) => {
  const { status } = useWeb3Context()
  const isConnecting = status._type === Web3ContextStatus.Connecting // this doesn't seem to work
  const isDisconnected =
    status._type === Web3ContextStatus.NotAsked || status._type === Web3ContextStatus.Infura

  return (
    <Wrapper className="siteHeader" {...props}>
      <LogoLink className="logoLink" to="/">
        <Logo />
      </LogoLink>
      {isDisconnected && <ButtonConnect disabled={isConnecting} />}
      {status._type === Web3ContextStatus.Connected && <UserDropdown />}
    </Wrapper>
  )
}
