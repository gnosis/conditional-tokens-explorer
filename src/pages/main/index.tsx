import React from 'react'
import { useWeb3Context } from '../../hooks/useWeb3Context'
import { DisconnectedContainer } from '../disconnected'
import { ConnectedContainer } from '../connected'

let renders = 0
export const Main = () => {
  renders++
  const { status } = useWeb3Context()

  console.log('Render_Main', renders)
  if (status._type === 'notAsked') {
    return <DisconnectedContainer></DisconnectedContainer>
  }
  if (status._type === 'connected') {
    return <ConnectedContainer></ConnectedContainer>
  } else {
    return null
  }
}
