import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.header`
  background-color: ${(props) => props.theme.header.backgroundColor};
  height: ${(props) => props.theme.header.height};
`

export const Header = () => {
  return (
    <Wrapper>
      <Link to="/">Home</Link>
      <Link to="/conditions">Conditions</Link>
      <Link to="/positions">Positions</Link>
      <Link to="/split">Split Condition</Link>
    </Wrapper>
  )
}
