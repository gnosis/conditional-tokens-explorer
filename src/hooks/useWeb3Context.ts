import { useContext } from 'react'
import { Web3Context } from '../contexts/Web3Context'

export const useWeb3Context = () => {
  const { connect, connected, provider, signer } = useContext(Web3Context)

  return { connect, connected, provider, signer }
}
