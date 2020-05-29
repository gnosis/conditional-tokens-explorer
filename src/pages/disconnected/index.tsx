import React from 'react'
import { useWeb3Disconnected } from '../../hooks/useWeb3Context'

let renders = 0
export const DisconnectedContainer = () => {
  renders++
  const { connect } = useWeb3Disconnected()

  console.log('Render_DisconnectedContainer', renders)
  return (
    <>
      <button onClick={connect}>Connect</button>
    </>
  )
}
