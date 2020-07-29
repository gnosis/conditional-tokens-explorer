import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { Logo } from '../../common/Logo'

const Wrapper = styled.header`
  align-items: center;
  background-color: ${(props) => props.theme.header.backgroundColor};
  display: flex;
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
  return (
    <Wrapper>
      <LogoLink to="/">
        <Logo />
      </LogoLink>
    </Wrapper>
  )
}
