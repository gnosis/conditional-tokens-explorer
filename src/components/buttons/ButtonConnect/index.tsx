import React from 'react'
import styled from 'styled-components'

import { useWeb3Disconnected } from '../../../contexts/Web3Context'

const Wrapper = styled.button``

export const ButtonConnect: React.FC = () => {
  const { connect } = useWeb3Disconnected()

  return <Wrapper onClick={connect}>Connect To Wallet</Wrapper>
}
