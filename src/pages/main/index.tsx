import React from 'react'
import { useWeb3Context } from '../../hooks/useWeb3Context'
import { DisconnectedContainer } from '../disconnected'
import { ConnectedContainer } from '../connected'

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
