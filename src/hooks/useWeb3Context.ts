import { useContext } from 'react'
import { Web3Context } from '../contexts/Web3Context'

export const useWeb3Context = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('[useWeb3Context] Hook not used under web3 context provider')
  }
  return context
}

export const useWeb3Connected = () => {
  const { status } = useWeb3Context()
  if (status._type === 'connected') {
    return status
  }
  throw new Error('[useWeb3Connected] Hook not used under a connected context')
}

export const useWeb3Disconnected = () => {
  const context = useWeb3Context()
  if (context.status._type === 'notAsked') {
    return context
  }
  throw new Error('[useWeb3Disconnected] Hook not used under a disconnected context')
}
