import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.header`
  display: flex;
  flex-direction: row;
  margin: 10px auto;
  justify-content: space-evenly;
`

export const Header = () => {
  return (
    <Wrapper>
      <Link to="/">Home</Link>
      <Link to="/conditions">Conditions</Link>
      <Link to="/split">Split Condition</Link>
    </Wrapper>
  )
}
