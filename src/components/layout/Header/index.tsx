import { useWeb3Context } from 'contexts/Web3Context'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ButtonConnect } from '../../buttons/ButtonConnect'
import { Logo } from '../../common/Logo'

const Wrapper = styled.header`
  align-items: center;
  background-color: ${(props) => props.theme.header.backgroundColor};
  border-bottom: solid 1px #e8e7e6;
  display: flex;
  flex-shrink: 0;
  height: ${(props) => props.theme.header.height};
  justify-content: space-between;
  padding-left: ${(props) => props.theme.layout.horizontalPadding};
  padding-right: ${(props) => props.theme.layout.horizontalPadding};
  position: relative;
  z-index: 5;
`

const LogoLink = styled(Link)`
  text-decoration: none;
`

export const Header = () => {
  const { status } = useWeb3Context()
  const isConnecting = status._type === 'connecting' // this doesn't seem to work

  return (
    <Wrapper>
      <LogoLink to="/">
        <Logo />
      </LogoLink>
      {status._type === 'notAsked' && <ButtonConnect disabled={isConnecting} />}
      {status._type === 'connected' && <div>dropdown</div>}
    </Wrapper>
  )
}
