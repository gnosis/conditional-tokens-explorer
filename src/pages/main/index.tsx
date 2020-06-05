import React from 'react'
import { DisconnectedContainer } from '../disconnected'
import { ConnectedContainer } from '../connected'
import { useWeb3Context } from '../../contexts/Web3Context'

export const Main = () => {
  const { status } = useWeb3Context()
  if (status._type === 'notAsked') {
    return <DisconnectedContainer></DisconnectedContainer>
  }
  if (status._type === 'connected') {
    return <ConnectedContainer></ConnectedContainer>
  } else {
    return null
  }
}
