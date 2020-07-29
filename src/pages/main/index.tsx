import { useWeb3Context } from 'contexts/Web3Context'
import { Connected } from 'pages/connected'
import { Disconnected } from 'pages/disconnected'
import React from 'react'

export const Main = () => {
  const { status } = useWeb3Context()
  if (status._type === 'notAsked') {
    return <Disconnected></Disconnected>
  }
  if (status._type === 'connected') {
    return <Connected></Connected>
  } else {
    return null
  }
}
