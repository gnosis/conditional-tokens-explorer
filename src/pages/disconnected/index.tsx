import React from 'react'
import { useWeb3Disconnected } from '../../contexts/Web3Context'

export const Disconnected = () => {
  const { connect } = useWeb3Disconnected()
  return (
    <>
      <button onClick={connect}>Connect</button>
    </>
  )
}
