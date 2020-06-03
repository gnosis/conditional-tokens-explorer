import React from 'react'
import { useWeb3Connected } from '../../hooks/useWeb3Context'
import { PrepareConditionContainer } from '../prepare-condition'

export const ConnectedContainer = () => {
  const { networkConfig } = useWeb3Connected()

  const ctAddress = networkConfig.getConditionalTokenContract()

  return (
    <>
      <p>{ctAddress}</p>
      <PrepareConditionContainer></PrepareConditionContainer>
    </>
  )
}
