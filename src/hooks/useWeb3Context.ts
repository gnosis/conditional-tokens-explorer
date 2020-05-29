import { useContext } from 'react'
import { Web3Context } from '../contexts/Web3Context'

export const useWeb3Context = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('Hook used outside web3 context provider')
  }
  return context
}

export const useWeb3Connected = () => {
  const { status } = useWeb3Context()
  if (status._type === 'connected') {
    return status
  }
  throw new Error('Hook used in a disconnected context')
}

export const useWeb3Disconnected = () => {
  const context = useWeb3Context()
  if (context.status._type === 'notAsked') {
    return context
  }
  throw new Error('Hook used in a connected context')
}
