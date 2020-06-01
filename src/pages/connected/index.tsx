import React from 'react'
import { useWeb3Connected } from '../../hooks/useWeb3Context'

let renders = 0
export const ConnectedContainer = () => {
  renders++
  const { networkConfig } = useWeb3Connected()

  const ctAddress = networkConfig.getConditionalTokenContract()

  console.log('Render_ConnectedContainer', renders)

  return (
    <>
      <p>{ctAddress} </p>
    </>
  )
}
